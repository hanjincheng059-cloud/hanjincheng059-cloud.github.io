/**
 * Jincheng Han — Persistent music shell
 *
 * This script drives site-shell.html. The site content lives in an <iframe>;
 * this shell holds a single <audio> element that is NEVER destroyed when the
 * visitor navigates between pages, so the music plays uninterrupted.
 *
 * Responsibilities:
 *   - Attempt autoplay; if the browser blocks it, show a one-click unlock.
 *   - Keep the floating mini-player in sync (play/pause, time, progress, seek).
 *   - Highlight the active nav link as the iframe changes pages.
 *   - Run the mobile nav toggle for the shell-level nav.
 */

(function () {
  'use strict';

  var audio     = document.getElementById('bgAudio');
  var dock      = document.getElementById('audioDock');
  var playBtn   = document.getElementById('dockPlay');
  var progress  = document.getElementById('dockProgress');
  var fill      = document.getElementById('dockFill');
  var timeEl    = document.getElementById('dockTime');
  var unlockBtn = document.getElementById('audioUnlock');
  var toggleBtn = document.getElementById('dockToggle');
  var frame     = document.getElementById('siteFrame');
  var nav       = document.getElementById('nav');
  var navLinks  = document.getElementById('navLinks');
  var navToggle = document.getElementById('navToggle');

  var PLAY_ICON  = playBtn.dataset.playIcon  || '▶';
  var PAUSE_ICON = playBtn.dataset.pauseIcon || '❚❚';

  /* ---------- helpers ---------- */
  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    var m = Math.floor(t / 60);
    var s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' + s : s);
  }

  function setPlayingUI(isPlaying) {
    playBtn.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
    playBtn.setAttribute('aria-label', isPlaying
      ? (playBtn.dataset.pauseLabel || 'Pause')
      : (playBtn.dataset.playLabel || 'Play'));
    dock.classList.toggle('playing', isPlaying);
  }

  /* ---------- playback ---------- */
  function startPlayback() {
    var p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(function () {
        setPlayingUI(true);
        hideUnlock();
      }).catch(function () {
        // Still blocked — keep the unlock prompt visible.
        showUnlock();
      });
    } else {
      setPlayingUI(true);
      hideUnlock();
    }
  }

  playBtn.addEventListener('click', function () {
    if (audio.paused) { startPlayback(); }
    else { audio.pause(); setPlayingUI(false); }
  });

  audio.addEventListener('loadedmetadata', function () {
    timeEl.textContent = '0:00 / ' + fmt(audio.duration);
  });
  audio.addEventListener('timeupdate', function () {
    var pct = (audio.currentTime / audio.duration) * 100 || 0;
    fill.style.right = (100 - pct) + '%';
    timeEl.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
  });
  audio.addEventListener('play',  function () { setPlayingUI(true);  hideUnlock(); });
  audio.addEventListener('pause', function () { setPlayingUI(false); });

  // Seek by clicking the progress bar.
  progress.addEventListener('click', function (e) {
    var rect = progress.getBoundingClientRect();
    var ratio = (e.clientX - rect.left) / rect.width;
    if (isFinite(audio.duration)) audio.currentTime = ratio * audio.duration;
  });

  /* ---------- autoplay unlock ---------- */
  function showUnlock() { unlockBtn.classList.remove('hidden'); }
  function hideUnlock() { unlockBtn.classList.add('hidden'); }

  unlockBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    startPlayback();
  });

  // Any first interaction with the document also unlocks autoplay.
  function unlockOnInteract() {
    if (audio.paused) startPlayback();
    document.removeEventListener('click', unlockOnInteract);
    document.removeEventListener('keydown', unlockOnInteract);
    document.removeEventListener('touchstart', unlockOnInteract);
  }

  // Try autoplay right away. Browsers generally block unmuted autoplay before
  // a gesture, so we also listen for the first interaction as a fallback.
  startPlayback();
  setTimeout(function () {
    if (audio.paused) {
      showUnlock();
      document.addEventListener('click', unlockOnInteract, { once: true });
      document.addEventListener('keydown', unlockOnInteract, { once: true });
      document.addEventListener('touchstart', unlockOnInteract, { once: true });
    }
  }, 600);

  /* ---------- collapse / expand the dock ---------- */
  toggleBtn.addEventListener('click', function () {
    var collapsed = dock.classList.toggle('collapsed');
    toggleBtn.textContent = collapsed ? '›' : '‹';
    toggleBtn.setAttribute('aria-label', collapsed ? 'Expand player' : 'Collapse player');
  });

  /* ---------- active nav state as the iframe navigates ---------- */
  function setActiveByPath(path) {
    var file = (path.split('/').pop() || 'index.html').split(/[?#]/)[0];
    if (!file) file = 'index.html';
    document.querySelectorAll('#navLinks a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-page') === file);
    });
    document.title = 'Jincheng Han — site';

    // Try to mirror the loaded page's <title> for nicer browser tabs/history.
    try {
      var doc = frame.contentDocument;
      if (doc && doc.title) document.title = doc.title;
    } catch (err) { /* cross-origin — ignore */ }
  }

  frame.addEventListener('load', function () {
    try {
      var path = frame.contentWindow.location.pathname;
      setActiveByPath(path);
    } catch (err) { /* ignore */ }
  });

  /* ---------- mobile nav toggle (shell-level) ---------- */
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      var open = navLinks.classList.contains('open');
      navToggle.setAttribute('aria-expanded', open);
      navToggle.textContent = open ? '✕' : '☰';
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = '☰';
      });
    });
  }

  // Initial active state. Honour a deep-link like site-shell.html#cv.html
  // (set by the redirect from main.js) so the shell opens on the right page.
  (function applyInitialPage() {
    var hash = (location.hash || '').replace(/^#/, '');
    var requested = hash.split(/[?#]/)[0];
    var valid = requested && /\.html$/i.test(requested);
    if (valid && requested !== 'site-shell.html') {
      frame.setAttribute('src', requested);
    }
    setActiveByPath(valid ? requested : (frame.getAttribute('src') || 'index.html'));
  })();
})();
