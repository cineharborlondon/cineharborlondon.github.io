'use strict';

// 编辑这里即可更新简介、邮箱、项目。无需安装或构建。
// email 留空时不显示邮件链接，避免访客写信到虚构地址。
const site = {
  email: '',
  // 暂时保留第三方静音预览；完全去平台标识需要后续替换为自托管片源。
  platformPreviews: true,
  about: 'Cine Harbor is a London-based cinematography portfolio, with a focus on light, atmosphere, and the moments that make a story feel human.',
};

// collection: films / commercials / photography / social；kind: video / photo。
// 照片填写 cover，可选 full 图片原图路径，无需 youtube。
// 以下为用户提供的作品链接，按用户指定分类展示。
// credit 暂留空，待提供真实职务/团队后补充。
// youtube 填 11 位视频 ID；cover 留空自动使用 YouTube 封面，
// 或填写本地相对路径，例如 assets/my-film.jpg。
// Vimeo 项目改填 vimeo 数字 ID，并提供 cover；aspectRatio 可指定竖屏比例。
// previewStart 指定静音预览起点（秒）；previewScale 调整首页裁切倍率。
const projects = [
  {
    "collection": "films",
    "kind": "video",
    "title": "How to Stay Chic and Warm in London",
    "youtube": "SQthAn3F6oI",
    "previewStart": 8,
    "previewScale": 1.2,
    "cover": "",
    "credit": "",
    "sample": false
  },
  {
    "collection": "films",
    "kind": "video",
    "title": "The Polyphony of Life",
    "youtube": "KQa5HaSCOWg",
    "previewStart": 8,
    "previewScale": 1.2,
    "cover": "",
    "credit": "",
    "sample": false
  },
  {
    "collection": "commercials",
    "kind": "video",
    "title": "Realme x Adam Valdez TVC",
    "youtube": "YpQjEYLskJM",
    "previewStart": 8,
    "previewScale": 1.2,
    "cover": "",
    "credit": "",
    "sample": false
  },
  {
    "collection": "commercials",
    "kind": "video",
    "title": "Navimow Circle | A Lawn to Come Home to",
    "youtube": "BeA_n14lwOI",
    "previewStart": 13,
    "previewScale": 1.2,
    "cover": "",
    "credit": "",
    "sample": false
  },
  {
    "collection": "commercials",
    "kind": "video",
    "title": "Experience the Magic: Transform Your Photos with AI | realme 13 Pro Series",
    "youtube": "FpO699gSHzc",
    "previewStart": 8,
    "previewScale": 1.2,
    "cover": "",
    "credit": "",
    "sample": false
  },
  {
    "collection": "social",
    "kind": "video",
    "title": "Qin Wen × IFA CEO Leif Lindner Interview in IFA 2026",
    "youtube": "mudYbXa8Yy4",
    "previewStart": 8,
    "previewScale": 1.2,
    "cover": "",
    "credit": "",
    "sample": false
  },
  {
    "collection": "social",
    "kind": "video",
    "title": "Starry Mart London Dock Grand Opening 2025",
    "youtube": "h0nhiedkHGQ",
    "previewStart": 8,
    "previewScale": 1.2,
    "cover": "",
    "credit": "",
    "sample": false
  },
  {
    "collection": "social",
    "kind": "video",
    "title": "W Magazine China Music Showroom: Summer 26 Playlist",
    "vimeo": "1221238820",
    "aspectRatio": 0.75,
    "previewStart": 8,
    "cover": "assets/w-magazine-summer-26.jpg",
    "credit": "",
    "sample": false
  }
];

const aboutCopy = document.querySelector('#about-copy');
if (aboutCopy) aboutCopy.textContent = site.about;
document.querySelector('#year').textContent = new Date().getFullYear();
const emailLink = document.querySelector('#email-link');
if (emailLink && site.email.trim()) {
  const email = site.email.trim();
  emailLink.textContent = email;
  emailLink.href = `mailto:${encodeURIComponent(email)}`;
  emailLink.hidden = false;
  document.querySelector('#contact-placeholder').hidden = true;
}

// About / Contact 独立页面共享配置，只有首页初始化作品和播放器。
if (document.querySelector('#work-viewport')) initPortfolio();

