// ── ANTI-COPY / ANTI-INSPECT ───────────────────────────────
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('dragstart', event => event.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'c' || e.key === 'p')) e.preventDefault();
    if (e.key === 'F12') e.preventDefault();
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) e.preventDefault();
});

// ── AppConfig ──────────────────────────────────────────────
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
import { getFirestore, doc, setDoc, getDoc, deleteDoc, collection, query, where, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ── Anti-Bot Behavioral Tracking ───────────────────────────
let userIsHuman = false;
['mousemove','touchstart','keydown'].forEach(e => document.addEventListener(e, () => { userIsHuman = true; }, { once: true }));

// ── Sanitizer ──────────────────────────────────────────────
function sanitize(str) {
    if (!str) return "";
    return str.replace(/</g,"&lt;").replace(/>/g,"&gt;")
              .replace(/'/g,"&#39;").replace(/"/g,"&quot;")
              .replace(/javascript:/gi,"blocked:").replace(/on\w+=/gi,"blocked=");
}

// ── REVEAL on Scroll ───────────────────────────────────────
function reveal() {
    document.querySelectorAll('.reveal:not(.active)').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 60) {
            el.classList.add('active');
        }
    });
}
window.addEventListener('scroll', reveal, { passive: true });
reveal();

// ── Navbar scroll ──────────────────────────────────────────
const nav = document.getElementById('mainNav');
if(nav) {
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
}

// ── Close mobile menu on link click ───────────────────────
document.querySelectorAll('#navMenu a').forEach(a => {
    a.addEventListener('click', () => {
        if(typeof bootstrap !== 'undefined') {
            const m = bootstrap.Collapse.getInstance(document.getElementById('navMenu'));
            if (m) m.hide();
        }
    });
});

// ── Close mobile menu on outside click ────────────────────
document.addEventListener('click', e => {
    const menu = document.getElementById('navMenu');
    const tog = document.querySelector('.navbar-toggler');
    if (menu && tog && menu.classList.contains('show') && !menu.contains(e.target) && !tog.contains(e.target)) {
        if(typeof bootstrap !== 'undefined') {
            bootstrap.Collapse.getInstance(menu)?.hide();
        }
    }
});

// ── Smooth scroll ──────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const t = document.querySelector(a.getAttribute('href'));
        if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 100, behavior: 'smooth' }); }
    });
});

// ── Play Store link intercept ──────────────────────────────
document.querySelectorAll('.play-store-link').forEach(el => {
    el.addEventListener('click', e => {
        e.preventDefault();
        window.open('https://play.google.com/store/apps/details?id=iskcon.hadapsar', '_blank');
    });
});
const psImg = document.querySelector('img[src="assets/playstore-badge.png"]');
if (psImg) psImg.style.cursor = 'pointer';

// ── Gallery autoscroll (ENHANCED: 1 SEC, PERFECT SNAP) ─────
const gallery = document.querySelector('.scroll-gallery');
if (gallery) {
    let iv;
    const scroll = () => {
        const max = gallery.scrollWidth - gallery.clientWidth;
        const w = (gallery.querySelector('.g-item')?.offsetWidth || 300) + 20; 
        if (gallery.scrollLeft >= max - 10) {
            gallery.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            gallery.scrollBy({ left: w, behavior: 'smooth' });
        }
    };
    const start = () => { clearInterval(iv); iv = setInterval(scroll, 1000); };
    const stop = () => clearInterval(iv);
    start();
    gallery.addEventListener('mouseenter', stop);
    gallery.addEventListener('mouseleave', start);
    gallery.addEventListener('touchstart', stop, { passive:true });
    gallery.addEventListener('touchend', start, { passive:true });
}

