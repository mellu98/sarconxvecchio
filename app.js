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

  /* ---------- scroll reveals ----------
     One observer, four vocabularies. The variant is chosen in the
     markup (.rv / .rv-rise / .rv-media / .rv-num); JS only decides
     WHEN, never HOW. .draw-line and .steps opt in to the same signal. */
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var REVEAL_SELECTOR = '.rv, .rv-rise, .rv-media, .rv-num, .draw-line, .steps';
  var reveals = document.querySelectorAll(REVEAL_SELECTOR);
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

  /* ---------- hero: ambient sweep over the project list ----------
     Nothing is hidden and nothing moves layout — a highlight walks the
     list so the column reads as alive. Pointer and keyboard focus win
     over the sweep (handled in CSS), and it stops entirely while the
     tab is hidden or the user has asked for reduced motion. */
  var heroLive = document.getElementById('heroLive');
  if (heroLive && !reducedMotion) {
    var hlItems = heroLive.querySelectorAll('.hl-item');
    if (hlItems.length) {
      var hlIndex = 0;
      var hlTimer = null;
      function hlStep() {
        hlItems.forEach(function (li, i) { li.classList.toggle('is-lit', i === hlIndex); });
        hlIndex = (hlIndex + 1) % hlItems.length;
      }
      function hlStart() {
        if (hlTimer) return;
        hlStep();
        hlTimer = setInterval(hlStep, 2200);
      }
      function hlStop() {
        clearInterval(hlTimer);
        hlTimer = null;
        hlItems.forEach(function (li) { li.classList.remove('is-lit'); });
      }
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) hlStop(); else hlStart();
      });
      /* hovering the list hands control to the user */
      heroLive.addEventListener('pointerenter', hlStop);
      heroLive.addEventListener('pointerleave', hlStart);
      heroLive.addEventListener('focusin', hlStop);
      heroLive.addEventListener('focusout', hlStart);

      /* --- scroll takes the wheel ---
         The ambient timer is a clock: it repeats whatever you do. Bound
         to scroll instead, the list answers to the reader — you move,
         it moves. The timer only comes back once scrolling stops, so
         the column is never dead. Requires GSAP; without it the plain
         interval above is still a perfectly good hero. */
      if (window.gsap && window.ScrollTrigger) {
        var scrubIdle = null;
        ScrollTrigger.create({
          trigger: '#hero',
          start: 'top top',
          end: 'bottom 30%',
          onUpdate: function (self) {
            hlStop();
            var i = Math.floor(self.progress * hlItems.length);
            if (i > hlItems.length - 1) i = hlItems.length - 1;
            if (i < 0) i = 0;
            hlItems[i].classList.add('is-lit');
            hlIndex = (i + 1) % hlItems.length;
            clearTimeout(scrubIdle);
            scrubIdle = setTimeout(hlStart, 900);
          }
        });
      }

      hlStart();
    }
  }

  /* ============================================================
     HERO CHOREOGRAPHY — GSAP
     Five moves, one idea: this hero behaves like a measuring
     instrument, not a slideshow. Nothing bounces.

       1. the headline is DRAWN — a vertical wipe per line, not a fade
       2. a rule is left behind, the way a plotter finishes a stroke
       3. inverted parallax — the copy leaves slowly, the work leaves
          fast. Uniform parallax reads as a rendering bug; the
          inversion is what the eye accepts as depth.
       4. the blueprint field drifts, so the page has a floor
       5. the primary CTA is magnetic, pointer devices only

     Guarded three ways: GSAP must have loaded, the section must exist,
     and matchMedia hands reduced-motion users a static hero.
     ============================================================ */
  var heroEl = document.getElementById('hero');
  if (heroEl && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    /* Safe unconditionally: .gsap-on only turns the blueprint field on and
       adds will-change hints. It hides nothing. */
    document.documentElement.classList.add('gsap-on');

    /* The entrance is a different matter. Taking it over means blanking the
       hero first — invisible at 0ms, a flash at 3s, because by then the CSS
       .hload animation has already painted the headline and the takeover
       would snap it back to nothing and replay it.

       A millisecond budget measured from navigation is the obvious gate and
       the wrong one: it counts DNS, parsing and Chrome's own startup, none
       of which say anything about what is on screen. So ask the animation
       itself. currentTime is how far .hload has actually run; under a couple
       of frames nothing meaningful has been painted and the handoff cannot
       be seen. Past that the CSS keeps the entrance it already started, and
       GSAP keeps only the scroll work below — that binds to the wheel and
       can attach whenever it likes without a flash.

       No getAnimations, or no animation to read: assume it is too late and
       leave the entrance alone. The conservative branch is the one where
       nothing can go wrong. */
    var inTime = (function () {
      var painted = heroEl.querySelector('.hload');
      if (!painted || !painted.getAnimations) return false;
      var running = painted.getAnimations();
      return running.length > 0 && (running[0].currentTime || 0) < 100;
    })();

    var mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', function () {
      var lines = '#hero h1 .l1, #hero h1 .l2';

      if (inTime) {
        document.documentElement.classList.add('gsap-intro');

        /* --- 1 + 2: the headline draws itself --- */
        gsap.set(lines, { opacity: 1, clipPath: 'inset(0 0 100% 0)' });

        /* Absolute positions, not relative offsets. Chained '-=' offsets are
           how an intro quietly grows to two and a half seconds: each one
           reads fine alone and nobody adds them up. Written this way the
           budget is visible — everything is on screen by ~1.3s, and the
           CTA specifically by ~1.15s. An entrance that outlasts the
           visitor's patience is not style, it costs enquiries. */
        gsap.timeline({ defaults: { ease: 'expo.out' } })
          .fromTo('.hero-eyebrow', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, 0)
          .to(lines, { clipPath: 'inset(0 0 0% 0)', duration: 0.85, stagger: 0.1 }, 0.15)
          .fromTo('.hero-sub', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 0.55)
          .fromTo('.hero-ctas', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 0.62)
          .fromTo('.hero-side', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 }, 0.6)
          /* the rule may finish last: it is the signature on the drawing,
             not information anyone is waiting for */
          .to('.hero-rule', { scaleX: 1, duration: 0.8, ease: 'expo.inOut' }, 0.6);
      }

      /* --- 3: inverted parallax on the way out ---
         Two triggers, deliberately different scrub inertia: the copy
         lags (0.9) while the work column tracks the wheel closely
         (0.25). Same distance, different feel — that gap IS the depth. */
      var out = { trigger: heroEl, start: 'top top', end: 'bottom top' };

      gsap.to('.hero-main', {
        yPercent: -7, ease: 'none',
        scrollTrigger: Object.assign({ scrub: 0.9 }, out)
      });
      /* The fade is a SEPARATE tween on a shorter range, and that split is
         deliberate. Fading the copy across the whole exit dimmed the primary
         CTA to 40% while it was still sitting mid-viewport and still
         clickable — a button you can press but can barely read. Held at full
         strength for the first half, it only dissolves once it is genuinely
         on its way off the top. */
      gsap.to('.hero-main', {
        opacity: 0.35, ease: 'none',
        scrollTrigger: Object.assign({ scrub: 0.9 }, out, { start: '48% top' })
      });
      gsap.to('.hero-side', {
        yPercent: -24, ease: 'none',
        scrollTrigger: Object.assign({ scrub: 0.25 }, out)
      });

      /* --- 4: the floor drifts slowest of all --- */
      gsap.fromTo('.hero-grid',
        { yPercent: 0 },
        {
          yPercent: 12, opacity: 0.35, ease: 'none',
          scrollTrigger: Object.assign({ scrub: 1.2 }, out)
        });

      /* --- 5: magnetic primary CTA ---
         Pointer devices only: on touch there is no hover to reward, and
         a transform that never resets would leave the button offset. */
      var magnet = document.querySelector('.hero-ctas .btn-volt');
      if (magnet && window.matchMedia('(pointer: fine)').matches) {
        var xTo = gsap.quickTo(magnet, 'x', { duration: 0.45, ease: 'power3' });
        var yTo = gsap.quickTo(magnet, 'y', { duration: 0.45, ease: 'power3' });
        magnet.addEventListener('pointermove', function (e) {
          var r = magnet.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.45);
        });
        magnet.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
      }

      /* fonts land after first paint and change the headline's height —
         without this the scroll distances are measured against the
         fallback face and every trigger sits a few pixels off */
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
      }
    });
  }

  /* ---------- ticker ----------
     The markup already ships two identical halves, which is exactly
     what translateX(-50%) needs. Duplicating again here produced four
     copies and only looked right by accident. Left as-is on purpose. */

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
    var telRe = /^[+]?[\d\s().-]{6,}$/;

    function showError(text, field) {
      msgBox.textContent = text;
      msgBox.classList.add('err');
      /* point at the field that failed instead of making the user
         re-read the whole form looking for it */
      if (field) {
        form.querySelectorAll('.is-invalid').forEach(function (el) {
          el.classList.remove('is-invalid');
          el.removeAttribute('aria-invalid');
        });
        field.classList.add('is-invalid');
        field.setAttribute('aria-invalid', 'true');
        field.focus();
      }
    }
    function clearError() {
      msgBox.textContent = '';
      msgBox.classList.remove('err');
      form.querySelectorAll('.is-invalid').forEach(function (el) {
        el.classList.remove('is-invalid');
        el.removeAttribute('aria-invalid');
      });
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
      var tel = form.telefono.value.trim();
      var email = form.email.value.trim();
      /* azienda is genuinely optional: the markup never marked it
         required, and the JS used to reject the form anyway */
      var azienda = form.azienda ? form.azienda.value.trim() : '';
      var messaggio = form.messaggio.value.trim();

      /* one rule per required field, so the message names the field */
      var checks = [
        [!nome, 'Scrivi il tuo nome e cognome.', form.nome],
        [!tel, 'Serve un numero di telefono per richiamarti.', form.telefono],
        [tel && !telRe.test(tel), 'Il numero di telefono non sembra valido.', form.telefono],
        [!email, 'Serve un indirizzo email.', form.email],
        [email && !emailRe.test(email), 'Inserisci un indirizzo email valido.', form.email],
        [!messaggio, 'Raccontaci in due righe di cosa hai bisogno.', form.messaggio]
      ];
      for (var i = 0; i < checks.length; i++) {
        if (checks[i][0]) { showError(checks[i][1], checks[i][2]); return; }
      }

      submitBtn.disabled = true;
      btnLabel.textContent = 'Invio in corso…';

      var payload = { nome: nome, telefono: tel, email: email, azienda: azienda, messaggio: messaggio };

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
     CONTACT MODAL
     Single source of truth. This markup used to be pasted into all
     thirteen pages, which meant every copy fix was a thirteen-file
     diff. It is chrome, not content: hidden by default, never
     crawled, so injecting it costs nothing in SEO.

     Netlify still needs ONE static declaration to register the form
     at deploy time — that lives hidden in contatti.html.
     ============================================================ */
  var CONTACT_MODAL_HTML = [
    '<div id="contactModal" role="dialog" aria-modal="true" aria-labelledby="cmTitle" aria-hidden="true">',
    '  <div class="contact-modal-card" role="document">',
    '    <div class="cm-head">',
    '      <div>',
    '        <h2 id="cmTitle">Parliamo del tuo progetto</h2>',
    '        <p>Ti rispondiamo entro 24 ore lavorative.</p>',
    '      </div>',
    '      <button type="button" class="cm-close" aria-label="Chiudi finestra di contatto" data-contact-close>',
    '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    '      </button>',
    '    </div>',
    '    <form id="cmForm" name="contatti-modal" data-netlify="true" novalidate>',
    '      <input type="hidden" name="form-name" value="contatti-modal">',
    '      <div class="field row">',
    '        <div>',
    '          <label for="cm-nome">Nome</label>',
    '          <input id="cm-nome" name="nome" type="text" required autocomplete="name" placeholder="Mario Rossi">',
    '        </div>',
    '        <div>',
    '          <label for="cm-tel">Telefono</label>',
    '          <input id="cm-tel" name="telefono" type="tel" required autocomplete="tel" placeholder="+39 334 ...">',
    '        </div>',
    '      </div>',
    '      <div class="field">',
    '        <label for="cm-email">Email</label>',
    '        <input id="cm-email" name="email" type="email" required autocomplete="email" placeholder="mario@azienda.it">',
    '      </div>',
    '      <div class="field">',
    '        <label for="cm-msg">Messaggio</label>',
    '        <textarea id="cm-msg" name="messaggio" rows="3" required placeholder="Raccontaci brevemente il tuo progetto..."></textarea>',
    '      </div>',
    '      <div class="form-hp" aria-hidden="true">',
    '        <label for="cm-website">Lascia questo campo vuoto</label>',
    '        <input id="cm-website" type="text" name="website" tabindex="-1" autocomplete="off">',
    '      </div>',
    '      <p class="form-msg" id="cmFormMsg" role="alert"></p>',
    '      <button class="btn btn-volt" type="submit">',
    '        <span>Invia richiesta</span>',
    '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m0 0-6-6m6 6-6 6"/></svg>',
    '      </button>',
    '      <a class="btn btn-wa" href="https://wa.me/393341340272?text=Ciao%20Leonardo%2C%20vorrei%20parlare%20del%20mio%20progetto%20con%20SarconX." target="_blank" rel="noopener">',
    '        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.3-.5 0-1 .2-3.4-.7-2.9-1.1-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c0 .2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.1.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.4.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4 0 .1 0 .7-.2 1.2Z"/></svg>',
    '        <span>Scrivici su WhatsApp</span>',
    '      </a>',
    '    </form>',
    '    <div class="cm-success" id="cmSuccess" hidden>',
    '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    '      <h3>Richiesta inviata</h3>',
    '      <p>Grazie. Ti rispondiamo entro 24 ore lavorative, di solito molto prima.</p>',
    '      <button class="btn btn-ghost" type="button" data-contact-close>Chiudi</button>',
    '    </div>',
    '    <p class="cm-foot">oppure scrivi direttamente a <a href="mailto:Info@sarconx.it">Info@sarconx.it</a></p>',
    '  </div>',
    '</div>'
  ].join('\n');

  if (!document.getElementById('contactModal')) {
    document.body.insertAdjacentHTML('beforeend', CONTACT_MODAL_HTML);
  }

  var modal = document.getElementById('contactModal');
  if (modal) {
    var cmCard = modal.querySelector('.contact-modal-card');
    var cmTriggers = document.querySelectorAll('[data-contact-trigger]');
    var cmClosers = document.querySelectorAll('[data-contact-close]');
    var cmLastFocused = null;

    function openModal() {
      cmLastFocused = document.activeElement;
      /* reopening after a successful send must show the form again,
         not the confirmation left over from last time */
      var f = modal.querySelector('#cmForm');
      var s = modal.querySelector('#cmSuccess');
      var m = modal.querySelector('#cmFormMsg');
      if (f && s) { f.hidden = false; s.hidden = true; }
      if (m) { m.textContent = ''; m.classList.remove('err'); }
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

      function cmShowError(text, field) {
        cmMsgBox.textContent = text;
        cmMsgBox.classList.add('err');
        if (field) {
          cmForm.querySelectorAll('.is-invalid').forEach(function (el) {
            el.classList.remove('is-invalid');
            el.removeAttribute('aria-invalid');
          });
          field.classList.add('is-invalid');
          field.setAttribute('aria-invalid', 'true');
          field.focus();
        }
      }
      function cmClearError() {
        cmMsgBox.textContent = '';
        cmMsgBox.classList.remove('err');
        cmForm.querySelectorAll('.is-invalid').forEach(function (el) {
          el.classList.remove('is-invalid');
          el.removeAttribute('aria-invalid');
        });
      }
      /* Closing the dialog on success told the user nothing — the form
         just vanished. Swap in a confirmation and let them close it. */
      var cmSuccess = document.getElementById('cmSuccess');
      function cmShowSuccess() {
        cmForm.hidden = true;
        cmSuccess.hidden = false;
        cmSuccess.setAttribute('tabindex', '-1');
        cmSuccess.focus();
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

        /* same rule shape as the contatti.html form, so both surfaces
           give the user the same quality of feedback */
        var cmChecks = [
          [!nome, 'Scrivi il tuo nome.', cmForm.nome],
          [!tel, 'Serve un numero di telefono per richiamarti.', cmForm.telefono],
          [tel && !cmTelRe.test(tel), 'Il numero di telefono non sembra valido.', cmForm.telefono],
          [!email, 'Serve un indirizzo email.', cmForm.email],
          [email && !cmEmailRe.test(email), 'Inserisci un indirizzo email valido.', cmForm.email],
          [!messaggio, 'Raccontaci in due righe il tuo progetto.', cmForm.messaggio]
        ];
        for (var ci = 0; ci < cmChecks.length; ci++) {
          if (cmChecks[ci][0]) { cmShowError(cmChecks[ci][1], cmChecks[ci][2]); return; }
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
            cmBtn.disabled = false;
            cmBtnLabel.textContent = origLabel;
            cmShowSuccess();
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
