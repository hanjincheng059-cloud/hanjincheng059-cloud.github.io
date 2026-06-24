/**
 * Jincheng Han — Personal Academic Website
 * Main JavaScript — navigation, scroll effects, mobile menu
 */

(function () {
  'use strict';

  // --- Enter the persistent-music shell if opened as a top-level page ---
  // The music lives in site-shell.html and is only continuous there. When a
  // visitor lands directly on a page (bookmark, link, refresh), bounce them
  // into the shell at the same page, unless we are ALREADY inside the shell.
  if (window.top === window.self) {
    var path = location.pathname.split('/').pop() || 'index.html';
    var hash = location.hash || '';
    // Avoid an infinite loop: only redirect to the shell, which itself is
    // never a top-level "content" page target.
    if (path !== 'site-shell.html') {
      try {
        // Preserve the requested page so the shell opens it directly.
        location.replace('site-shell.html#' + path + hash);
        return; // stop further execution; page is navigating away
      } catch (e) { /* ignore */ }
    }
  }

  // --- When embedded inside the music shell's iframe, hide THIS page's own
  //     nav bar (the shell already provides one) and drop the top padding it
  //     reserved for itself. Add the marker ASAP to avoid a layout flash.
  if (window.top !== window.self) {
    var embeddedClass = 'embedded-in-shell';
    document.documentElement.classList.add(embeddedClass);
    document.addEventListener('DOMContentLoaded', function () {
      document.documentElement.classList.add(embeddedClass);
    });
  }

  // --- DOM refs ---
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const backTop = document.getElementById('backTop');

  // --- Mobile nav toggle ---
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      const expanded = navLinks.classList.contains('open');
      navToggle.setAttribute('aria-expanded', expanded);
      navToggle.textContent = expanded ? '✕' : '☰';
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = '☰';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = '☰';
      }
    });
  }

  // --- Scroll effects ---
  var ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        var scrollY = window.pageYOffset || document.documentElement.scrollTop;

        // Nav shadow on scroll
        if (nav) {
          if (scrollY > 10) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
        }

        // Back-to-top button
        if (backTop) {
          if (scrollY > 500) {
            backTop.classList.add('visible');
          } else {
            backTop.classList.remove('visible');
          }
        }

        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // --- Back to top ---
  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Smooth scroll for same-page anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Active nav link highlight based on current page ---
  (function () {
    var currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (!currentPath.endsWith('.html')) currentPath = 'index.html';

    if (navLinks) {
      navLinks.querySelectorAll('a').forEach(function (link) {
        var href = link.getAttribute('href');
        if (href === currentPath) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  })();

  // --- Custom audio player ---
  (function () {
    document.querySelectorAll('.audio-interlude').forEach(function (root) {
      var audio = root.querySelector('audio');
      var playBtn = root.querySelector('.audio-play');
      var progress = root.querySelector('.audio-progress');
      var fill = root.querySelector('.ai-fill');
      var timeEl = root.querySelector('.audio-time');
      if (!audio || !playBtn) return;

      var playIcon = playBtn.dataset.playIcon || '▶';
      var pauseIcon = playBtn.dataset.pauseIcon || '❚❚';

      function fmt(t) {
        if (!isFinite(t) || t < 0) t = 0;
        var m = Math.floor(t / 60);
        var s = Math.floor(t % 60);
        return m + ':' + (s < 10 ? '0' + s : s);
      }

      audio.addEventListener('loadedmetadata', function () {
        timeEl.textContent = '0:00 / ' + fmt(audio.duration);
      });
      audio.addEventListener('timeupdate', function () {
        var pct = (audio.currentTime / audio.duration) * 100 || 0;
        fill.style.right = (100 - pct) + '%';
        timeEl.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
      });
      audio.addEventListener('ended', function () {
        playBtn.innerHTML = playIcon;
        playBtn.setAttribute('aria-label', playBtn.dataset.playLabel || 'Play');
        fill.style.right = '100%';
      });

      playBtn.addEventListener('click', function () {
        document.querySelectorAll('audio').forEach(function (a) {
          if (a !== audio) { a.pause(); }
        });
        if (audio.paused) {
          audio.play();
          playBtn.innerHTML = pauseIcon;
          playBtn.setAttribute('aria-label', playBtn.dataset.pauseLabel || 'Pause');
        } else {
          audio.pause();
          playBtn.innerHTML = playIcon;
          playBtn.setAttribute('aria-label', playBtn.dataset.playLabel || 'Play');
        }
      });

      progress.addEventListener('click', function (e) {
        var rect = progress.getBoundingClientRect();
        var ratio = (e.clientX - rect.left) / rect.width;
        if (isFinite(audio.duration)) {
          audio.currentTime = ratio * audio.duration;
        }
      });
    });
  })();

})();
