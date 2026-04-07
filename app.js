// ==========================================
// FIREBASE CONFIGURATION & SECURITY APP CONFIG
// ==========================================
const AppConfig = Object.freeze({
    FIREBASE: {
        apiKey: "AIzaSyCzIGR7u-26-BvtUdm93eFdLxZspxUsyeE",
        authDomain: "iskcon-landing.firebaseapp.com",
        projectId: "iskcon-landing",
        storageBucket: "iskcon-landing.firebasestorage.app",
        messagingSenderId: "1069190369143",
        appId: "1:1069190369143:web:ccef834b66e48c3ff85b72"
    },
    COOLDOWN_HOURS: 24
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, query, where, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// 1. UI ANIMATIONS & SCROLL LOGIC
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // Reveal Skeletons and show Actual Content
    setTimeout(() => {
        const skeletons = document.querySelectorAll('.hide-on-load');
        const realElements = document.querySelectorAll('.show-on-load');
        
        realElements.forEach(el => { 
            el.classList.remove('opacity-0-init'); 
            el.style.opacity = '1'; 
        });

        skeletons.forEach(el => { 
            el.style.opacity = '0'; 
            setTimeout(() => el.style.display = 'none', 500); 
        });

        setTimeout(reveal, 100);

        // Horizontal Gallery Scroll
        const gallery = document.querySelector('.scroll-gallery');
        if (gallery) {
            let autoScrollInterval;
            
            const startAutoScroll = () => {
                clearInterval(autoScrollInterval); 
                autoScrollInterval = setInterval(() => {
                    const maxScrollLeft = gallery.scrollWidth - gallery.clientWidth;
                    const items = gallery.querySelectorAll('.gallery-item');
                    let scrollAmount = 300; 
                    
                    if(items.length > 0) {
                        scrollAmount = items[0].clientWidth + 40; 
                    }

                    if (Math.ceil(gallery.scrollLeft) >= maxScrollLeft - 20) {
                        gallery.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    }
                }, 2500); 
            };

            const stopAutoScroll = () => {
                clearInterval(autoScrollInterval);
            };

            startAutoScroll();

            gallery.addEventListener('mouseenter', stopAutoScroll);
            gallery.addEventListener('mouseleave', startAutoScroll);
            gallery.addEventListener('touchstart', stopAutoScroll, {passive: true});
            gallery.addEventListener('touchend', startAutoScroll, {passive: true});
        }
    }, 2000); 

    // Navbar Auto-Close Logic
    document.addEventListener('click', function(event) {
        const navbarNav = document.getElementById('navbarNav');
        const toggler = document.querySelector('.navbar-toggler');
        if (navbarNav.classList.contains('show') && !navbarNav.contains(event.target) && !toggler.contains(event.target)) {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarNav);
            if(bsCollapse) bsCollapse.hide();
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const navbarNav = document.getElementById('navbarNav');
            if (navbarNav.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarNav);
                if(bsCollapse) bsCollapse.hide();
            }
        });
    });

    // Play Store App Redirection Logic
    const playStoreLinks = document.querySelectorAll('.play-store-link');
    playStoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); 
            
            const packageId = 'iskcon.hadapsar';
            const webUrl = 'https://play.google.com/store/apps/details?id=' + packageId;
            const isAndroid = /android/i.test(navigator.userAgent || navigator.vendor || window.opera);
            
            if (isAndroid) {
                window.location.href = 'market://details?id=' + packageId;
                setTimeout(() => {
                    window.location.href = webUrl;
                }, 1500);
            } else {
                window.open(webUrl, '_blank');
            }
        });
    });
});

// Navbar Scroll Effect
const navbar = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 60) { navbar.classList.add('scrolled'); } else { navbar.classList.remove('scrolled'); }
});

// Scroll Reveal Logic
function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 50;  
        if (elementTop < windowHeight - elementVisible) { reveals[i].classList.add("active"); }
    }
}
window.addEventListener("scroll", reveal);
reveal();

// Smooth Scroll for Anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if(target) {
            const headerOffset = 100;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    });
});

