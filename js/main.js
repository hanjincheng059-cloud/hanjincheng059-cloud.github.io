/**
 * Jincheng Han — Personal Academic Website
 * Main JavaScript — navigation, scroll effects, mobile menu
 */

(function () {
  'use strict';

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

})();
