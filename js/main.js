/* Portfolio page behaviour: language switch, demos, video autoplay, lightbox, mobile menu. */
(function () {
  'use strict';

  var STORAGE_KEY = 'jv-lang';
  var WHATSAPP = 'https://wa.me/5511961551602';
  var EMAIL = 'joao.jleite3@gmail.com';
  var root = document.documentElement;
  var I18N = window.I18N || { META: { en: {}, es: {} }, ES: {} };
  var DEMOS = (window.DEMOS || []).filter(function (d) { return d.enabled; });
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Dictionaries: EN is read from the HTML itself, ES comes from js/i18n.js.
  var DICT = { en: {}, es: I18N.ES || {} };
  var currentLang = 'en';

  // ---------- storage (can throw in private mode / blocked storage) ----------
  function readLang() {
    try { var v = localStorage.getItem(STORAGE_KEY); return v === 'en' || v === 'es' ? v : null; } catch (e) { return null; }
  }
  function saveLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }
  function detectLang() {
    var saved = readLang();
    if (saved) return saved;
    var nav = (navigator.language || '').toLowerCase();
    return nav.indexOf('es') === 0 ? 'es' : 'en';
  }

  function meta(key) {
    var m = (I18N.META && I18N.META[currentLang]) || {};
    return m[key] != null ? m[key] : (I18N.META.en[key] || '');
  }

  // ---------- DOM helper ----------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'text') node.textContent = attrs[k];
        else if (k === 'className') node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  // ---------- demos (rendered from window.DEMOS) ----------
  // Each translatable node gets a data-i18n key; the strings are registered in both dictionaries,
  // so switching language never re-renders the cards (videos keep playing).
  function reg(key, en, es) {
    DICT.en[key] = en;
    DICT.es[key] = es != null ? es : en;
    return key;
  }

  function renderDemos() {
    var list = document.getElementById('demo-list');
    if (!list) return;
    if (!DEMOS.length) {
      // No demo enabled: hide the whole section and its nav link instead of showing an empty block.
      var section = document.getElementById('demos');
      if (section) section.hidden = true;
      var link = document.querySelector('.site-nav a[href="#demos"]');
      if (link && link.parentNode) link.parentNode.hidden = true;
      return;
    }
    list.classList.toggle('demo-list-single', DEMOS.length === 1);

    reg('demo.label', I18N.META.en.demo, I18N.META.es.demo);
    reg('demo.problem', I18N.META.en.problem, I18N.META.es.problem);
    reg('demo.solution', I18N.META.en.solution, I18N.META.es.solution);
    reg('demo.stack', I18N.META.en.stack, I18N.META.es.stack);
    reg('demo.viewCode', I18N.META.en.viewCode, I18N.META.es.viewCode);

    DEMOS.forEach(function (d) {
      var en = d.text.en, es = d.text.es || d.text.en, p = 'demo.' + d.id + '.';
      var titleId = 'demo-' + d.id + '-title';

      // Video: muted + playsinline so it may autoplay; preload none so it costs nothing until visible.
      var video = el('video', {
        muted: '', loop: '', playsinline: '', preload: 'none',
        poster: d.poster, width: d.size[0], height: d.size[1],
        'aria-label': en.videoLabel, 'data-i18n-aria': reg(p + 'video', en.videoLabel, es.videoLabel)
      });
      video.muted = true; // attribute alone is not enough for autoplay in some browsers
      var source = el('source', { src: d.video, type: 'video/mp4' });
      // GIF fallback: shown by browsers without <video>, or swapped in if the MP4 fails to load.
      var gif = el('img', { src: d.gif, alt: en.videoLabel, 'data-i18n-alt': p + 'video', loading: 'lazy', width: d.size[0], height: d.size[1] });
      video.appendChild(source);
      video.appendChild(gif);
      source.addEventListener('error', function () {
        var img = el('img', { src: d.gif, alt: DICT[currentLang][p + 'video'], 'data-i18n-alt': p + 'video', loading: 'lazy', width: d.size[0], height: d.size[1], className: 'demo-gif' });
        if (video.parentNode) video.parentNode.replaceChild(img, video);
        var btn = frame.querySelector('.video-toggle');
        if (btn) btn.remove();
      });

      var toggle = el('button', { type: 'button', className: 'video-toggle', 'aria-label': meta('videoPause') });
      toggle.innerHTML = '<svg class="i-pause" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M8 5h3v14H8zM13 5h3v14h-3z"/></svg>' +
                         '<svg class="i-play" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M8 5l11 7-11 7z"/></svg>';
      var frame = el('div', { className: 'demo-video' }, [video, toggle]);

      // Screenshots (open in the lightbox)
      var shots = el('div', { className: 'gallery demo-shots', 'data-gallery': 'demo-' + d.id });
      d.shots.forEach(function (s, i) {
        var t = en.shots[i], te = (es.shots || en.shots)[i];
        var img = el('img', {
          src: s.base + '-' + s.small + '.webp',
          srcset: s.base + '-' + s.small + '.webp ' + s.small + 'w, ' + s.base + '-' + s.full + '.webp ' + s.full + 'w',
          sizes: '(min-width: 1000px) 220px, 33vw',
          width: s.w, height: s.h, loading: 'lazy', decoding: 'async',
          alt: t.alt, 'data-i18n-alt': reg(p + 's' + i + '.alt', t.alt, te.alt)
        });
        var cap = el('span', { className: 'shot-cap', text: t.cap, 'data-i18n': reg(p + 's' + i + '.cap', t.cap, te.cap) });
        shots.appendChild(el('a', { className: 'shot', href: s.base + '-' + s.full + '.webp' }, [img, cap]));
      });

      function row(labelKey, bodyNode) {
        return el('div', { className: 'demo-row' }, [
          el('dt', { text: DICT.en[labelKey], 'data-i18n': labelKey }),
          el('dd', null, [bodyNode])
        ]);
      }
      var stack = el('ul', { className: 'stack' });
      en.stack.forEach(function (s, i) {
        stack.appendChild(el('li', { text: s, 'data-i18n': reg(p + 'stack' + i, s, (es.stack || en.stack)[i]) }));
      });

      var repoBtn = el('a', { className: 'btn btn-primary btn-sm', href: d.repo, target: '_blank', rel: 'noopener' });
      repoBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.7s.8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .4 1 .4 2 .1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/></svg>';
      repoBtn.appendChild(el('span', { text: DICT.en['demo.viewCode'], 'data-i18n': 'demo.viewCode' }));

      var body = el('div', { className: 'demo-body' }, [
        el('span', { className: 'tag tag-demo', text: DICT.en['demo.label'], 'data-i18n': 'demo.label' }),
        el('h3', { className: 'demo-title', id: titleId, text: en.title, 'data-i18n': reg(p + 'title', en.title, es.title) }),
        el('dl', { className: 'demo-rows' }, [
          row('demo.problem', el('span', { text: en.problem, 'data-i18n': reg(p + 'problem', en.problem, es.problem) })),
          row('demo.solution', el('span', { text: en.solution, 'data-i18n': reg(p + 'solution', en.solution, es.solution) })),
          row('demo.stack', stack)
        ]),
        el('p', { className: 'demo-note', text: en.note, 'data-i18n': reg(p + 'note', en.note, es.note) }),
        repoBtn
      ]);

      var card = el('article', { className: 'demo', 'aria-labelledby': titleId }, [
        el('div', { className: 'demo-media' }, [frame, shots]),
        body
      ]);
      list.appendChild(card);
      setupVideo(video, toggle);
    });
  }

  // ---------- video: play only while visible, user can always pause ----------
  var videoObserver = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var v = entry.target;
      if (entry.isIntersecting) { if (!v._userPaused && !reduceMotion) tryPlay(v); }
      else if (!v.paused) v.pause();
    });
  }, { threshold: 0.35 }) : null;

  function tryPlay(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked: poster + play button stay */ });
  }

  function setupVideo(video, toggle) {
    function sync() {
      var playing = !video.paused;
      toggle.classList.toggle('is-paused', !playing);
      toggle.setAttribute('aria-label', meta(playing ? 'videoPause' : 'videoPlay'));
    }
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    toggle.addEventListener('click', function () {
      if (video.paused) { video._userPaused = false; tryPlay(video); }
      else { video._userPaused = true; video.pause(); }
    });
    toggle._sync = sync;
    sync();
    if (videoObserver) videoObserver.observe(video);
    else if (!reduceMotion) { video.setAttribute('autoplay', ''); tryPlay(video); }
  }

  // ---------- language ----------
  function snapshotEnglish() {
    document.querySelectorAll('[data-i18n]').forEach(function (n) {
      var k = n.getAttribute('data-i18n'); if (!(k in DICT.en)) DICT.en[k] = n.textContent;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (n) {
      var k = n.getAttribute('data-i18n-html'); if (!(k in DICT.en)) DICT.en[k] = n.innerHTML;
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (n) {
      var k = n.getAttribute('data-i18n-alt'); if (!(k in DICT.en)) DICT.en[k] = n.getAttribute('alt');
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (n) {
      var k = n.getAttribute('data-i18n-aria'); if (!(k in DICT.en)) DICT.en[k] = n.getAttribute('aria-label');
    });
  }

  function applyLang(lang) {
    currentLang = lang === 'es' ? 'es' : 'en';
    var d = DICT[currentLang], fallback = DICT.en;
    function t(k) { return d[k] != null ? d[k] : fallback[k]; }

    root.lang = currentLang;
    root.setAttribute('data-lang', currentLang);
    document.title = meta('title');
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', meta('description'));

    document.querySelectorAll('[data-i18n]').forEach(function (n) {
      var v = t(n.getAttribute('data-i18n')); if (v != null) n.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (n) {
      var v = t(n.getAttribute('data-i18n-html')); if (v != null) n.innerHTML = v; // trusted strings from i18n.js only
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (n) {
      var v = t(n.getAttribute('data-i18n-alt')); if (v != null) n.setAttribute('alt', v);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (n) {
      var v = t(n.getAttribute('data-i18n-aria')); if (v != null) n.setAttribute('aria-label', v);
    });

    // Contact links carry a prefilled message / subject in the visitor's language.
    var wa = WHATSAPP + '?text=' + encodeURIComponent(meta('whatsappText'));
    document.querySelectorAll('.js-whatsapp').forEach(function (a) { a.href = wa; });
    var mail = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(meta('mailSubject'));
    document.querySelectorAll('.js-email').forEach(function (a) { a.href = mail; });

    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === currentLang));
    });
    document.querySelectorAll('.video-toggle').forEach(function (b) { if (b._sync) b._sync(); });
    root.classList.remove('i18n-pending');
  }

  function initLangSwitch() {
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var lang = b.getAttribute('data-lang');
        if (lang === currentLang) return;
        saveLang(lang);
        applyLang(lang);
      });
    });
  }

  // ---------- mobile menu ----------
  function initMenu() {
    var btn = document.querySelector('.menu-btn');
    var nav = document.getElementById('site-nav');
    if (!btn || !nav) return;
    function set(open) {
      btn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (m) { if (m.matches) set(false); });
  }

  // ---------- header shadow ----------
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- lightbox ----------
  function initLightbox() {
    var dlg = document.getElementById('lightbox');
    if (!dlg || typeof dlg.showModal !== 'function') return; // links still open the full image
    var img = dlg.querySelector('.lb-img');
    var cap = dlg.querySelector('.lb-cap');
    var count = dlg.querySelector('.lb-count');
    var prev = dlg.querySelector('.lb-prev');
    var next = dlg.querySelector('.lb-next');
    var items = [], index = 0, opener = null;

    function show(i) {
      index = (i + items.length) % items.length;
      var a = items[index];
      var thumb = a.querySelector('img');
      var c = a.querySelector('.shot-cap');
      img.removeAttribute('src');
      img.src = a.getAttribute('href');
      img.alt = thumb ? thumb.alt : '';
      if (thumb) { img.width = thumb.width || 1600; img.height = thumb.height || 1000; }
      cap.textContent = c ? c.textContent : '';
      count.textContent = items.length > 1 ? meta('imageOf').replace('{n}', index + 1).replace('{total}', items.length) : '';
      prev.hidden = next.hidden = items.length < 2;
    }

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a.shot');
      if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button > 0) return;
      e.preventDefault();
      var gallery = a.closest('[data-gallery]');
      items = gallery ? Array.prototype.slice.call(gallery.querySelectorAll('a.shot')) : [a];
      opener = a;
      show(items.indexOf(a));
      dlg.showModal();
      document.body.classList.add('lb-open');
    });
    prev.addEventListener('click', function () { show(index - 1); });
    next.addEventListener('click', function () { show(index + 1); });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); }); // backdrop
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' && items.length > 1) { e.preventDefault(); show(index - 1); }
      if (e.key === 'ArrowRight' && items.length > 1) { e.preventDefault(); show(index + 1); }
    });
    dlg.addEventListener('close', function () {
      document.body.classList.remove('lb-open');
      img.removeAttribute('src');
      if (opener) opener.focus();
    });
  }

  // ---------- boot ----------
  function boot() {
    snapshotEnglish();          // before any translation touches the DOM
    renderDemos();              // registers its own EN/ES strings
    initLangSwitch();
    initMenu();
    initHeader();
    initLightbox();
    applyLang(detectLang());
  }

  try { boot(); } catch (err) {
    root.classList.remove('i18n-pending');
    if (window.console) console.error(err);
  }
})();