function initPortfolio() {
  const categories = [
    { id: 'films', label: 'Films' },
    { id: 'commercials', label: 'Commercials' },
    { id: 'photography', label: 'Photography' },
    { id: 'social', label: 'Social Contents' },
  ];
  const viewport = document.querySelector('#work-viewport');
  const swipeArea = document.querySelector('#work-swipe-area');
  const track = document.querySelector('#work-track');
  const tablist = document.querySelector('.work-tabs');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = [...track.querySelectorAll('[role="tabpanel"]')];
  const previous = document.querySelector('#previous-category');
  const next = document.querySelector('#next-category');
  const dialog = document.querySelector('#video-dialog');
  const frame = document.querySelector('#video-frame');
  const closeButton = document.querySelector('#close-video');
  let activeIndex = 0;
  let opener = null;
  let gesture = null;
  let suppressClickUntil = 0;
  const previews = createPreviews(dialog);

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function openProject(project, trigger) {
    const isPhoto = project.kind === 'photo';
    const isVimeo = /^\d+$/.test(project.vimeo || '');
    const provider = isVimeo ? 'Vimeo' : 'YouTube';
    if (!isPhoto && !isVimeo && !/^[a-zA-Z0-9_-]{11}$/.test(project.youtube || '')) return;
    const externalUrl = isPhoto ? (project.full || project.cover) : isVimeo ? `https://vimeo.com/${project.vimeo}` : `https://www.youtube.com/watch?v=${project.youtube}`;
    if (!externalUrl) return;
    if (typeof dialog.showModal !== 'function') {
      window.location.assign(externalUrl);
      return;
    }
    opener = trigger;
    document.querySelector('#video-title').textContent = project.title;
    document.querySelector('#video-credit').textContent = `${project.sample ? (isPhoto ? 'Sample photograph · ' : 'Sample film · ') : ''}${project.credit || ''}`;
    document.querySelector('#viewer-mode').textContent = isPhoto ? 'Now viewing' : 'Now playing';
    const playerHelp = document.querySelector('#player-help');
    playerHelp.hidden = isPhoto;
    playerHelp.textContent = `If playback is unavailable here, open the film on ${provider}.`;
    closeButton.setAttribute('aria-label', isPhoto ? 'Close photograph' : 'Close video');
    const externalLink = document.querySelector('#video-link');
    externalLink.href = externalUrl;
    externalLink.textContent = isPhoto ? 'Open full image' : `Watch on ${provider}`;
    frame.classList.toggle('is-photo', isPhoto);
    const aspectRatio = Number(project.aspectRatio) || 16 / 9;
    frame.classList.toggle('is-portrait', !isPhoto && aspectRatio < 1);
    frame.style.setProperty('--video-ratio', String(aspectRatio));
    if (isPhoto) {
      const image = document.createElement('img');
      image.src = externalUrl;
      image.alt = project.alt || project.title;
      frame.replaceChildren(image);
    } else {
      const iframe = document.createElement('iframe');
      iframe.title = `${project.title} — ${provider} video player`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      if (isVimeo) {
        // Vimeo 的去品牌参数是否生效取决于上传账户的套餐；免费片源无法保证无 Logo。
        const params = new URLSearchParams({ autoplay: '1', playsinline: '1', title: '0', byline: '0', portrait: '0', badge: '0', vimeo_logo: '0', dnt: '1' });
        iframe.src = `https://player.vimeo.com/video/${project.vimeo}?${params}`;
      } else {
        // YouTube 已废弃 modestbranding，不使用遮罩或裁切伪装去标。
        const params = new URLSearchParams({ autoplay: '1', playsinline: '1', rel: '0' });
        if (/^https?:$/.test(window.location.protocol)) params.set('origin', window.location.origin);
        iframe.src = `https://www.youtube-nocookie.com/embed/${project.youtube}?${params}`;
      }
      frame.replaceChildren(iframe);
    }
    document.body.classList.add('modal-open');
    dialog.showModal();
    previews.refresh();
    closeButton.focus();
  }

  function projectCard(project, index) {
    const isPhoto = project.kind === 'photo';
    const article = element('article', 'project');
    const button = element('button', 'project-button');
    button.type = 'button';
    button.setAttribute('aria-label', `${isPhoto ? 'View' : 'Play'} ${project.title}${project.sample ? (isPhoto ? ' (sample photograph)' : ' (sample film)') : ''}`);
    button.setAttribute('aria-haspopup', 'dialog');
    const visual = element('span', 'project-image');
    visual.classList.toggle('portrait-source', Number(project.aspectRatio) > 0 && Number(project.aspectRatio) < 1);
    const fallback = element('span', 'image-fallback', project.title);
    fallback.setAttribute('aria-hidden', 'true');
    fallback.append(element('small', '', isPhoto ? 'View photograph' : 'Watch film'));
    const img = document.createElement('img');
    img.alt = '';
    img.width = 1280;
    img.height = 720;
    img.loading = index < 3 ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.draggable = false;
    const covers = (isPhoto ? [project.cover, project.full] : project.youtube ? [project.cover, `https://i.ytimg.com/vi/${project.youtube}/maxresdefault.jpg`, `https://i.ytimg.com/vi/${project.youtube}/hqdefault.jpg`] : [project.cover]).filter(Boolean);
    let coverIndex = 0;
    function nextCover() {
      if (++coverIndex < covers.length) img.src = covers[coverIndex];
      else img.hidden = true;
    }
    img.addEventListener('error', nextCover);
    img.addEventListener('load', () => { if (!isPhoto && img.naturalWidth < 200) nextCover(); });
    if (covers.length) img.src = covers[0];
    else img.hidden = true;
    visual.append(fallback, img, element('span', isPhoto ? 'play-label photo-label' : 'play-label', isPhoto ? 'View photograph' : 'Watch film'));
    const caption = element('span', 'project-caption');
    const title = element('span', 'project-title', project.title);
    title.title = project.title;
    caption.append(title);
    button.append(visual, caption);
    button.addEventListener('click', () => openProject(project, button));
    article.append(button);
    if (!isPhoto && (project.youtube || project.vimeo) && site.platformPreviews) previews.add(visual, project);
    return article;
  }

  const groups = categories.map(category => projects.filter(project => (project.collection || 'films') === category.id));
  panels.forEach((panel, index) => {
    const items = groups[index];
    if (items.length) {
      const grid = element('div', 'portfolio-grid');
      items.forEach((project, projectIndex) => grid.append(projectCard(project, projectIndex)));
      panel.append(grid);
      if (items.some(project => project.sample)) {
        panel.append(element('p', 'sample-note', index === 0 ? 'Preview selection — sample films by Blender, shown for demonstration. These are not Cine Harbor productions.' : 'Preview selection — sample work shown for demonstration. These are not Cine Harbor productions.'));
      }
    } else {
      const empty = element('div', 'work-empty');
      empty.append(element('h2', '', categories[index].label), element('p', '', 'New work coming soon.'));
      panel.append(empty);
    }
  });

  function fitHeight() {
    viewport.style.height = `${panels[activeIndex].offsetHeight}px`;
  }

  function setCategory(index, focusTab = false, announce = true) {
    index = Math.max(0, Math.min(categories.length - 1, index));
    const focusWasInPanel = index !== activeIndex && panels[activeIndex].contains(document.activeElement);
    activeIndex = index;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].inert = i !== index;
      panels[i].setAttribute('aria-hidden', String(i !== index));
    });
    track.style.transform = `translateX(-${index * 100}%)`;
    previous.disabled = index === 0;
    next.disabled = index === categories.length - 1;
    const count = groups[index].length;
    document.querySelector('#work-count').textContent = count ? `01 — ${String(count).padStart(2, '0')}` : '00';
    if (announce) document.querySelector('#work-status').textContent = `${categories[index].label}, ${count} ${count === 1 ? 'project' : 'projects'}`;
    if (focusTab || focusWasInPanel) tabs[index].focus({ preventScroll: true });
    // 只滚动分类栏，避免切换时把整页拉回顶部。
    const tabRect = tabs[index].getBoundingClientRect();
    const listRect = tablist.getBoundingClientRect();
    if (tabRect.left < listRect.left) tablist.scrollLeft -= listRect.left - tabRect.left + 6;
    else if (tabRect.right > listRect.right) tablist.scrollLeft += tabRect.right - listRect.right + 6;
    fitHeight();
    previews.refresh();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setCategory(index));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = tabs.length - 1;
      else return;
      event.preventDefault();
      setCategory(target, true);
    });
  });
  previous.addEventListener('click', () => setCategory(activeIndex - 1, true));
  next.addEventListener('click', () => setCategory(activeIndex + 1, true));
  panels.forEach(panel => panel.addEventListener('keydown', event => {
    if (event.target !== panel || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    setCategory(activeIndex + (event.key === 'ArrowRight' ? 1 : -1), true);
  }));

  // 整个 Work 主区域响应手势，包括分类栏、作品及两侧和下方空白。
  // 触屏滑动和鼠标拖动共用 Pointer Events；纵向滚动由浏览器处理。
  swipeArea.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || dialog.open) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dragging: false };
  });
  swipeArea.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.dragging) {
      if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { gesture = null; return; }
      if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
      gesture.dragging = true;
      swipeArea.setPointerCapture(event.pointerId);
      swipeArea.classList.add('is-dragging');
    }
    gesture.dx = dx;
    const atEdge = (activeIndex === 0 && dx > 0) || (activeIndex === categories.length - 1 && dx < 0);
    const distance = atEdge ? dx * .18 : dx;
    track.style.transform = `translateX(calc(-${activeIndex * 100}% + ${distance}px))`;
    event.preventDefault();
  });
  function finishGesture(event, cancelled = false) {
    if (!gesture || event.pointerId !== gesture.id) return;
    const { dragging, dx, id } = gesture;
    gesture = null;
    swipeArea.classList.remove('is-dragging');
    if (swipeArea.hasPointerCapture(id)) swipeArea.releasePointerCapture(id);
    if (!dragging) return;
    suppressClickUntil = performance.now() + 350;
    const direction = !cancelled && Math.abs(dx) > Math.min(90, viewport.clientWidth * .18) ? (dx < 0 ? 1 : -1) : 0;
    setCategory(activeIndex + direction);
  }
  swipeArea.addEventListener('pointerup', event => finishGesture(event));
  swipeArea.addEventListener('pointercancel', event => finishGesture(event, true));
  swipeArea.addEventListener('lostpointercapture', event => finishGesture(event, true));
  swipeArea.addEventListener('dragstart', event => event.preventDefault());
  swipeArea.addEventListener('click', event => {
    if (performance.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);

  // 触控板横向滚动切换；普通纵向滚轮不拦截，惯性滚动不会连续跳页。
  let wheelDistance = 0;
  let lastWheelAt = 0;
  let wheelLocked = false;
  swipeArea.addEventListener('wheel', event => {
    if (event.ctrlKey || dialog.open) return;
    const dx = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
    if (!dx || (!event.shiftKey && Math.abs(dx) <= Math.abs(event.deltaY))) return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheelAt > 180) { wheelLocked = false; wheelDistance = 0; }
    lastWheelAt = now;
    if (wheelLocked) return;
    wheelDistance += dx * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1);
    if (Math.abs(wheelDistance) > 50) {
      setCategory(activeIndex + (wheelDistance > 0 ? 1 : -1));
      wheelLocked = true;
    }
  }, { passive: false });

  closeButton.addEventListener('click', () => dialog.close());
  let backdropPointerDown = false;
  dialog.addEventListener('pointerdown', event => { backdropPointerDown = event.target === dialog; });
  dialog.addEventListener('click', event => {
    if (event.target === dialog && backdropPointerDown) dialog.close();
    backdropPointerDown = false;
  });
  dialog.addEventListener('close', () => {
    frame.replaceChildren();
    document.body.classList.remove('modal-open');
    opener?.focus({ preventScroll: true });
    previews.refresh();
  });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(fitHeight);
    panels.forEach(panel => observer.observe(panel));
  } else window.addEventListener('resize', fitHeight);
  setCategory(0, false, false);
}

