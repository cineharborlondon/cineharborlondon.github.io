'use strict';
(() => {
  const frame = document.getElementById('about-background-video');
  const toggle = document.getElementById('about-background-toggle');
  if (!frame || !toggle) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let player, loading = false, paused = motion.matches;
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
  toggle.addEventListener('click', async () => {
    paused = !paused;
    updateToggle();
    try {
      if (player) { if (paused) await player.pause(); else await player.play(); }
      else if (!paused) await start();
    } catch { fail(); }
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
  if (!motion.matches) start();
})();
