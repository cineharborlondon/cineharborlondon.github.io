'use strict';

// 编辑这里即可更新简介、邮箱、项目。无需安装或构建。
// email 留空时不显示邮件链接，避免访客写信到虚构地址。
const site = {
  email: '',
  // 暂时保留第三方静音预览；完全去平台标识需要后续替换为自托管片源。
  platformPreviews: true,
  about: 'Cine Harbor is a London-based cinematography portfolio, with a focus on light, atmosphere, and the moments that make a story feel human.',
};



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
    { id: 'films', label: 'FILMS' },
    { id: 'commercials', label: 'COMMERCIALS' },
    { id: 'branded-content', label: 'EDITORIAL' },
    { id: 'social', label: 'CONTENT' },
    { id: 'photography', label: 'PHOTOGRAPHY' },
  ];
  const viewport = document.querySelector('#work-viewport');
  const swipeArea = document.querySelector('#work-swipe-area');
  const track = document.querySelector('#work-track');
  const tablist = document.querySelector('.work-tabs');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = [...track.querySelectorAll('[role="tabpanel"]')];
  const previous = document.querySelector('#previous-category');
  const next = document.querySelector('#next-category');
  const filmMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const filmRails = [...swipeArea.querySelectorAll('.film-rail')];
  const filmGlow = swipeArea.querySelector('.film-glow');

  function moveFilm(direction) {
    if (!direction || filmMotion.matches) return;
    filmRails.forEach(rail => {
      rail.getAnimations().forEach(animation => animation.cancel());
      rail.animate([
        { transform: 'translateX(0)' },
        { transform: `translateX(${-direction * 114}px)` },
      ], { duration: 900, easing: 'cubic-bezier(.22,.7,.28,1)' });
    });
    if (filmGlow) {
      // Keep the ambient drift; replace only the previous switch pulse.
      filmGlow.getAnimations().filter(animation => animation.id === 'film-switch').forEach(animation => animation.cancel());
      const pulse = filmGlow.animate([{ opacity: .68 }, { opacity: .95, offset: .4 }, { opacity: .68 }], { duration: 1300, easing: 'ease-in-out' });
      pulse.id = 'film-switch';
    }
  }

  let activeIndex = 0;
  let gesture = null;
  let suppressClickUntil = 0;
  const previews = createPreviews();

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function projectCard(project, index) {
    const isPhoto = project.kind === 'photo';
    const article = element('article', 'project');
    article.classList.toggle('portrait-project', !isPhoto && Number(project.aspectRatio) > 0 && (Number(project.aspectRatio) < 1 || project.fashionPriority));
    article.classList.toggle('fashion-project', Boolean(project.fashionPriority));
    const button = element('a', 'project-button');
    button.href = project.url;
    button.setAttribute('aria-label', `View ${project.title}${project.sample ? (isPhoto ? ' (sample photograph)' : ' (sample film)') : ''}`);
    const visual = element('span', 'project-image');
    visual.classList.toggle('photo-source', isPhoto);
    if (!isPhoto && Number(project.aspectRatio) > 0) {
      visual.style.setProperty('--card-ratio', Number(project.aspectRatio));
      article.style.setProperty('--card-ratio', Number(project.aspectRatio));
    }
    visual.classList.toggle('portrait-source', Number(project.aspectRatio) > 0 && Number(project.aspectRatio) < 1);
    const fallback = element('span', 'image-fallback', project.title);
    fallback.setAttribute('aria-hidden', 'true');
    fallback.append(element('small', '', isPhoto ? 'View photographs' : 'View project'));
    const img = document.createElement('img');
    img.alt = '';
    img.width = isPhoto ? (project.images?.[0]?.width || 1280) : 1280;
    img.height = isPhoto ? (project.images?.[0]?.height || 720) : 720;
    img.loading = index < 3 ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.draggable = false;
    if (project.coverPosition) img.style.objectPosition = project.coverPosition;
    const covers = (isPhoto ? [project.cover, project.full] : [project.cover]).filter(Boolean);
    let coverIndex = 0;
    function nextCover() {
      if (++coverIndex < covers.length) img.src = covers[coverIndex];
      else img.hidden = true;
    }
    img.addEventListener('error', nextCover);
    img.addEventListener('load', () => { if (!isPhoto && img.naturalWidth < 200) nextCover(); });
    if (covers.length) img.src = covers[0];
    else img.hidden = true;
    visual.append(fallback, img, element('span', isPhoto ? 'play-label photo-label' : 'play-label', isPhoto ? 'View photographs' : 'View project'));
    const caption = element('span', 'project-caption');
    const title = element('span', 'project-title', project.title);
    title.title = project.title;
    caption.append(title);
    button.append(visual, caption);
    article.append(button);
    if (!isPhoto && project.vimeo && site.platformPreviews) previews.add(visual, project);
    return article;
  }

  const groups = categories.map(category => projects.filter(project => project.listed !== false && (project.collection || 'films') === category.id)
    .sort((a, b) => Number(a.pinLast === true) - Number(b.pinLast === true) || (a.pinLast === true && b.pinLast === true ? Number(a.pinLastOrder || 0) - Number(b.pinLastOrder || 0) : Number(b.fashionPriority === true) - Number(a.fashionPriority === true) || Number(a.contentOrder || 99) - Number(b.contentOrder || 99) || Number(Number(a.aspectRatio) < 1) - Number(Number(b.aspectRatio) < 1))));
  panels.forEach((panel, index) => {
    const items = groups[index];
    if (items.length) {
      const grid = element('div', categories[index].id === 'photography' ? 'portfolio-grid' : 'portfolio-grid mixed-format-grid');
      const fashion = items.filter(project => project.fashionPriority);
      if (fashion.length) {
        grid.style.setProperty('--fashion-ratio-sum', fashion.reduce((sum, project) => sum + Number(project.aspectRatio), 0));
        grid.style.setProperty('--fashion-gaps', `${(fashion.length - 1) * 24 + 2}px`);
      }
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
    const direction = Math.sign(index - activeIndex);
    activeIndex = index;
    if (announce) moveFilm(direction);
    history.replaceState(null, '', '#' + categories[index].id);
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
    if (event.pointerType === 'touch' || !event.isPrimary || event.button !== 0) return;
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

  // Touch Events keep phone swipes independent of Pointer Events capture support.
  let touchGesture = null;
  swipeArea.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) { touchGesture = null; return; }
    const touch = event.touches[0];
    touchGesture = { id: touch.identifier, x: touch.clientX, y: touch.clientY, dx: 0, dragging: false };
  }, { passive: true });
  swipeArea.addEventListener('touchmove', event => {
    if (!touchGesture) return;
    if (event.touches.length !== 1) { finishTouch(true); return; }
    const touch = [...event.touches].find(item => item.identifier === touchGesture.id);
    if (!touch) return;
    const dx = touch.clientX - touchGesture.x;
    const dy = touch.clientY - touchGesture.y;
    if (!touchGesture.dragging) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { touchGesture = null; return; }
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
      touchGesture.dragging = true;
      swipeArea.classList.add('is-dragging');
    }
    touchGesture.dx = dx;
    if (event.cancelable) event.preventDefault();
    const atEdge = (activeIndex === 0 && dx > 0) || (activeIndex === categories.length - 1 && dx < 0);
    track.style.transform = `translateX(calc(-${activeIndex * 100}% + ${atEdge ? dx * .18 : dx}px))`;
  }, { passive: false });
  function finishTouch(cancelled = false) {
    if (!touchGesture) return;
    const { dragging, dx } = touchGesture;
    touchGesture = null;
    swipeArea.classList.remove('is-dragging');
    if (!dragging) return;
    suppressClickUntil = performance.now() + 350;
    const direction = !cancelled && Math.abs(dx) > Math.min(60, viewport.clientWidth * .12) ? (dx < 0 ? 1 : -1) : 0;
    setCategory(activeIndex + direction);
  }
  swipeArea.addEventListener('touchend', event => {
    if (touchGesture && ![...event.touches].some(item => item.identifier === touchGesture.id)) finishTouch();
  });
  swipeArea.addEventListener('touchcancel', () => finishTouch(true));

  // 触控板横向滚动切换；普通纵向滚轮不拦截，惯性滚动不会连续跳页。
  let wheelDistance = 0;
  let lastWheelAt = 0;
  let wheelLocked = false;
  swipeArea.addEventListener('wheel', event => {
    if (event.ctrlKey) return;
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

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(fitHeight);
    panels.forEach(panel => observer.observe(panel));
  } else window.addEventListener('resize', fitHeight);
  const initialCategory = categories.findIndex(category => '#' + category.id === location.hash);
  setCategory(Math.max(0, initialCategory), false, false);
  window.addEventListener('hashchange', () => {
    const index = categories.findIndex(category => '#' + category.id === location.hash);
    if (index >= 0) setCategory(index, false, false);
  });
}

