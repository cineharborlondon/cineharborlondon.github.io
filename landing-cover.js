(() => {
  const cover = document.querySelector('#landing-cover');
  const frame = document.querySelector('#work-underlay');
  const entry = document.querySelector('.enter-work');
  const canvas = document.querySelector('#sand-air');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const homeURL = location.pathname + location.search;
  const homeTitle = document.title;
  let ready = false;
  let requested = false;
  let opening = false;
  let open = false;
  let animation = 0;
  let completion;
  let stopChecking;
  history.replaceState({ ...history.state, cineCover: true }, '', location.href);

  function setPlayback(visible) {
    dispatchEvent(new CustomEvent('cine:cover-state', { detail: { visible } }));
  }
  function finishOpening(pushHistory = true) {
    clearTimeout(completion);
    cancelAnimationFrame(animation);
    canvas.hidden = true;
    cover.hidden = true;
    cover.classList.remove('sand-lifting');
    frame.inert = false;
    frame.removeAttribute('aria-hidden');
    document.body.classList.add('work-open');
    open = true;
    opening = false;
    document.title = 'Work — Cine Harbor';
    setPlayback(false);
    if (pushHistory) history.pushState({ cineCover: false }, '', 'work.html' + frame.contentWindow.location.hash);
    frame.contentWindow.focus();
  }
  function showCover() {
    clearTimeout(completion);
    cancelAnimationFrame(animation);
    opening = false;
    open = false;
    requested = false;
    canvas.hidden = true;
    cover.classList.remove('sand-lifting');
    cover.hidden = false;
    frame.inert = true;
    frame.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('work-open');
    document.title = homeTitle;
    setPlayback(true);
    entry.focus({ preventScroll: true });
  }
  function scatterSand() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = innerWidth, height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.scale(ratio, ratio);
    const palette = ['#e9dfce', '#eee7d9', '#c6af89', '#9b7b50', '#745332'];
    const grains = Array.from({ length: width < 700 ? 420 : 850 }, () => ({
      start: Math.random() * 570,
      y: Math.random() * height,
      speed: 110 + Math.random() * 300,
      rise: 25 + Math.random() * 90,
      radius: .45 + Math.random() * 1.15,
      color: palette[Math.floor(Math.random() * palette.length)],
      phase: Math.random() * Math.PI * 2
    }));
    canvas.hidden = false;
    const start = performance.now();
    function draw(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, width, height);
      for (const grain of grains) {
        const age = (elapsed - grain.start) / 1000;
        if (age < 0 || age > .42) continue;
        const edge = (grain.start / 570 * 1.3 - .15) * width;
        const x = edge + grain.speed * age;
        const y = grain.y - grain.rise * age + Math.sin(grain.phase + age * 9) * 5;
        ctx.globalAlpha = Math.sin(age / .42 * Math.PI) * .65;
        ctx.fillStyle = grain.color;
        ctx.fillRect(x, y, grain.radius, grain.radius);
      }
      ctx.globalAlpha = 1;
      if (elapsed < 820) animation = requestAnimationFrame(draw);
    }
    animation = requestAnimationFrame(draw);
  }
  function liftCover() {
    if (!ready || opening || open) return;
    requested = false;
    opening = true;
    entry.removeAttribute('aria-busy');
    setPlayback(false);
    if (motion.matches) { finishOpening(); return; }
    cover.classList.add('sand-lifting');
    scatterSand();
    completion = setTimeout(() => finishOpening(), 800);
  }
  function prepareWork() {
    const doc = frame.contentDocument;
    if (!doc || doc.readyState === 'loading' || !doc.querySelector('.work-section') || !doc.querySelector('.project-card, #panel-films a')) return;
    if (ready) return;
    ready = true;
    clearInterval(stopChecking);
    // Detail/About/Contact links leave the embedded Work normally; hashes and categories stay live inside it.
    doc.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname.endsWith('/index.html') || url.pathname === '/') {
        event.preventDefault();
        history.pushState({ cineCover: true }, '', homeURL);
        showCover();
      } else if (!url.pathname.endsWith('/work.html')) {
        link.target = '_top';
      }
    });
    frame.contentWindow.addEventListener('hashchange', () => {
      if (open) history.replaceState({ cineCover: false }, '', 'work.html' + frame.contentWindow.location.hash);
    });
    if (requested) liftCover();
  }
  frame.addEventListener('load', prepareWork);
  stopChecking = setInterval(prepareWork, 80);
  prepareWork();
  entry.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (opening || open) return;
    requested = true;
    if (ready) liftCover();
    else entry.setAttribute('aria-busy', 'true');
  });
  addEventListener('popstate', event => {
    if (event.state?.cineCover === false) finishOpening(false);
    else showCover();
  });
})();