// ==========================================
// 2. FIREBASE BACKEND & ANTI-SPAM LOGIC
// ==========================================
function militaryGradeSanitizer(str) {
    if(!str) return "";
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;")
              .replace(/'/g, "&#39;").replace(/"/g, "&quot;")
              .replace(/javascript:/gi, "blocked:")
              .replace(/onload=/gi, "blocked=")
              .replace(/onerror=/gi, "blocked=");
}

try {
    const app = initializeApp(AppConfig.FIREBASE);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const googleProvider = new GoogleAuthProvider();

    const viewAuth = document.getElementById('auth-view');
    const viewForm = document.getElementById('review-form-view');
    const btnGoogle = document.getElementById('btn-google-login');
    const btnSubmit = document.getElementById('btn-submit-review');
    const stars = document.querySelectorAll('#star-selector .fa-star');
    const feedback = document.getElementById('form-feedback');
    const container = document.getElementById('testimonial-container');
    
    const btnPrev = document.getElementById('carousel-btn-prev');
    const btnNext = document.getElementById('carousel-btn-next');
    
    let currentUser = null;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            viewAuth.style.display = 'none';
            viewForm.style.display = 'block';
            document.getElementById('user-name-display').textContent = militaryGradeSanitizer(user.displayName);
        } else {
            currentUser = null;
            viewAuth.style.display = 'block';
            viewForm.style.display = 'none';
        }
    });

    btnGoogle.addEventListener('click', async () => {
        try {
            btnGoogle.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Verifying...';
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            document.getElementById('auth-error').textContent = "Security verification failed: " + error.message;
            btnGoogle.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style="width: 24px;"> Verify & Continue with Google';
        }
    });

    stars.forEach(star => {
        star.addEventListener('click', function() {
            let val = parseInt(this.getAttribute('data-value'));
            document.getElementById('user-rating').value = val;
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= val) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    btnSubmit.addEventListener('click', async () => {
        const honeypot = document.getElementById('devotee-website').value;
        if(honeypot !== "") {
            feedback.textContent = "Thank you for your submission.";
            feedback.className = "mt-4 mb-0 fw-bold text-success fs-5";
            return; 
        }

        const lastSub = localStorage.getItem('lastReviewSub');
        if(lastSub) {
            const hoursPassed = (Date.now() - parseInt(lastSub)) / (1000 * 60 * 60);
            if(hoursPassed < AppConfig.COOLDOWN_HOURS) {
                feedback.textContent = `Please wait before submitting again. (Anti-Spam Lock)`;
                feedback.className = "mt-4 mb-0 fw-bold text-danger fs-5";
                return;
            }
        }

        const rawCity = document.getElementById('user-city').value.trim();
        const rawMsg = document.getElementById('user-message').value.trim();
        const rating = parseInt(document.getElementById('user-rating').value);

        if (!rating || !rawCity || !rawMsg) {
            feedback.textContent = "Please provide rating, city, and message.";
            feedback.className = "mt-4 mb-0 fw-bold text-danger fs-5";
            return;
        }

        if (rawMsg.length < 10) {
            feedback.textContent = "Message is too short. Please describe properly.";
            feedback.className = "mt-4 mb-0 fw-bold text-danger fs-5";
            return;
        }

        const cleanCity = militaryGradeSanitizer(rawCity);
        const cleanMsg = militaryGradeSanitizer(rawMsg);

        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Encrypting & Submitting...';

        try {
            await setDoc(doc(db, "reviews", currentUser.uid), {
                name: militaryGradeSanitizer(currentUser.displayName),
                uid: currentUser.uid,
                city: cleanCity,
                message: cleanMsg,
                rating: rating,
                status: "pending", 
                timestamp: serverTimestamp()
            });

            localStorage.setItem('lastReviewSub', Date.now().toString());

            feedback.textContent = "Hare Krishna! Review submitted securely for admin blessing.";
            feedback.className = "mt-4 mb-0 fw-bold text-success fs-5";
            
            setTimeout(() => {
                const modalElement = document.getElementById('reviewModal');
                // Accessing global bootstrap object loaded via CDN in index.html
                if (typeof bootstrap !== 'undefined') {
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if(modalInstance) modalInstance.hide();
                }
            }, 3000);

        } catch (error) {
            feedback.textContent = "Security Blocked: " + error.message;
            feedback.className = "mt-4 mb-0 fw-bold text-danger fs-5";
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = 'Submit for Blessing';
        }
    });

    const q = query(collection(db, "reviews"), where("status", "==", "approved"));
    onSnapshot(q, (snapshot) => {
        let html = '';
        let totalRating = 0;
        let count = 0;

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            totalRating += data.rating;
            
            const sName = militaryGradeSanitizer(data.name);
            const sCity = militaryGradeSanitizer(data.city);
            const sMsg = militaryGradeSanitizer(data.message);
            const safeRating = Math.min(Math.max(parseInt(data.rating), 1), 5); 

            let starsHtml = '';
            for(let i=1; i<=5; i++) {
                starsHtml += `<i class="fa-solid fa-star ${i <= safeRating ? 'text-warning' : 'text-secondary opacity-25'}"></i>`;
            }

            const activeClass = (count === 0) ? 'active' : '';
            
            html += `
                <div class="carousel-item ${activeClass}">
                    <div class="testimonial-card">
                        <i class="fa-solid fa-quote-left"></i>
                        <div class="mb-3 fs-3">${starsHtml}</div>
                        <p class="fs-3 text-muted fst-italic mb-4" style="line-height: 1.8;">"${sMsg}"</p>
                        <h4 class="fw-bold mb-0" style="color: var(--primary-dark);">${sName}</h4>
                        <p class="text-muted text-uppercase letter-spacing-1 mt-2 fs-5 fw-bold">${sCity}</p>
                    </div>
                </div>
            `;
            count++;
        });

        if (count > 0) {
            container.innerHTML = html;
            document.getElementById('total-devotees').textContent = count;
            document.getElementById('average-rating').textContent = (totalRating / count).toFixed(1);
            
            if(count <= 1) {
                btnPrev.style.display = 'none';
                btnNext.style.display = 'none';
            } else {
                btnPrev.style.display = 'flex';
                btnNext.style.display = 'flex';
            }

        } else {
            container.innerHTML = '<div class="text-center py-5 fs-3 text-muted fw-bold">Be the first to share your divine experience!</div>';
            btnPrev.style.display = 'none';
            btnNext.style.display = 'none';
        }
    }, (error) => {
        console.error("Firestore read error:", error);
    });

} catch(e) {
    console.error("Initialization Failed.", e);
}