// 首页只加载进入视野的静音短预览；完整影片仍由点击后的独立弹层播放。
function createPreviews(dialog) {
  const toggle = document.querySelector('#toggle-previews');
  toggle.hidden = !site.platformPreviews;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const entries = new Map();
  let enabled = !motion.matches;
  let api;
  let vimeoAPI;

  function loadVimeoAPI() {
    if (window.Vimeo?.Player) return Promise.resolve(window.Vimeo);
    if (!vimeoAPI) vimeoAPI = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.onload = () => resolve(window.Vimeo);
      script.onerror = () => { script.remove(); vimeoAPI = null; reject(new Error('Vimeo preview unavailable')); };
      document.head.append(script);
    });
    return vimeoAPI;
  }

  function hideVimeoPreview(entry) {
    entry.visual.classList.remove('preview-ready');
    entry.visual.dataset.previewState = 'paused';
  }

  function failVimeoPreview(entry) {
    if (entry.failed) return;
    entry.failed = true;
    entry.loading = false;
    entry.ready = false;
    hideVimeoPreview(entry);
    entry.visual.dataset.previewState = 'unavailable';
    entry.player?.destroy().catch(() => {});
    entry.player = null;
  }

  async function updateVimeo(entry) {
    const active = shouldPlay(entry);
    if (entry.ready) {
      const player = entry.player;
      try {
        if (active) {
          await player.play();
          // 切换分类或打开弹层期间，未完成的播放请求不得重新启动预览。
          if (!shouldPlay(entry)) { await player.pause(); hideVimeoPreview(entry); }
        } else {
          hideVimeoPreview(entry);
          await player.pause();
        }
      } catch { if (shouldPlay(entry)) failVimeoPreview(entry); }
      return;
    }
    if (!active || entry.loading || entry.failed) return;
    entry.loading = true;
    entry.visual.dataset.previewState = 'loading';
    try {
      const Vimeo = await loadVimeoAPI();
      if (!shouldPlay(entry)) { entry.loading = false; entry.visual.dataset.previewState = 'idle'; return; }
      const iframe = document.createElement('iframe');
      iframe.className = 'project-preview vimeo-preview';
      iframe.title = `${entry.project.title} — muted preview`;
      iframe.tabIndex = -1;
      iframe.setAttribute('aria-hidden', 'true');
      iframe.allow = 'autoplay; encrypted-media';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      // 免费账户可能忽略 controls / vimeo_logo；保留原始画面，不遮挡标识。
      const params = new URLSearchParams({ autoplay: '0', muted: '1', loop: '1', autopause: '0', controls: '0', keyboard: '0', playsinline: '1', title: '0', byline: '0', portrait: '0', badge: '0', vimeo_logo: '0', dnt: '1' });
      iframe.src = `https://player.vimeo.com/video/${entry.project.vimeo}?${params}`;
      entry.visual.append(iframe);
      const player = new Vimeo.Player(iframe);
      entry.player = player;
      player.on('playing', () => {
        if (!shouldPlay(entry)) { updateVimeo(entry); return; }
        entry.visual.dataset.previewState = 'playing';
        entry.visual.classList.add('preview-ready');
      });
      player.on('pause', () => hideVimeoPreview(entry));
      player.on('error', () => failVimeoPreview(entry));
      await player.ready();
      await player.setMuted(true);
      entry.visual.dataset.previewMuted = String(await player.getMuted());
      const start = Math.max(0, Number(entry.project.previewStart) || 0);
      if (start) await player.setCurrentTime(start);
      let seeking = false;
      player.on('timeupdate', ({ seconds }) => {
        if (seconds < start + 24 || seeking || !shouldPlay(entry)) return;
        seeking = true;
        player.setCurrentTime(start).catch(() => {}).finally(() => { seeking = false; });
      });
      entry.ready = true;
      entry.loading = false;
      await updateVimeo(entry);
    } catch { failVimeoPreview(entry); }
  }

  function loadAPI() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (!api) api = new Promise((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = () => { api = null; reject(new Error('Preview API unavailable')); };
      document.head.append(script);
    });
    return api;
  }

  function shouldPlay(entry) {
    return enabled && entry.visible && !entry.failed && !document.hidden && !dialog.open &&
      !entry.visual.closest('[inert]') && entry.visual.clientWidth >= 200 && entry.visual.clientHeight >= 200;
  }

  function play(entry) {
    // 首次加载和循环均使用限定片段，避免自动播到片尾推荐。
    const start = Math.max(0, Number(entry.project.previewStart) || 35);
    entry.player.mute();
    entry.player.loadVideoById({ videoId: entry.project.youtube, startSeconds: start, endSeconds: start + 24 });
  }

  async function update(entry) {
    if (entry.project.vimeo) { await updateVimeo(entry); return; }
    const active = shouldPlay(entry);
    if (entry.ready) {
      if (active) {
        entry.player.mute();
        if (!entry.started) { entry.started = true; play(entry); }
        else entry.player.playVideo();
      } else {
        entry.player.pauseVideo();
        clearTimeout(entry.revealTimer);
        entry.visual.classList.remove('preview-ready');
        entry.visual.dataset.previewState = 'paused';
      }
      return;
    }
    if (!active || entry.loading || entry.failed) return;
    entry.loading = true;
    entry.visual.dataset.previewState = 'loading';
    try {
      const YT = await loadAPI();
      // 用户可能已滚走、切换分类或打开弹层。
      if (!shouldPlay(entry)) { entry.loading = false; entry.visual.dataset.previewState = 'idle'; return; }
      const iframe = document.createElement('iframe');
      iframe.className = 'project-preview';
      // 只裁切首页的装饰性预览；弹层完整影片保留原始比例和播放器控件。
      iframe.style.setProperty('--preview-scale', String(entry.project.previewScale || 1.6));
      iframe.title = `${entry.project.title} — muted preview`;
      iframe.tabIndex = -1;
      iframe.setAttribute('aria-hidden', 'true');
      iframe.allow = 'autoplay; encrypted-media';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      const params = new URLSearchParams({ enablejsapi: '1', autoplay: '0', mute: '1', controls: '0', playsinline: '1', rel: '0', disablekb: '1' });
      if (/^https?:$/.test(location.protocol)) params.set('origin', location.origin);
      iframe.src = `https://www.youtube-nocookie.com/embed/${entry.project.youtube}?${params}`;
      entry.visual.append(iframe);
      function fail() {
        clearTimeout(entry.revealTimer);
        entry.failed = true;
        entry.ready = false;
        entry.started = false;
        entry.visual.dataset.previewState = 'unavailable';
        entry.visual.classList.remove('preview-ready');
        entry.player?.destroy();
      }
      entry.player = new YT.Player(iframe, { events: {
        onReady: () => { entry.ready = true; update(entry); },
        onStateChange: event => {
          if (event.data === YT.PlayerState.PLAYING) {
            entry.player.mute();
            if (!shouldPlay(entry)) { update(entry); return; }
            entry.visual.dataset.previewState = 'playing';
            entry.visual.dataset.previewMuted = String(entry.player.isMuted());
            clearTimeout(entry.revealTimer);
            entry.revealTimer = setTimeout(() => {
              if (shouldPlay(entry) && entry.player.getPlayerState() === YT.PlayerState.PLAYING) entry.visual.classList.add('preview-ready');
            }, 900);
          } else if ([YT.PlayerState.BUFFERING, YT.PlayerState.ENDED].includes(event.data)) {
            clearTimeout(entry.revealTimer);
            entry.visual.classList.remove('preview-ready');
            if (event.data === YT.PlayerState.ENDED && shouldPlay(entry)) play(entry);
          }
        },
        onError: fail,
        onAutoplayBlocked: fail,
      } });
    } catch {
      entry.failed = true;
      entry.visual.dataset.previewState = 'unavailable';
    }
  }

  function refresh() { entries.forEach(update); }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(changes => {
    changes.forEach(change => {
      const entry = entries.get(change.target);
      entry.visible = change.isIntersecting && change.intersectionRatio >= .25;
      update(entry);
    });
  }, { threshold: [0, .25] }) : null;

  function updateToggle() {
    toggle.setAttribute('aria-pressed', String(!enabled));
    toggle.setAttribute('aria-label', enabled ? 'Pause previews' : 'Play previews');
    toggle.title = enabled ? 'Pause previews' : 'Play previews';
    toggle.querySelector('span').textContent = enabled ? 'Ⅱ' : '▷';
  }
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    // 手动重新开启时允许因浏览器自动播放限制失败的预览重试。
    if (enabled) entries.forEach(entry => { if (entry.failed) { entry.failed = false; entry.loading = false; entry.ready = false; entry.started = false; } });
    updateToggle();
    refresh();
  });
  motion.addEventListener('change', () => { enabled = !motion.matches; updateToggle(); refresh(); });
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('resize', refresh);
  updateToggle();
  return {
    refresh,
    add(visual, project) {
      const entry = { visual, project, visible: false, loading: false, ready: false, started: false, failed: false, player: null };
      entries.set(visual, entry);
      visual.dataset.previewState = 'idle';
      observer?.observe(visual);
    },
  };
}
