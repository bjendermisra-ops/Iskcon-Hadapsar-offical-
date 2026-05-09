/**
 * engine.js — ISKCON Hadapsar Divine 3D Engine
 * Three.js Sacred Scene + GSAP + Lenis + Cursor + Tilt + Magnetic
 * © 2026 ISKCON Hadapsar. All Rights Reserved.
 */
'use strict';

window.addEventListener('load', function () {

  /* ═══════════════════════════════════════════════════════════
     1. PAGE LOADER — HIDE AFTER ASSETS LOAD
  ═══════════════════════════════════════════════════════════ */
  var loader   = document.getElementById('page-loader');
  var fillBar  = document.querySelector('.loader-fill');
  var progress = 0;

  var _interval = setInterval(function () {
    progress += Math.random() * 18 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(_interval);
      if (fillBar) fillBar.style.width = '100%';
      setTimeout(function () {
        if (loader) {
          loader.style.opacity = '0';
          loader.style.visibility = 'hidden';
          setTimeout(function () { loader && loader.remove(); }, 600);
        }
        _initAll();
      }, 350);
    }
    if (fillBar) fillBar.style.width = Math.min(progress, 100) + '%';
  }, 70);

  /* ═══════════════════════════════════════════════════════════
     MASTER INIT
  ═══════════════════════════════════════════════════════════ */
  function _initAll() {
    _initLenis();
    _initThree();
    _initGSAP();
    _initCursor();
    _initTilt();
    _initMagnetic();
    _initNavbar();
    _initScrollProgress();
    _initCounters();
    _initParallaxOrbs();
  }

  /* ═══════════════════════════════════════════════════════════
     2. LENIS SMOOTH SCROLL
  ═══════════════════════════════════════════════════════════ */
  function _initLenis() {
    if (typeof Lenis === 'undefined') return;

    var lenis = new Lenis({
      duration:        1.4,
      easing:          function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel:     true,
      smoothTouch:     false,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    function _raf(time) {
      lenis.raf(time);
      requestAnimationFrame(_raf);
    }
    requestAnimationFrame(_raf);

    window.__lenis = lenis;

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     3. THREE.JS — DIVINE SACRED GEOMETRY BACKGROUND
  ═══════════════════════════════════════════════════════════ */
  function _initThree() {
    if (typeof THREE === 'undefined') return;

    var canvas   = document.getElementById('webgl-canvas');
    if (!canvas) return;

    var W         = window.innerWidth;
    var H         = window.innerHeight;
    var isMobile  = W < 768;
    var isLowEnd  = (navigator.hardwareConcurrency || 4) <= 4;

    /* Scene */
    var scene = new THREE.Scene();

    /* Camera */
    var camera = new THREE.PerspectiveCamera(68, W / H, 0.1, 1000);
    camera.position.set(0, 0, 5.5);

    /* Renderer */
    var renderer = new THREE.WebGLRenderer({
      canvas:          canvas,
      alpha:           true,
      antialias:       !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(W, H);

    /* ── LIGHTS ── */
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    var goldLight = new THREE.PointLight(0xffd700, 4, 40);
    goldLight.position.set(3, 4, 4);
    scene.add(goldLight);

    var saffronLight = new THREE.PointLight(0xff6b00, 2.5, 30);
    saffronLight.position.set(-4, -2, 2);
    scene.add(saffronLight);

    var deepBlueLight = new THREE.PointLight(0x3b82f6, 1.2, 25);
    deepBlueLight.position.set(0, -5, 1);
    scene.add(deepBlueLight);

    /* ── CENTRAL DIVINE ICOSAHEDRON WIREFRAME ── */
    var icoGeo = new THREE.IcosahedronGeometry(1.3, 2);
    var icoMat = new THREE.MeshPhongMaterial({
      color:             0xffd700,
      emissive:          0xff8c00,
      emissiveIntensity: 0.5,
      wireframe:         true,
      transparent:       true,
      opacity:           isMobile ? 0.07 : 0.11,
    });
    var divineSphere = new THREE.Mesh(icoGeo, icoMat);
    scene.add(divineSphere);

    /* ── TORUS RING 1 (Outer golden circle) ── */
    var tor1 = new THREE.Mesh(
      new THREE.TorusGeometry(3.0, 0.018, 18, 140),
      new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.22 })
    );
    tor1.rotation.x = Math.PI / 3.2;
    scene.add(tor1);

    /* ── TORUS RING 2 (Mid saffron ring) ── */
    var tor2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.014, 16, 110),
      new THREE.MeshBasicMaterial({ color: 0xff8c00, transparent: true, opacity: 0.18 })
    );
    tor2.rotation.x = -Math.PI / 5;
    tor2.rotation.z = Math.PI / 6;
    scene.add(tor2);

    /* ── TORUS RING 3 (Inner white micro ring) ── */
    var tor3 = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.01, 12, 90),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.09 })
    );
    tor3.rotation.y = Math.PI / 4;
    tor3.rotation.z = Math.PI / 3.5;
    scene.add(tor3);

    /* ── TORUS KNOT (Sacred Geometry — premium accent) ── */
    if (!isLowEnd && !isMobile) {
      var knotMesh = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.7, 0.06, 100, 8),
        new THREE.MeshPhongMaterial({
          color: 0xffd700,
          emissive: 0xff6b00,
          emissiveIntensity: 0.3,
          transparent: true,
          opacity: 0.12,
          wireframe: false,
        })
      );
      knotMesh.position.set(3.5, 2, -2);
      scene.add(knotMesh);
    }

    /* ── PARTICLE SYSTEM (Divine Stardust) ── */
    var pCount   = isLowEnd ? 600 : (isMobile ? 1200 : 3800);
    var pPos     = new Float32Array(pCount * 3);
    var pColors  = new Float32Array(pCount * 3);

    for (var i = 0; i < pCount; i++) {
      var i3   = i * 3;
      var phi  = Math.acos(2 * Math.random() - 1);
      var theta = Math.random() * Math.PI * 2;
      var r    = 4 + Math.random() * 11;

      pPos[i3]     = r * Math.sin(phi) * Math.cos(theta);
      pPos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i3 + 2] = r * Math.cos(phi);

      /* Gold → Saffron → White color mix */
      var t = Math.random();
      if (t < 0.45) {
        pColors[i3] = 1.0; pColors[i3+1] = 0.87; pColors[i3+2] = 0.1;   /* gold */
      } else if (t < 0.75) {
        pColors[i3] = 1.0; pColors[i3+1] = 0.52; pColors[i3+2] = 0.0;   /* saffron */
      } else {
        pColors[i3] = 0.88; pColors[i3+1] = 0.88; pColors[i3+2] = 1.0;  /* silver */
      }
    }

    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pColors, 3));

    var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size:            isMobile ? 0.05 : 0.03,
      vertexColors:    true,
      transparent:     true,
      opacity:         0.78,
      blending:        THREE.AdditiveBlending,
      depthWrite:      false,
      sizeAttenuation: true,
    }));
    scene.add(particles);

    /* ── GSAP SCROLL BINDINGS ── */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      gsap.to(particles.rotation, {
        y: Math.PI * 2,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.5 },
      });

      gsap.to(camera.position, {
        z: 2.8,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 2 },
      });

      gsap.to(divineSphere.rotation, {
        y: Math.PI * 4,
        z: Math.PI * 2,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 3 },
      });
    }

    /* ── MOUSE / GYROSCOPE PARALLAX ── */
    var mx = 0, my = 0, tx = 0, ty = 0;

    window.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth  - 0.5) * 0.55;
      my = -(e.clientY / window.innerHeight - 0.5) * 0.55;
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (e.touches.length > 0) {
        mx = (e.touches[0].clientX / window.innerWidth  - 0.5) * 0.3;
        my = -(e.touches[0].clientY / window.innerHeight - 0.5) * 0.3;
      }
    }, { passive: true });

    if (window.DeviceOrientationEvent && isMobile) {
      window.addEventListener('deviceorientation', function (e) {
        mx = ((e.gamma || 0) / 45) * 0.3;
        my = ((e.beta  || 0) / 45) * 0.25;
      }, { passive: true });
    }

    /* ── CLICK RIPPLE on canvas ── */
    window.addEventListener('click', function (e) {
      if (typeof gsap === 'undefined') return;
      /* Flash the icosahedron on click */
      gsap.to(icoMat, { opacity: 0.35, duration: 0.1, yoyo: true, repeat: 1,
        onComplete: function() { icoMat.opacity = isMobile ? 0.07 : 0.11; }
      });
    }, { passive: true });

    /* ── RENDER LOOP ── */
    var clock   = new THREE.Clock();
    var rafId;
    var pArr    = pGeo.attributes.position.array;
    var doWave  = !isLowEnd;

    function _animate() {
      rafId = requestAnimationFrame(_animate);
      var t = clock.getElapsedTime();

      /* Particle wave breathing */
      if (doWave) {
        for (var j = 0; j < pCount; j++) {
          var j3 = j * 3;
          pArr[j3 + 1] += Math.sin(t * 0.15 + pArr[j3] * 0.12) * 0.0012;
        }
        pGeo.attributes.position.needsUpdate = true;
      }

      /* Continuous object rotations */
      particles.rotation.y    += 0.00025;
      divineSphere.rotation.y += 0.0038;
      divineSphere.rotation.z += 0.0018;
      tor1.rotation.y         += 0.0018;
      tor1.rotation.z         += 0.0008;
      tor2.rotation.x         += 0.002;
      tor2.rotation.z         += 0.0025;
      tor3.rotation.y         += 0.003;
      tor3.rotation.x         += 0.0012;
      if (typeof knotMesh !== 'undefined') {
        knotMesh.rotation.x += 0.004;
        knotMesh.rotation.z += 0.003;
      }

      /* Orbiting divine lights */
      goldLight.position.x    = Math.sin(t * 0.42) * 5;
      goldLight.position.y    = Math.cos(t * 0.28) * 4;
      saffronLight.position.x = Math.cos(t * 0.35) * 4;
      saffronLight.position.z = Math.sin(t * 0.5)  * 3;

      /* Smooth camera mouse parallax */
      tx += (mx - tx) * 0.045;
      ty += (my - ty) * 0.045;
      camera.position.x = tx;
      camera.position.y = ty;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    _animate();

    /* Pause when tab hidden (save battery) */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        _animate();
      }
    });

    /* Resize */
    var _resizeT;
    window.addEventListener('resize', function () {
      clearTimeout(_resizeT);
      _resizeT = setTimeout(function () {
        var nW = window.innerWidth, nH = window.innerHeight;
        camera.aspect = nW / nH;
        camera.updateProjectionMatrix();
        renderer.setSize(nW, nH);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }, 150);
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     4. GSAP DOM ANIMATIONS
  ═══════════════════════════════════════════════════════════ */
  function _initGSAP() {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    /* ── HERO CINEMATIC ENTRANCE ── */
    var heroTl = gsap.timeline({ delay: 0.2 });
    heroTl
      .fromTo('.hero-eyebrow',    { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
      .fromTo('.hero-h1',         { y: 55, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }, '-=0.55')
      .fromTo('.hero-p',          { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .fromTo('.btn-group-hero',  { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.55')
      .fromTo('.trust-row',       { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .fromTo('.mockup-wrap',     { y: 70, opacity: 0, scale: 0.93 }, { y: 0, opacity: 1, scale: 1, duration: 1.3, ease: 'power3.out' }, '-=1.3')
      .fromTo('.info-strip',      { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.3');

    /* ── NAVBAR ITEMS ── */
    gsap.fromTo('.gsap-nav',      { y: -22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.25 });
    gsap.fromTo('.gsap-nav-item', { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.4 });

    /* ── SCROLL TRIGGERS: FADE UP ── */
    document.querySelectorAll('.gs-fade-up').forEach(function (el) {
      gsap.fromTo(el,
        { y: 65, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.05, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 89%', toggleActions: 'play none none none' } }
      );
    });

    /* ── SCROLL TRIGGERS: SCALE UP ── */
    document.querySelectorAll('.gs-scale-up').forEach(function (el) {
      gsap.fromTo(el,
        { scale: 0.86, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.1, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: el, start: 'top 89%', toggleActions: 'play none none none' } }
      );
    });

    /* ── SCROLL TRIGGERS: FADE LEFT (right to left reveal) ── */
    document.querySelectorAll('.gs-fade-left').forEach(function (el) {
      gsap.fromTo(el,
        { x: 65, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 89%', toggleActions: 'play none none none' } }
      );
    });

    /* ── SCROLL TRIGGERS: FADE RIGHT (left to right reveal) ── */
    document.querySelectorAll('.gs-fade-right').forEach(function (el) {
      gsap.fromTo(el,
        { x: -65, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 89%', toggleActions: 'play none none none' } }
      );
    });

    /* ── AARTI CARDS STAGGER ── */
    var timingCards = document.querySelectorAll('.gs-timing-card');
    if (timingCards.length) {
      gsap.fromTo(timingCards,
        { y: 55, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.85, stagger: 0.09, ease: 'power2.out',
          scrollTrigger: { trigger: '.timings-grid', start: 'top 82%' } }
      );
    }

    /* ── BENTO GRID STAGGER ── */
    var bentoItems = document.querySelectorAll('.gs-bento');
    if (bentoItems.length) {
      gsap.fromTo(bentoItems,
        { y: 40, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.9, stagger: 0.13, ease: 'power2.out',
          scrollTrigger: { trigger: '.feature-bento-grid', start: 'top 82%' } }
      );
    }

    /* ── SECTION HEADINGS CLIP REVEAL ── */
    document.querySelectorAll('.section-h2').forEach(function (h) {
      gsap.fromTo(h,
        { y: 45, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: h, start: 'top 92%' } }
      );
    });

    /* ── ABOUT IMAGE PARALLAX ── */
    gsap.to('.about-img-main img', {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: { trigger: '.about-section', start: 'top bottom', end: 'bottom top', scrub: 1.2 },
    });

    /* ── HERO SECTION PARALLAX ON SCROLL ── */
    gsap.to('.gs-hero-left', {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1.5 },
    });

    gsap.to('.gs-hero-right', {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 2 },
    });

    /* ── CONTACT SECTION ENTRANCE ── */
    var cCards = document.querySelectorAll('.c-card');
    if (cCards.length) {
      gsap.fromTo(cCards,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: '.contact-section', start: 'top 85%' } }
      );
    }

    /* ── FAQ ACCORDION ITEMS ── */
    var faqItems = document.querySelectorAll('.accordion-item');
    if (faqItems.length) {
      gsap.fromTo(faqItems,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.faq-section', start: 'top 80%' } }
      );
    }

    /* ── FOOTER BRAND ── */
    gsap.fromTo('footer',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: 'footer', start: 'top 95%' } }
    );
  }

  /* ═══════════════════════════════════════════════════════════
     5. CUSTOM CURSOR (Desktop only — non-touch devices)
  ═══════════════════════════════════════════════════════════ */
  function _initCursor() {
    if ('ontouchstart' in window) return;
    var dot  = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    var dx = 0, dy = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', function (e) {
      dx = e.clientX; dy = e.clientY;
    }, { passive: true });

    (function _animCursor() {
      rx += (dx - rx) * 0.13;
      ry += (dy - ry) * 0.13;
      dot.style.transform  = 'translate3d(' + dx + 'px,' + dy + 'px,0) translate(-50%,-50%)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(_animCursor);
    })();

    document.querySelectorAll('a,button,[role="button"],.timing-card,.bento,.about-card,.service-item').forEach(function (el) {
      el.addEventListener('mouseenter', function () { dot.classList.add('ch'); ring.classList.add('ch'); });
      el.addEventListener('mouseleave', function () { dot.classList.remove('ch'); ring.classList.remove('ch'); });
    });

    document.addEventListener('mousedown', function () { dot.classList.add('cc'); ring.classList.add('cc'); });
    document.addEventListener('mouseup',   function () { dot.classList.remove('cc'); ring.classList.remove('cc'); });
    document.addEventListener('mouseleave',function () { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter',function () { dot.style.opacity = '1'; ring.style.opacity = '1'; });
  }

  /* ═══════════════════════════════════════════════════════════
     6. 3D CARD TILT (Desktop)
  ═══════════════════════════════════════════════════════════ */
  function _initTilt() {
    if ('ontouchstart' in window) return;
    var cards = document.querySelectorAll('.timing-card,.bento,.about-card,.content-sidebar-card');

    cards.forEach(function (card) {
      var _rAF;

      card.addEventListener('mouseenter', function () {
        card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
      });

      card.addEventListener('mousemove', function (e) {
        cancelAnimationFrame(_rAF);
        _rAF = requestAnimationFrame(function () {
          var rect  = card.getBoundingClientRect();
          var xPct  = (e.clientX - rect.left) / rect.width  - 0.5;
          var yPct  = (e.clientY - rect.top)  / rect.height - 0.5;
          var rotX  = -yPct * 13;
          var rotY  =  xPct * 13;
          card.style.transform = 'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateZ(10px)';
          card.style.boxShadow = '0 25px 60px rgba(0,0,0,0.4), ' +
            ((xPct * 100 + 50) | 0) + 'px 0 30px rgba(255,215,0,0.08)';
        });
      });

      card.addEventListener('mouseleave', function () {
        cancelAnimationFrame(_rAF);
        card.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.55s ease';
        card.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        card.style.boxShadow  = '';
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     7. MAGNETIC BUTTONS (Desktop)
  ═══════════════════════════════════════════════════════════ */
  function _initMagnetic() {
    if ('ontouchstart' in window) return;
    document.querySelectorAll('.btn-primary-cta,.btn-secondary-cta,.btn-nav-cta').forEach(function (btn) {
      btn.addEventListener('mouseenter', function () {
        btn.style.transition = 'transform 0.12s ease';
      });
      btn.addEventListener('mousemove', function (e) {
        var r  = btn.getBoundingClientRect();
        var mx = e.clientX - r.left  - r.width  / 2;
        var my = e.clientY - r.top   - r.height / 2;
        btn.style.transform = 'translate(' + (mx * 0.28) + 'px,' + (my * 0.28) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
        btn.style.transform  = 'translate(0,0)';
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     8. NAVBAR — SCROLL HIDE/SHOW + GLASS EFFECT
  ═══════════════════════════════════════════════════════════ */
  function _initNavbar() {
    var nav  = document.getElementById('mainNav');
    if (!nav) return;
    var last = 0, ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var cur = window.scrollY;
          if (cur > 80) nav.classList.add('scrolled');
          else           nav.classList.remove('scrolled');
          if (cur > last && cur > 200) nav.classList.add('nav-hide');
          else                          nav.classList.remove('nav-hide');
          last    = cur;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     9. SCROLL PROGRESS BAR
  ═══════════════════════════════════════════════════════════ */
  function _initScrollProgress() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      var pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      bar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     10. ANIMATED STAT COUNTERS (on scroll into view)
  ═══════════════════════════════════════════════════════════ */
  function _initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el     = en.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var isFloat = target % 1 !== 0;
        var start   = 0;
        var dur     = 1800;
        var startT  = null;
        function _step(ts) {
          if (!startT) startT = ts;
          var prog = Math.min((ts - startT) / dur, 1);
          var val  = prog * target;
          el.textContent = isFloat ? val.toFixed(1) : Math.floor(val);
          if (prog < 1) requestAnimationFrame(_step);
          else el.textContent = isFloat ? target.toFixed(1) : target;
        }
        requestAnimationFrame(_step);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { obs.observe(c); });
  }

  /* ═══════════════════════════════════════════════════════════
     11. AMBIENT ORB PARALLAX (CSS glows follow scroll slightly)
  ═══════════════════════════════════════════════════════════ */
  function _initParallaxOrbs() {
    if (typeof gsap === 'undefined') return;
    var g1 = document.querySelector('.glow-1');
    var g2 = document.querySelector('.glow-2');
    var g3 = document.querySelector('.glow-3');

    if (g1) gsap.to(g1, { y: '-25%', ease: 'none',
      scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 2 } });
    if (g2) gsap.to(g2, { y: '-18%', x: '8%', ease: 'none',
      scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 3 } });
    if (g3) gsap.to(g3, { y: '-30%', x: '-5%', ease: 'none',
      scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 2.5 } });
  }

});
