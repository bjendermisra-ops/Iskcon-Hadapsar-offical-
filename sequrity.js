/**
 * security.js — ISKCON Hadapsar Protection Layer
 * © 2026 ISKCON Hadapsar. All Rights Reserved.
 * v3.0 — MILITARY-GRADE: Debugger Trap, Clipboard Nuking & Bulletproof Mobile Scroll
 */
(function (w, d, n) {
  'use strict';

  /* ── 1. BLOCK RIGHT-CLICK ── */
  d.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);

  /* ── 1.5 BLOCK COPY / CUT / PASTE (Data Leak Protection) ── */
  ['copy', 'cut', 'paste'].forEach(function(ev) {
    d.addEventListener(ev, function(e) {
      var tag = e.target ? e.target.tagName : '';
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
        e.preventDefault();
        if (e.clipboardData) { e.clipboardData.clearData(); }
      }
    }, false);
  });

  /* ── 2. BLOCK KEYBOARD INSPECTION SHORTCUTS ── */
  d.addEventListener('keydown', function (e) {
    var k     = e.key || '';
    var ctrl  = e.ctrlKey || e.metaKey;
    var shift = e.shiftKey;
    
    if (
      e.keyCode === 123 || k === 'F12' ||
      (ctrl && k.toLowerCase() === 'u') ||
      (ctrl && shift && k.toLowerCase() === 'i') ||
      (ctrl && shift && k.toLowerCase() === 'j') ||
      (ctrl && shift && k.toLowerCase() === 'c') ||
      (ctrl && k.toLowerCase() === 's') ||
      (ctrl && k.toLowerCase() === 'p') /* Block Print Shortcut */
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, false);

  /* ── 3. BLOCK IMAGE DRAG ── */
  d.addEventListener('dragstart', function (e) {
    if (e.target && e.target.nodeName === 'IMG') {
      e.preventDefault();
      return false;
    }
  }, false);

  /* ── 4. BLOCK PRINT & SCREENSHOT (Clipboard Nuke) ── */
  w.addEventListener('beforeprint', function (e) { e.preventDefault(); }, false);
  
  d.addEventListener('keydown', function (e) {
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      e.preventDefault();
      /* Empty clipboard if browser allows */
      if (n.clipboard && n.clipboard.writeText) { n.clipboard.writeText(''); }
      d.body.style.visibility = 'hidden';
      setTimeout(function () { d.body.style.visibility = 'visible'; }, 300);
    }
  }, false);
  
  d.addEventListener('keyup', function (e) {
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      if (n.clipboard && n.clipboard.writeText) { n.clipboard.writeText(''); }
    }
  });

  /* ── 5. ANTI-IFRAME (Clickjacking Protection) ── */
  try {
    if (w.self !== w.top) { w.top.location.replace(w.self.location.href); }
  } catch (err) { /* cross-origin — ignore */ }

  /* ── 6. BLOCK TEXT SELECTION (non-input) ── */
  d.addEventListener('selectstart', function (e) {
    var tag = e.target ? e.target.tagName : '';
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
      e.preventDefault();
    }
  }, false);

  /* ── 7. PROTECT IMAGES (With Bulletproof Scroll) ── */
  function protectImages() {
    d.querySelectorAll('img:not([data-secured])').forEach(function (img) {
      img.setAttribute('data-secured', 'true');
      img.setAttribute('draggable', 'false');
      img.setAttribute('oncontextmenu', 'return false');
      
      /* CSS Protection */
      img.style.webkitUserDrag     = 'none';
      img.style.webkitTouchCallout = 'none';
      img.style.userSelect         = 'none';
      img.style.webkitUserSelect   = 'none';

      /* Allow clicks only on linked images (like Play Store badge) */
      if (!img.closest('a, button, [role="button"]')) {
        /* This allows touch scroll to pass through the image to the background */
        img.style.pointerEvents = 'none';
      }
    });
  }

  /* ── 8. PROTECT CANVASES ── */
  function protectCanvas() {
    d.querySelectorAll('canvas:not([data-secured])').forEach(function (cv) {
      cv.setAttribute('data-secured', 'true');
      cv.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
    });
  }

  /* ── 9. IMAGE OVERLAY (Mobile Long-Press Fix) ── */
  function addImageOverlays() {
    d.querySelectorAll('img:not([data-protected-overlay])').forEach(function (img) {
      img.setAttribute('data-protected-overlay', '1');

      /* Skip linked/interactive images */
      if (img.closest('a, button, [role="button"]')) return;

      var wrap = img.parentElement;
      if (!wrap) return;
      if (w.getComputedStyle(wrap).position === 'static') {
        wrap.style.position = 'relative';
      }
      
      var overlay = d.createElement('div');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.className = 'img-sec-overlay';
      
      /* 
         CRITICAL FIX: 
         1. No 'pointer-events: none' so it absorbs long-press.
         2. background is transparent.
         3. Removed 'touchstart -> e.preventDefault()' which was breaking mobile scroll!
      */
      overlay.style.cssText = 'position:absolute;inset:0;z-index:1;-webkit-touch-callout:none;user-select:none;background:transparent;';
      
      overlay.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      overlay.addEventListener('dragstart', function(e) { e.preventDefault(); });

      wrap.appendChild(overlay);
    });
  }

  /* ── 10. CONSOLE BRAND STAMP ── */
  var g  = 'color:#ffd700;font-size:20px;font-weight:800;text-shadow: 0 2px 10px rgba(255,215,0,0.4);';
  var wl = 'color:#ff8c00;font-size:13px;font-weight:600;';
  var r  = 'color:#ef4444;font-size:13px;font-weight:700;';
  console.log('%c🙏 Hare Krishna! Welcome to ISKCON Hadapsar', g);
  console.log('%c© 2026 ISKCON Hadapsar — iskconhadapsar.online', wl);
  console.log('%c⚠ Security actively monitoring. Unauthorized tampering is strictly prohibited.', r);

  /* ── 11. ADVANCED DEVTOOLS DETECTION & DEBUGGER TRAP ── */
  var _dt = false;
  var trapActive = false;

  setInterval(function () {
    if (w.outerWidth - w.innerWidth > 160 || w.outerHeight - w.innerHeight > 160) {
      if (!_dt) { 
        _dt = true; 
        console.clear(); 
        console.log('%c🙏 Hare Krishna!', g); 
      }
    } else { 
      _dt = false; 
    }
  }, 2000);

  /* DevTools Freezer: Halts execution if a hacker forces DevTools open */
  function devToolsTrap() {
    if(trapActive) return;
    trapActive = true;
    setInterval(function() {
      var start = new Date();
      /* The debugger statement stops the thread ONLY if DevTools is open */
      debugger; 
      var end = new Date();
      if (end - start > 100) {
        /* They opened DevTools. Execute fallback logic here if needed. */
      }
    }, 1000);
  }
  devToolsTrap();

  /* ── 12. DOM TAMPERING PROTECTION ── */
  function _init() { protectImages(); protectCanvas(); addImageOverlays(); }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', _init);
  } else { _init(); }

  /* Re-protect if hacker tries to delete overlay from Elements tab */
  var _obs = new MutationObserver(function () { 
    protectImages(); 
    addImageOverlays(); 
    
    if(d.body && !d.body.style.webkitUserSelect) {
       d.body.style.webkitUserSelect = 'none';
    }
  });
  
  d.addEventListener('DOMContentLoaded', function () {
    if (d.body) {
      _obs.observe(d.body, { childList: true, subtree: true });
    }
  });

}(window, document, navigator));
