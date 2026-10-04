'use strict';
(() => {
  const frame = document.getElementById('about-background-video');
  const toggle = document.getElementById('about-background-toggle');
  if (!frame || !toggle) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let player, loading = false, paused = motion.matches;
  let gesture = null;
  const contentSelector = 'a, button, input, textarea, select, label, nav, [role="button"], [contenteditable], h1, h2, h3, h4, h5, h6, p, li, img, svg';
  function updateToggle() {
    toggle.textContent = paused ? 'Play background' : 'Pause background';
    toggle.setAttribute('aria-pressed', String(paused));
  }
  function fail() {
    document.body.classList.remove('background-ready');
    toggle.hidden = true;
  }
  async function start() {
    if (loading || player) return;
    loading = true;
    frame.src = frame.dataset.src;
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.onerror = fail;
    script.onload = async () => {
      try {
        player = new window.Vimeo.Player(frame);
        player.on('playing', () => {
          document.body.classList.add('background-ready');
          if (paused || document.hidden) player.pause().catch(() => {});
        });
        player.on('error', fail);
        await player.ready();
        await player.setMuted(true);
        await player.setLoop(true);
        toggle.hidden = false;
        updateToggle();
        if (paused || document.hidden) await player.pause();
        else await player.play();
      } catch { fail(); }
    };
    document.head.append(script);
  }
  async function toggleBackground() {
    paused = !paused;
    updateToggle();
    try {
      if (player) { if (paused) await player.pause(); else await player.play(); }
      else if (!paused) await start();
    } catch { fail(); }
  }
  toggle.addEventListener('click', toggleBackground);
  // Treat only a stationary click on empty space as a background control.
  document.addEventListener('pointerdown', event => {
    gesture = event.isPrimary && event.button === 0 && !event.target.closest(contentSelector)
      ? { id: event.pointerId, x: event.clientX, y: event.clientY, scrollX: window.scrollX, scrollY: window.scrollY, moved: false }
      : null;
  }, { passive: true });
  document.addEventListener('pointermove', event => {
    if (gesture && event.pointerId === gesture.id && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8) gesture.moved = true;
  }, { passive: true });
  document.addEventListener('pointercancel', () => { gesture = null; }, { passive: true });
  document.addEventListener('click', event => {
    const click = gesture;
    gesture = null;
    if (!click || click.moved || event.defaultPrevented || event.button !== 0 || event.detail > 1) return;
    if (event.target.closest(contentSelector) || !window.getSelection().isCollapsed) return;
    if (Math.hypot(event.clientX - click.x, event.clientY - click.y) > 8 || window.scrollX !== click.scrollX || window.scrollY !== click.scrollY) return;
    toggleBackground();
  });
  motion.addEventListener('change', async () => {
    paused = motion.matches;
    updateToggle();
    try {
      if (player) { if (paused) await player.pause(); else await player.play(); }
      else if (!paused) await start();
    } catch { fail(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (!player) return;
    if (document.hidden || paused) player.pause().catch(() => {});
    else player.play().catch(fail);
  });
  updateToggle();
  toggle.hidden = false;
  if (!motion.matches) start();
})();
