(() => {
  const players = [...document.querySelectorAll('.detail-player, .related-video-player')];
  if (!players.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'video-viewer';
  dialog.setAttribute('aria-label', 'Enlarged video player');
  dialog.innerHTML = '<div class="video-viewer-toolbar"><p class="video-viewer-title"></p><button type="button" class="video-viewer-close" autofocus>Close ×</button></div><div class="video-viewer-stage"></div>';
  document.body.append(dialog);
  const stage = dialog.querySelector('.video-viewer-stage');
  const title = dialog.querySelector('.video-viewer-title');
  let activeFrame, ratio = 16 / 9, trigger;
  const fit = () => {
    if (!activeFrame || !dialog.open) return;
    const style = getComputedStyle(stage);
    const width = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const playerWidth = Math.max(1, Math.min(width, height * ratio));
    activeFrame.style.width = `${playerWidth}px`;
    activeFrame.style.height = `${playerWidth / ratio}px`;
  };
  new ResizeObserver(fit).observe(stage);
  window.visualViewport?.addEventListener('resize', fit);
  const close = () => dialog.close();
  dialog.querySelector('.video-viewer-close').addEventListener('click', close);
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target === stage || event.target.classList.contains('video-viewer-toolbar')) close();
  });
  dialog.addEventListener('close', () => {
    activeFrame?.remove(); activeFrame = null;
    document.documentElement.style.overflow = '';
    trigger?.focus({ preventScroll: true });
  });
  players.forEach(player => {
    const source = player.querySelector('iframe');
    if (!source) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'video-expand';
    button.setAttribute('aria-label', `Enlarge ${source.title.replace(/ — (Vimeo|YouTube) video player$/, '')}`);
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg><span>Enlarge video</span>';
    player.after(button);
    button.addEventListener('click', () => {
      // Pause inline players before opening the selected film in the viewer.
      players.forEach(item => {
        const iframe = item.querySelector('iframe');
        if (iframe && new URL(iframe.src).hostname === 'player.vimeo.com') iframe.contentWindow?.postMessage({ method: 'pause' }, 'https://player.vimeo.com');
      });
      trigger = button;
      ratio = Number.parseFloat(player.style.getPropertyValue('--video-ratio')) || 16 / 9;
      title.textContent = source.title.replace(/ — (Vimeo|YouTube) video player$/, '');
      const url = new URL(source.src); url.searchParams.set('autoplay', '1');
      activeFrame = document.createElement('iframe');
      activeFrame.className = 'video-viewer-frame'; activeFrame.title = source.title;
      activeFrame.allow = source.allow; activeFrame.allowFullscreen = true;
      activeFrame.referrerPolicy = source.referrerPolicy;
      activeFrame.src = url.href;
      stage.replaceChildren(activeFrame);
      dialog.showModal(); document.documentElement.style.overflow = 'hidden'; fit();
    });
  });
})();