// 首页只加载进入视野的静音短预览；完整影片在项目详情页播放。
function createPreviews() {
  const toggle = document.querySelector('#toggle-previews');
  toggle.hidden = !site.platformPreviews;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const entries = new Map();
  let enabled = !motion.matches;
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
    clearTimeout(entry.retryTimer);
    if (entry.retries < 2) entry.retryTimer = setTimeout(() => {
      entry.retries += 1;
      entry.failed = false;
      updateVimeo(entry);
    }, 1800 * (entry.retries + 1));
  }

  async function updateVimeo(entry) {
    const active = shouldPlay(entry);
    if (entry.ready) {
      const player = entry.player;
      if (entry.updating) return;
      entry.updating = true;
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
      finally {
        entry.updating = false;
        if (entry.ready && active !== shouldPlay(entry)) updateVimeo(entry);
      }
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
      const params = new URLSearchParams({ autoplay: '1', muted: '1', loop: '1', autopause: '0', controls: '0', keyboard: '0', playsinline: '1', title: '0', byline: '0', portrait: '0', badge: '0', vimeo_logo: '0', dnt: '1' });
      if (entry.project.vimeoHash) params.set('h', entry.project.vimeoHash);
      iframe.src = `https://player.vimeo.com/video/${entry.project.vimeo}?${params}`;
      entry.visual.append(iframe);
      const player = new Vimeo.Player(iframe);
      entry.player = player;
      player.on('playing', () => {
        if (entry.player !== player) return;
        if (!shouldPlay(entry)) { updateVimeo(entry); return; }
        entry.visual.dataset.previewState = 'playing';
        entry.visual.classList.add('preview-ready');
      });
      player.on('pause', () => { if (entry.player === player) hideVimeoPreview(entry); });
      player.on('error', () => { if (entry.player === player) failVimeoPreview(entry); });
      await player.ready();
      await player.setMuted(true);
      entry.visual.dataset.previewMuted = 'true';
      const start = Math.max(0, Number(entry.project.previewStart) || 0);
      if (start) await player.setCurrentTime(start).catch(() => {});
      let seeking = false;
      player.on('timeupdate', ({ seconds }) => {
        if (seconds < start + (Number(entry.project.previewDuration) || 24) || seeking || !shouldPlay(entry)) return;
        seeking = true;
        player.setCurrentTime(start).catch(() => {}).finally(() => { seeking = false; });
      });
      entry.ready = true;
      entry.loading = false;
      await updateVimeo(entry);
    } catch { failVimeoPreview(entry); }
  }

  function shouldPlay(entry) {
    return enabled && entry.visible && !entry.failed && !document.hidden &&
      !entry.visual.closest('[inert]') && entry.visual.clientWidth > 0 && entry.visual.clientHeight > 0;
  }

  function refresh() { entries.forEach(updateVimeo); }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(changes => {
    changes.forEach(change => {
      const entry = entries.get(change.target);
      entry.visible = change.isIntersecting && change.intersectionRatio >= .25;
      updateVimeo(entry);
    });
  }, { threshold: [0, .25] }) : null;

  function updateToggle() {
    toggle.setAttribute('aria-pressed', String(!enabled));
    toggle.setAttribute('aria-label', enabled ? 'Pause previews' : 'Play previews');
    toggle.title = enabled ? 'Pause previews' : 'Play previews';
    toggle.querySelector('span').innerHTML = enabled
      ? '<svg viewBox="0 0 24 24" class="preview-icon"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>'
      : '<svg viewBox="0 0 24 24" class="preview-icon"><path d="M7 4.5a.8.8 0 0 1 1.2-.7l12 7.5a.8.8 0 0 1 0 1.4l-12 7.5a.8.8 0 0 1-1.2-.7Z"/></svg>';
    document.querySelector('#work-swipe-area').classList.toggle('previews-paused', !enabled);
    if (!enabled) entries.forEach(entry => {
      entry.visual.classList.remove('preview-ready');
      entry.visual.dataset.previewState = 'paused';
    });
  }
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    // 手动重新开启时允许因浏览器自动播放限制失败的预览重试。
    if (enabled) entries.forEach(entry => { if (entry.failed) { clearTimeout(entry.retryTimer); entry.retries = 0; entry.failed = false; entry.loading = false; entry.ready = false; } });
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
      const entry = { visual, project, visible: false, loading: false, ready: false, failed: false, retries: 0, retryTimer: null, updating: false, player: null };
      entries.set(visual, entry);
      visual.dataset.previewState = 'idle';
      if (observer) observer.observe(visual);
      else { entry.visible = true; updateVimeo(entry); }
    },
  };
}
