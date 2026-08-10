/* ============================================================
   Madhuri Dama — Portfolio interactions
   ============================================================ */
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var progress = document.getElementById('scrollProgress');
  var navAnchors = links ? links.querySelectorAll('a') : [];

  /* ---- mobile menu ---- */
  function closeMenu() {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  navAnchors.forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });

  /* ---- sections that have a matching nav link ---- */
  var sections = Array.prototype.filter.call(
    document.querySelectorAll('section[id]'),
    function (s) { return document.querySelector('.nav-links a[href="#' + s.id + '"]'); }
  );

  function setActive() {
    var pos = window.scrollY + window.innerHeight * 0.3;
    var current = sections[0];

    sections.forEach(function (s) {
      if (s.offsetTop <= pos) { current = s; }
    });

    // near the bottom of the page, force the last section active
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
      current = sections[sections.length - 1];
    }

    navAnchors.forEach(function (a) {
      a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id);
    });
  }

  /* ---- scroll progress bar (transform only, no layout work) ---- */
  function setProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progress.style.transform = 'scaleX(' + ratio + ')';
  }

  /* ---- one rAF-throttled handler for every scroll-driven update ---- */
  var ticking = false;

  function onScroll() {
    if (ticking) { return; }
    ticking = true;
    window.requestAnimationFrame(function () {
      nav.classList.toggle('scrolled', window.scrollY > 12);
      setProgress();
      setActive();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---- staggered scroll reveal ---- */
  var revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function (el) {
      // stagger cards within their own row rather than across the whole page
      var siblings = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(siblings, 3) * 90 + 'ms';
      observer.observe(el);
    });
  } else {
    revealItems.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- footer year ---- */
  var year = document.getElementById('year');
  if (year) { year.textContent = new Date().getFullYear(); }
})();
