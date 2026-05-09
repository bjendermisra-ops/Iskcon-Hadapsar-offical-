/**
 * security.js — ISKCON Hadapsar Protection Layer
 * © 2026 ISKCON Hadapsar. All Rights Reserved.
 * Unauthorized copying, redistribution strictly prohibited.
 */
(function (w, d) {
  'use strict';

  /* ── 1. BLOCK RIGHT-CLICK ── */
  d.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);

  /* ── 2. BLOCK KEYBOARD INSPECTION SHORTCUTS ── */
  d.addEventListener('keydown', function (e) {
    var k = e.key || '';
    var ctrl = e.ctrlKey || e.metaKey;
    var shift = e.shiftKey;
    if (
      e.keyCode === 123 || k === 'F12' ||
      (ctrl && k.toLowerCase() === 'u') ||
      (ctrl && shift && k.toLowerCase() === 'i') ||
      (ctrl && shift && k.toLowerCase() === 'j') ||
      (ctrl && shift && k.toLowerCase() === 'c') ||
      (ctrl && k.toLowerCase() === 's')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, false);

  /* ── 3. BLOCK IMAGE DRAG ── */
  d.addEventListener('dragstart', function (e) {
    if (e.target && e.target.nodeName === 'IMG') e.preventDefault();
  }, false);

  /* ── 4. BLOCK PRINT SCREEN / PRINT ── */
  w.addEventListener('beforeprint', function (e) { e.preventDefault(); }, false);
  d.addEventListener('keydown', function (e) {
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      e.preventDefault();
      d.body.style.visibility = 'hidden';
      setTimeout(function () { d.body.style.visibility = 'visible'; }, 300);
    }
  }, false);

  /* ── 5. ANTI-IFRAME EMBEDDING ── */
  try {
    if (w.self !== w.top) { w.top.location.href = w.self.location.href; }
  } catch (err) { /* cross-origin iframe: silently ignore */ }

  /* ── 6. BLOCK TEXT SELECTION (non-input elements) ── */
  d.addEventListener('selectstart', function (e) {
    var tag = e.target ? e.target.tagName : '';
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
      e.preventDefault();
    }
  }, false);

  /* ── 7. PROTECT ALL IMAGES (set attributes + CSS) ── */
  function protectImages() {
    d.querySelectorAll('img').forEach(function (img) {
      img.setAttribute('draggable', 'false');
      img.setAttribute('oncontextmenu', 'return false');
      img.style.webkitUserDrag = 'none';
      img.style.webkitTouchCallout = 'none';
      img.style.userSelect = 'none';
      img.style.pointerEvents = 'none';
    });
  }

  /* ── 8. PROTECT CANVASES ── */
  function protectCanvas() {
    d.querySelectorAll('canvas').forEach(function (cv) {
      cv.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
    });
  }

  /* ── 9. CONSOLE BRAND STAMP ── */
  var g = 'color:#ffd700;font-size:20px;font-weight:800;';
  var w2 = 'color:#ff8c00;font-size:13px;font-weight:600;';
  var r = 'color:#ef4444;font-size:13px;font-weight:700;';
  console.log('%c🙏 Hare Krishna! Welcome to ISKCON Hadapsar', g);
  console.log('%c© 2026 ISKCON Hadapsar — iskconhadapsar.online', w2);
  console.log('%c⚠ Unauthorized access, copying or redistribution is strictly prohibited.', r);

  /* ── 10. DEVTOOLS SIZE DETECTION ── */
  var _dt = false;
  function _detectDev() {
    var wt = 160;
    if (w.outerWidth - w.innerWidth > wt || w.outerHeight - w.innerHeight > wt) {
      if (!_dt) {
        _dt = true;
        console.clear();
        console.log('%c🙏 Hare Krishna! Please enjoy the darshan instead. 😊', g);
      }
    } else { _dt = false; }
  }
  setInterval(_detectDev, 2000);

  /* ── 11. OVERLAY DIV ON IMAGES (prevents save-as on mobile long-press) ── */
  function addImageOverlays() {
    d.querySelectorAll('img:not([data-protected])').forEach(function (img) {
      img.setAttribute('data-protected', '1');
      var wrap = img.parentElement;
      if (!wrap) return;
      if (getComputedStyle(wrap).position === 'static') {
        wrap.style.position = 'relative';
      }
      var overlay = d.createElement('div');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.style.cssText = 'position:absolute;inset:0;z-index:1;-webkit-touch-callout:none;';
      overlay.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      overlay.addEventListener('touchstart', function (e) { e.preventDefault(); }, { passive: false });
      wrap.appendChild(overlay);
    });
  }

  /* ── INIT ON DOM READY ── */
  function _init() {
    protectImages();
    protectCanvas();
    addImageOverlays();
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

  /* Re-protect after dynamic DOM changes (e.g. testimonials loaded from Firebase) */
  var _obs = new MutationObserver(function () {
    protectImages();
    addImageOverlays();
  });
  d.addEventListener('DOMContentLoaded', function () {
    _obs.observe(d.body, { childList: true, subtree: true });
  });

}(window, document));
