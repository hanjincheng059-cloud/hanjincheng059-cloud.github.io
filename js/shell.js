/**
 * Jincheng Han — Persistent music shell
 *
 * This script drives site-shell.html. The site content lives in an <iframe>;
 * this shell holds a single <audio> element that is NEVER destroyed when the
 * visitor navigates between pages, so the music plays uninterrupted.
 *
 * Autoplay strategy (browser-safe):
 *   Browsers block autoplay WITH sound until the user interacts with the page,
 *   but they ALLOW muted autoplay. So we start the audio MUTED right away, and
 *   unmute on the very first user gesture anywhere (click/touch/keydown). This
 *   makes the music "start by itself" on entry.
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

  var unmuted = false; // has the user's first gesture unmuted us yet?

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

  function setMutedUI(muted) {
    dock.classList.toggle('is-muted', muted);
  }

  /* ---------- playback ---------- */
  // Start playback. We keep it muted until a gesture unmutes it, so the
  // browser's autoplay policy never blocks us.
  function startPlayback() {
    audio.muted = !unmuted; // muted if not yet unlocked by a gesture
    var p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(function () {
        setPlayingUI(true);
      }).catch(function () {
        // Even muted autoplay can fail on a few strict browsers; show the
        // unlock button as a fallback.
        showUnlock();
      });
    } else {
      setPlayingUI(true);
    }
  }

  // Unmute as soon as the browser allows (after a gesture).
  function unmute() {
    if (unmuted) return;
    unmuted = true;
    audio.muted = false;
    setMutedUI(false);
    hideUnlock();
    // Make sure it is actually playing.
    if (audio.paused) startPlayback();
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
  audio.addEventListener('play',  function () { setPlayingUI(true); });
  audio.addEventListener('pause', function () { setPlayingUI(false); });

  // Seek by clicking the progress bar.
  progress.addEventListener('click', function (e) {
    var rect = progress.getBoundingClientRect();
    var ratio = (e.clientX - rect.left) / rect.width;
    if (isFinite(audio.duration)) audio.currentTime = ratio * audio.duration;
  });

  /* ---------- unmute prompt + first-gesture unlock ---------- */
  function showUnlock() { unlockBtn.classList.remove('hidden'); }
  function hideUnlock() { unlockBtn.classList.add('hidden'); }

  // Clicking the prompt itself counts as a gesture -> unmute + play.
  unlockBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    unmute();
  });

  // The very first interaction ANYWHERE on the shell (or inside the iframe)
  // unmutes the music. This is the key to "music starts on its own".
  function onFirstGesture() {
    unmute();
    document.removeEventListener('click', onFirstGesture, true);
    document.removeEventListener('touchstart', onFirstGesture, true);
    document.removeEventListener('keydown', onFirstGesture, true);
  }
  // Capture phase + window-level so clicks inside the iframe bubble up via
  // the iframe element's own events on this document.
  ['click', 'touchstart', 'keydown'].forEach(function (evt) {
    document.addEventListener(evt, onFirstGesture, true);
  });

  /* ---------- start: muted autoplay immediately ---------- */
  audio.muted = true;
  setMutedUI(true);
  startPlayback();
  // If muted autoplay somehow failed, surface the one-click prompt.
  setTimeout(function () { if (audio.paused) showUnlock(); }, 700);

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