// ── Firebase ───────────────────────────────────────────────
try {
    const app = initializeApp(AppConfig.FIREBASE);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const provider = new GoogleAuthProvider();
    let currentUser = null;
    let isEdit = false;

    onAuthStateChanged(auth, async user => {
        if (user) {
            currentUser = user;
            document.getElementById('auth-view').style.display = 'none';
            document.getElementById('review-form-view').style.display = 'block';
            document.getElementById('user-name-display').textContent = sanitize(user.displayName);
            try {
                const snap = await getDoc(doc(db, "reviews", user.uid));
                if (snap.exists()) {
                    isEdit = true;
                    const d = snap.data();
                    document.getElementById('custom-display-name').value = d.name;
                    document.getElementById('user-city').value = d.city;
                    document.getElementById('user-message').value = d.message;
                    document.getElementById('user-rating').value = d.rating;
                    
                    document.getElementById('edit-badge').style.display = 'block';
                    document.getElementById('btn-delete-review').style.display = 'inline-block';
                    document.getElementById('btn-submit-review').innerHTML = 'Update & Publish Real-Time';
                    
                    document.querySelectorAll('#star-selector i').forEach(s => {
                        s.classList.toggle('active', parseInt(s.dataset.value) <= d.rating);
                    });
                } else {
                    document.getElementById('custom-display-name').value = sanitize(user.displayName);
                    document.getElementById('edit-badge').style.display = 'none';
                    document.getElementById('btn-delete-review').style.display = 'none';
                }
            } catch(e) { console.error(e); }
        } else {
            currentUser = null;
            document.getElementById('auth-view').style.display = 'block';
            document.getElementById('review-form-view').style.display = 'none';
        }
    });

    const btnGoogleLogin = document.getElementById('btn-google-login');
    if(btnGoogleLogin) {
        btnGoogleLogin.addEventListener('click', async () => {
            const btn = document.getElementById('btn-google-login');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Verifying...';
            try { await signInWithPopup(auth, provider); }
            catch(err) {
                document.getElementById('auth-error').textContent = "Login failed: " + err.message;
                btn.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" style="width:22px;" alt="Google"> Verify & Continue with Google';
            }
        });
    }

    document.querySelectorAll('#star-selector i').forEach(star => {
        star.addEventListener('click', function() {
            const v = parseInt(this.dataset.value);
            document.getElementById('user-rating').value = v;
            document.querySelectorAll('#star-selector i').forEach(s => s.classList.toggle('active', parseInt(s.dataset.value) <= v));
        });
    });

    const btnSubmitReview = document.getElementById('btn-submit-review');
    if(btnSubmitReview) {
        btnSubmitReview.addEventListener('click', async () => {
            if (!userIsHuman) return;
            if (document.getElementById('devotee-website').value) return; 

            const fb = document.getElementById('form-feedback');
            if (!isEdit) {
                const last = localStorage.getItem('lastReviewSub');
                if (last && (Date.now() - parseInt(last)) / 3600000 < AppConfig.COOLDOWN_HOURS) {
                    fb.textContent = "Please wait before submitting again. (Anti-Spam Lock)";
                    fb.style.color = "#ef4444"; return;
                }
            }

            const name = document.getElementById('custom-display-name').value.trim() || currentUser.displayName;
            const city = document.getElementById('user-city').value.trim();
            const msg = document.getElementById('user-message').value.trim();
            const rating = parseInt(document.getElementById('user-rating').value);

            if (!rating || !city || !msg || !name) {
                fb.textContent = "Please fill in your name, rating, city, and message.";
                fb.style.color = "#ef4444"; return;
            }

            const btn = document.getElementById('btn-submit-review');
            btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Publishing...';

            try {
                await setDoc(doc(db, "reviews", currentUser.uid), {
                    name: sanitize(name), uid: currentUser.uid, email: currentUser.email,
                    city: sanitize(city), message: sanitize(msg), rating,
                    status: "approved", timestamp: serverTimestamp()
                });
                localStorage.setItem('lastReviewSub', Date.now().toString());
                fb.textContent = isEdit ? "Hare Krishna! Review updated." : "Hare Krishna! Review published.";
                fb.style.color = "#22c55e";
                
                isEdit = true;
                document.getElementById('edit-badge').style.display = 'block';
                document.getElementById('btn-delete-review').style.display = 'inline-block';

                setTimeout(() => { 
                    if(typeof bootstrap !== 'undefined'){
                        bootstrap.Modal.getInstance(document.getElementById('reviewModal'))?.hide(); 
                    }
                }, 3000);
            } catch(err) {
                if(err.message.includes("Missing or insufficient permissions")) {
                    fb.innerHTML = "Error: Permission Denied. <br><span style='font-size:0.8rem; color:#f87171;'>*Admin: Please update Firebase Firestore Rules to allow write access.</span>";
                } else {
                    fb.textContent = "Error: " + err.message; 
                }
                fb.style.color = "#ef4444";
            } finally {
                btn.disabled = false; btn.innerHTML = 'Update & Publish Real-Time';
            }
        });
    }

    const btnDeleteReview = document.getElementById('btn-delete-review');
    if(btnDeleteReview) {
        btnDeleteReview.addEventListener('click', async () => {
            if (!confirm('Hare Krishna! Are you sure you want to permanently delete your review?')) return;
            
            const btnDel = document.getElementById('btn-delete-review');
            const fb = document.getElementById('form-feedback');
            
            btnDel.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            btnDel.disabled = true;

            try {
                await deleteDoc(doc(db, "reviews", currentUser.uid));
                fb.textContent = "Your review has been successfully removed.";
                fb.style.color = "#22c55e";
                
                setTimeout(() => {
                    document.getElementById('edit-badge').style.display = 'none';
                    document.getElementById('btn-delete-review').style.display = 'none';
                    document.getElementById('custom-display-name').value = sanitize(currentUser.displayName);
                    document.getElementById('user-city').value = '';
                    document.getElementById('user-message').value = '';
                    document.getElementById('user-rating').value = '0';
                    document.querySelectorAll('#star-selector i').forEach(s => s.classList.remove('active'));
                    isEdit = false;
                    document.getElementById('btn-submit-review').innerHTML = 'Submit & Publish Real-Time';
                    fb.textContent = "";
                    if(typeof bootstrap !== 'undefined'){
                        bootstrap.Modal.getInstance(document.getElementById('reviewModal'))?.hide();
                    }
                }, 2000);
            } catch(err) {
                fb.textContent = "Error deleting review: " + err.message;
                fb.style.color = "#ef4444";
            } finally {
                btnDel.innerHTML = '<i class="fa-solid fa-trash"></i>';
                btnDel.disabled = false;
            }
        });
    }

    // Real-time reviews
    onSnapshot(query(collection(db, "reviews"), where("status","==","approved")), snap => {
        let html = '', count = 0, total = 0;
        snap.forEach(d => {
            const data = d.data();
            total += data.rating; count++;
            const r = Math.min(Math.max(parseInt(data.rating),1),5);
            const stars = Array.from({length:5},(_,i)=>`<i class="fa-solid fa-star" style="color:${i<r?'var(--gold)':'rgba(255,255,255,0.15)'};font-size:1.2rem;margin:0 2px;"></i>`).join('');
            html += `<div class="carousel-item ${count===1?'active':''}">
                <div class="t-card" style="max-width:760px;margin:0 auto;">
                    <i class="fa-solid fa-quote-left"></i>
                    <div style="margin-bottom:12px;">${stars}</div>
                    <p>"${sanitize(data.message)}"</p>
                    <h5>${sanitize(data.name)}</h5>
                    <div class="city">${sanitize(data.city)}</div>
                </div>
            </div>`;
        });
        if (count > 0) {
            document.getElementById('testimonial-container').innerHTML = html;
            document.getElementById('total-devotees').textContent = count;
            document.getElementById('average-rating').textContent = (total/count).toFixed(1);
            document.getElementById('carousel-btn-prev').style.display = count>1?'flex':'none';
            document.getElementById('carousel-btn-next').style.display = count>1?'flex':'none';
        } else {
            document.getElementById('testimonial-container').innerHTML = '<div class="t-card" style="max-width:760px;margin:0 auto;color:rgba(255,255,255,0.5);font-size:1.1rem;">Be the first to share your divine experience at ISKCON Hadapsar!</div>';
            document.getElementById('total-devotees').textContent = "0";
            document.getElementById('average-rating').textContent = "0.0";
        }
    }, err => console.error(err));
} catch(e) { console.error("Firebase Init Error:", e); }
