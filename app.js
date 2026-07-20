/* ============================================================
   SARCONX — app.js
   Nav, mobile menu, reveals, ticker, spotlight cards,
   functions selector, cookie consent, contact form.
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
  var reveals = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { obs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('on'); });
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
     FUNZIONI — business-function selector (drives the diag panel)
     ============================================================ */
  var FUNZ = [
    {
      id: 'commerciale', label: 'Commerciale',
      quote: 'I lead arrivano, ma nessuno li qualifica in tempo. I follow-up si perdono tra mail ed Excel, e i preventivi escono sempre troppo tardi.',
      fix: 'Progettiamo un agente AI che <strong>qualifica ogni lead</strong> appena arriva, prepara offerte personalizzate e gestisce i follow-up su tutti i canali. Il tuo team commerciale parla solo con i prospect che contano davvero.',
      list: ['Lead scoring predittivo', 'Offerte e preventivi automatici', 'Follow-up multicanale, mai un lead perso'],
      caseHref: 'case-mail-scraper.html', caseLabel: 'Vedi un caso reale'
    },
    {
      id: 'amministrativo', label: 'Amministrativo',
      quote: 'Fatture, riconciliazioni e report rubano ore preziose ogni settimana. E un errore umano, prima o poi, costa caro.',
      fix: 'Automatizziamo <strong>fatturazione, reporting e compliance</strong>: documenti generati e archiviati da soli, riconciliazioni senza errori, scadenze sempre sotto controllo. Il ciclo contabile accelera e l’errore umano sparisce.',
      list: ['Fatturazione e riconciliazione automatiche', 'Reporting finanziario in tempo reale', 'Compliance e archiviazione documentale'],
      caseHref: 'case-link-infissi.html', caseLabel: 'Vedi un caso reale'
    },
    {
      id: 'operativita', label: 'Operatività',
      quote: 'Ordini, scorte e fornitori vivono su sistemi che non si parlano. I ritardi li scopriamo quando è ormai troppo tardi.',
      fix: 'Un agente che <strong>gestisce ordini, scorte e fornitori</strong> in autonomia: prevede i ritardi prima che accadano, rialloca le risorse e ottimizza i flussi operativi mentre il team si concentra sul valore.',
      list: ['Gestione ordini e scorte in autonomia', 'Previsione dei ritardi e dei colli di bottiglia', 'Riallocazione automatica delle risorse'],
      caseHref: 'case-link-infissi.html', caseLabel: 'Vedi un caso reale'
    },
    {
      id: 'qualita', label: 'Qualità',
      quote: 'Il controllo qualità è manuale e a campione. I difetti, troppo spesso, li trovano i clienti prima di noi.',
      fix: 'Portiamo la <strong>visione computazionale</strong> in produzione: ispezione continua, difetti rilevati in tempo reale e reportistica qualità generata da sé. Ogni pezzo tracciato, ogni lotto documentato.',
      list: ['Ispezione continua con computer vision', 'Analisi difetti in tempo reale', 'Reportistica qualità automatica'],
      caseHref: 'case-partecify.html', caseLabel: 'Vedi un caso reale'
    },
    {
      id: 'manutenzione', label: 'Manutenzione',
      quote: 'Le macchine si fermano senza preavviso. Ogni fermo non pianificato brucia margine, consegne e fiducia dei clienti.',
      fix: 'Sensori IoT e modelli predittivi che <strong>anticipano i guasti</strong>: work order generati in automatico, ricambi ottimizzati e fino al 70% di downtime in meno. La manutenzione che paga sé stessa.',
      list: ['Manutenzione predittiva con IoT + AI', 'Work order generati in automatico', 'Fino al 70% di downtime in meno'],
      caseHref: 'case-partecify.html', caseLabel: 'Vedi un caso reale'
    },
    {
      id: 'analytics', label: 'Analytics',
      quote: 'I dati ci sono, sparsi in dieci strumenti diversi. Ma le decisioni continuiamo a prenderle a istinto.',
      fix: 'Unifichiamo i dati da tutte le fonti aziendali e li trasformiamo in <strong>insight azionabili</strong>: dashboard in tempo reale, forecast con confidenza statistica e anomalie segnalate prima che diventino problemi.',
      list: ['Dashboard interattive in tempo reale', 'Forecasting con confidenza statistica', 'Anomaly detection e alert automatici'],
      caseHref: 'case-link-infissi.html', caseLabel: 'Vedi un caso reale'
    }
  ];

  var chipsBox = document.getElementById('chips');
  var qEl = document.getElementById('diagQuote');
  var fEl = document.getElementById('diagFix');
  var lEl = document.getElementById('diagList');
  var cEl = document.getElementById('diagCase');
  var cLbl = document.getElementById('diagCaseLabel');
  var bodyEl = document.getElementById('diagBody');
  var sideEl = document.getElementById('diagSide');

  function renderFunz(item) {
    qEl.textContent = item.quote;
    fEl.innerHTML = item.fix;
    lEl.innerHTML = item.list.map(function (t) { return '<li>' + t + '</li>'; }).join('');
    cEl.setAttribute('href', item.caseHref);
    cLbl.textContent = item.caseLabel;
    [bodyEl, sideEl].forEach(function (el) {
      el.classList.remove('swap');
      void el.offsetWidth; /* restart animation */
      el.classList.add('swap');
    });
  }

  FUNZ.forEach(function (item, i) {
    var b = document.createElement('button');
    b.className = 'chip';
    b.type = 'button';
    b.textContent = item.label;
    b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.addEventListener('click', function () {
      chipsBox.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      renderFunz(item);
    });
    chipsBox.appendChild(b);
  });
  renderFunz(FUNZ[0]);

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
          btnLabel.textContent = 'Richiedi la tua analisi gratuita';
          showError('Invio non riuscito. Riprova tra poco, scrivici su WhatsApp al +39 334 134 0272 o a info@sarconx.it.');
        });
    });
  }

  /* ---------- footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
