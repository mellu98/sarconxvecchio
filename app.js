/* ============================================================
   SARCONX — app.js
   Nav, mobile menu, reveals, ticker, spotlight cards,
   cookie consent, contact form.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- nav: solid on scroll ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add('solid');
    else nav.classList.remove('solid');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var menuClose = document.getElementById('menuClose');
  var mobileMenu = document.getElementById('mobileMenu');
  function setMenu(open) {
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(true); });
  menuClose.addEventListener('click', function () { setMenu(false); });
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });

  /* ---------- scroll reveals ---------- */
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach(function (el) { obs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('on'); });
  }

  /* ---------- animated number counters ---------- */
  var countEls = document.querySelectorAll('.stat b[data-count]');
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (reducedMotion) { el.textContent = target + suffix; return; }
    var duration = 1400;
    var startTime = null;
    function frame(now) {
      if (!startTime) startTime = now;
      var p = Math.min((now - startTime) / duration, 1);
      var val = Math.floor(easeOutCubic(p) * target);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(frame);
  }
  if (countEls.length) {
    if ('IntersectionObserver' in window) {
      var countObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animateCount(e.target); countObs.unobserve(e.target); }
        });
      }, { threshold: 0.3 });
      countEls.forEach(function (el) { countObs.observe(el); });
    } else {
      countEls.forEach(animateCount);
    }
  }

  /* ---------- hero shape parallax ---------- */
  var heroShape = document.querySelector('.hero-shape');
  if (heroShape && !reducedMotion) {
    var ticking = false;
    function updateHeroShape() {
      var offset = window.scrollY * 0.08;
      heroShape.style.transform = 'translateY(' + offset + 'px)';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateHeroShape);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- ticker: duplicate content for seamless loop ---------- */
  var track = document.getElementById('tickerTrack');
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- spotlight cards ---------- */
  document.querySelectorAll('.svc').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ============================================================
     COOKIE CONSENT — localStorage key: cookieConsent
     ============================================================ */
  var cookie = document.getElementById('cookie');
  if (cookie) {
    var stored = null;
    try { stored = localStorage.getItem('cookieConsent'); } catch (e) { /* storage unavailable */ }
    if (!stored) {
      setTimeout(function () { cookie.classList.add('show'); }, 1400);
    }
    function setConsent(value) {
      try { localStorage.setItem('cookieConsent', value); } catch (e) { /* storage unavailable */ }
      cookie.classList.remove('show');
    }
    document.getElementById('cookieAccept').addEventListener('click', function () { setConsent('accepted'); });
    document.getElementById('cookieReject').addEventListener('click', function () { setConsent('rejected'); });
  }

  /* ============================================================
     CONTACT FORM — dual-mode: PHP endpoint, Netlify Forms fallback
     ============================================================ */
  var form = document.getElementById('contactForm');
  if (form) {
    var msgBox = document.getElementById('formMsg');
    var successBox = document.getElementById('formSuccess');
    var submitBtn = document.getElementById('submitBtn');
    var btnLabel = document.getElementById('btnLabel');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showError(text) {
      msgBox.textContent = text;
      msgBox.classList.add('err');
    }
    function clearError() {
      msgBox.textContent = '';
      msgBox.classList.remove('err');
    }
    function showSuccess() {
      form.style.display = 'none';
      successBox.style.display = 'block';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearError();

      /* honeypot: bots fill it, humans never see it — fake success silently */
      if (form.website && form.website.value) { showSuccess(); return; }

      var nome = form.nome.value.trim();
      var email = form.email.value.trim();
      var azienda = form.azienda.value.trim();
      var messaggio = form.messaggio.value.trim();

      if (!nome || !email || !azienda || !messaggio) {
        showError('Compila tutti i campi prima di inviare.');
        return;
      }
      if (!emailRe.test(email)) {
        showError('Inserisci un indirizzo email valido.');
        return;
      }

      submitBtn.disabled = true;
      btnLabel.textContent = 'Invio in corso…';

      var payload = { nome: nome, email: email, azienda: azienda, messaggio: messaggio };

      /* 10s timeout so a stalled request never strands the disabled button */
      function timedFetch(url, options) {
        var ctrl = new AbortController();
        var timer = setTimeout(function () { ctrl.abort(); }, 10000);
        options.signal = ctrl.signal;
        return fetch(url, options).then(function (res) {
          clearTimeout(timer);
          return res;
        }, function (err) {
          clearTimeout(timer);
          throw err;
        });
      }

      /* PHP path: success ONLY on an explicit {"success":true} — a static
         host serves the .php source with HTTP 200, which must NOT count */
      function postPhp() {
        return timedFetch('send-email.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            if (res.ok && data.success === true) { return true; }
            throw new Error(data.message || 'php-endpoint-unavailable');
          });
        });
      }

      /* Netlify Forms path: URL-encoded POST to / (form carries data-netlify) */
      function postNetlify() {
        var body = new URLSearchParams();
        body.append('form-name', 'contatti');
        Object.keys(payload).forEach(function (k) { body.append(k, payload[k]); });
        return timedFetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        }).then(function (res) {
          if (res.ok) { return true; }
          throw new Error('netlify-endpoint-unavailable');
        });
      }

      postPhp()
        .catch(postNetlify)
        .then(showSuccess)
        .catch(function () {
          submitBtn.disabled = false;
          btnLabel.textContent = 'Richiedi una consulenza gratuita';
          showError('Invio non riuscito. Riprova tra poco, scrivici su WhatsApp al +39 334 134 0272 o a Info@sarconx.it.');
        });
    });
  }

  /* ============================================================
     CONTACT MODAL — open/close, focus trap, ESC, body scroll lock
     ============================================================ */
  var modal = document.getElementById('contactModal');
  if (modal) {
    var cmCard = modal.querySelector('.contact-modal-card');
    var cmTriggers = document.querySelectorAll('[data-contact-trigger]');
    var cmClosers = document.querySelectorAll('[data-contact-close]');
    var cmLastFocused = null;

    function openModal() {
      cmLastFocused = document.activeElement;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      setTimeout(function () {
        var first = modal.querySelector('input:not([type=hidden]),textarea,button');
        if (first) first.focus();
      }, 60);
    }
    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      if (cmLastFocused && cmLastFocused.focus) cmLastFocused.focus();
    }

    cmTriggers.forEach(function (t) {
      t.addEventListener('click', function (e) {
        e.preventDefault();
        // close mobile menu if open
        if (mobileMenu.classList.contains('open')) setMenu(false);
        openModal();
      });
    });
    cmClosers.forEach(function (c) { c.addEventListener('click', closeModal); });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    /* focus trap inside modal */
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = modal.querySelectorAll('input:not([type=hidden]):not([tabindex="-1"]),textarea,button,a[href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* ---------- modal form submit (nome/telefono/email/messaggio) ---------- */
    var cmForm = document.getElementById('cmForm');
    if (cmForm) {
      var cmMsgBox = document.getElementById('cmFormMsg');
      var cmEmailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      var cmTelRe = /^[+]?[\d\s().-]{6,}$/;

      function cmShowError(text) {
        cmMsgBox.textContent = text;
        cmMsgBox.classList.add('err');
      }
      function cmClearError() {
        cmMsgBox.textContent = '';
        cmMsgBox.classList.remove('err');
      }

      cmForm.addEventListener('submit', function (e) {
        e.preventDefault();
        cmClearError();

        if (cmForm.website && cmForm.website.value) {
          cmForm.reset();
          closeModal();
          return;
        }

        var nome = cmForm.nome.value.trim();
        var tel = cmForm.telefono.value.trim();
        var email = cmForm.email.value.trim();
        var messaggio = cmForm.messaggio.value.trim();

        if (!nome || !tel || !email || !messaggio) {
          cmShowError('Compila tutti i campi prima di inviare.');
          return;
        }
        if (!cmEmailRe.test(email)) {
          cmShowError('Inserisci un indirizzo email valido.');
          return;
        }
        if (!cmTelRe.test(tel)) {
          cmShowError('Inserisci un numero di telefono valido.');
          return;
        }

        var cmBtn = cmForm.querySelector('button[type=submit]');
        var cmBtnLabel = cmBtn.querySelector('span');
        var origLabel = cmBtnLabel.textContent;
        cmBtn.disabled = true;
        cmBtnLabel.textContent = 'Invio in corso…';

        var payload = { nome: nome, telefono: tel, email: email, messaggio: messaggio };

        function cmTimedFetch(url, options) {
          var ctrl = new AbortController();
          var timer = setTimeout(function () { ctrl.abort(); }, 10000);
          options.signal = ctrl.signal;
          return fetch(url, options).then(function (res) {
            clearTimeout(timer);
            return res;
          }, function (err) {
            clearTimeout(timer);
            throw err;
          });
        }
        function cmPostPhp() {
          return cmTimedFetch('send-email.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
              if (res.ok && data.success === true) return true;
              throw new Error(data.message || 'php-unavailable');
            });
          });
        }
        function cmPostNetlify() {
          var body = new URLSearchParams();
          body.append('form-name', 'contatti-modal');
          Object.keys(payload).forEach(function (k) { body.append(k, payload[k]); });
          return cmTimedFetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString()
          }).then(function (res) {
            if (res.ok) return true;
            throw new Error('netlify-unavailable');
          });
        }

        cmPostPhp()
          .catch(cmPostNetlify)
          .then(function () {
            cmForm.reset();
            closeModal();
          })
          .catch(function () {
            cmBtn.disabled = false;
            cmBtnLabel.textContent = origLabel;
            cmShowError('Invio non riuscito. Scrivici direttamente su WhatsApp al +39 334 134 0272 o a Info@sarconx.it.');
          });
      });
    }
  }

  /* ---------- footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
