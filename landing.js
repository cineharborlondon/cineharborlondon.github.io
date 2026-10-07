(() => {
  const title = document.querySelector('#image-title');
  const openingFilm = document.querySelector('.opening-film');
  let introStarted = false;
  const entry = document.querySelector('.enter-work');
  const status = document.querySelector('#frame-status');
  function shuffleFrames(sourceFrames) {
    const byFilm = new Map();
    for (const frame of sourceFrames) {
      const film = frame.sourceGroup || frame.src;
      if (!byFilm.has(film)) byFilm.set(film, { film, frames: [] });
      byFilm.get(film).frames.push(frame);
    }
    const groups = [...byFilm.values()];
    for (const group of groups) {
      // Randomize moments within each film as well as the order of the films.
      for (let index = group.frames.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(Math.random() * (index + 1));
        [group.frames[index], group.frames[swap]] = [group.frames[swap], group.frames[index]];
      }
    }

    const sequence = [];
    const filmOrder = [];
    const separation = Math.min(8, groups.length - 1);
    while (sequence.length < sourceFrames.length) {
      const previous = filmOrder[filmOrder.length - 1];
      const available = groups.filter(group => group.frames.length);
      const differentFilm = available.filter(group => group.film !== previous);
      const remainingTotal = sourceFrames.length - sequence.length - 1;
      const candidates = differentFilm.filter(candidate => {
        const first = filmOrder[0] || candidate.film;
        // Leave enough slots between copies of each film, including both ends
        // of the loop. This avoids a same-film pile-up at the end of a shuffle.
        return groups.every(group => {
          const remaining = group.frames.length - Number(group === candidate);
          const slots = remainingTotal - remaining + 1
            - Number(group.film === candidate.film) - Number(group.film === first);
          return remaining <= slots;
        });
      });
      // A future manifest dominated by one film may make separation impossible;
      // retain every supplied frame and separate as many as the pool permits.
      const possible = candidates.length ? candidates : differentFilm.length ? differentFilm : available;
      const nearby = new Set(filmOrder.slice(-separation));
      if (remainingTotal < separation) {
        filmOrder.slice(0, separation - remainingTotal).forEach(film => nearby.add(film));
      }
      const spaced = possible.filter(group => !nearby.has(group.film));
      const choices = spaced.length ? spaced : possible;
      // Weight by remaining frames so underrepresented films are not all spent
      // early, while every visit still gets a new random sequence and first frame.
      let draw = Math.random() * choices.reduce((total, group) => total + group.frames.length, 0);
      let selected = choices[choices.length - 1];
      for (const group of choices) {
        draw -= group.frames.length;
        if (draw < 0) {
          selected = group;
          break;
        }
      }
      sequence.push(selected.frames.pop());
      filmOrder.push(selected.film);
    }
    return sequence;
  }

  // Preserve the complete catalog; use verified caption-free stills for the opening only.
  const sourceFrames = (window.landingFrames || [])
    .filter(frame => frame && typeof frame.src === 'string' && frame.src);
  const cleanFrames = shuffleFrames(sourceFrames.filter(frame => frame.openingSafe === true));
  const openingFrames = cleanFrames.length
    ? Array.from({ length: 18 }, (_, index) => cleanFrames[index % cleanFrames.length])
    : [];
  const frames = [...openingFrames, ...shuffleFrames(sourceFrames)];
  const loopStart = openingFrames.length;
  const frameDuration = 180;
  const openingDurations = [320, 280, 240, 220, 200];
  let displayedFrames = 0;
  const preloadCount = 6;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cache = new Map();
  const unavailable = new Set();
  let activeFrame = -1;
  let wantsPlayback = !motion.matches;
  let timer;
  let generation = 0;

  function isPlaying() {
    return wantsPlayback && !document.hidden && activeFrame >= 0 && frames.length > 1;
  }

  function updateControl() {
    entry.dataset.playback = wantsPlayback ? 'playing' : 'paused';
  }

  function loadFrame(index) {
    if (unavailable.has(index)) return Promise.reject(new Error('Still unavailable'));
    if (cache.has(index)) return cache.get(index).ready;
    const image = new Image();
    image.decoding = 'async';
    const ready = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        image.onload = image.onerror = null;
        reject(new Error('Still timed out'));
      }, 8000);
      image.onload = async () => {
        try {
          if (image.decode) await image.decode();
          clearTimeout(timeout);
          image.onload = image.onerror = null;
          resolve(image);
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };
      image.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Still unavailable'));
      };
      image.src = frames[index].src;
    }).catch(error => {
      unavailable.add(index);
      cache.delete(index);
      throw error;
    });
    cache.set(index, { image, ready });
    return ready;
  }

  function advanceFrame(index, offset = 1) {
    const next = index + offset;
    return next < frames.length ? next : loopStart + (next - frames.length) % (frames.length - loopStart);
  }

  function prepareFrames(index) {
    const keep = new Set([(index - 1 + frames.length) % frames.length]);
    // Decode a small rolling window, rather than retaining 120 full-resolution images.
    for (let offset = 0; offset <= Math.min(preloadCount, frames.length - 1); offset += 1) {
      const candidate = advanceFrame(index, offset);
      keep.add(candidate);
      loadFrame(candidate).catch(() => {});
    }
    for (const cachedIndex of cache.keys()) {
      if (!keep.has(cachedIndex)) cache.delete(cachedIndex);
    }
  }

  function displayFrame(index) {
    const frame = frames[index];
    // Only swap after loading and decoding; keep the previous still while buffering.
    title.style.backgroundImage = `url(${JSON.stringify(frame.src)})`;
    title.style.backgroundPosition = frame.position || 'center';
    if (openingFilm && frame.openingSafe === true) {
      openingFilm.style.backgroundImage = title.style.backgroundImage;
      openingFilm.style.backgroundPosition = frame.position || 'center';
    }
    title.classList.add('has-frame');
    if (!introStarted) {
      introStarted = true;
      if (frame.openingSafe === true) document.body.classList.add('intro-playing');
    }
    activeFrame = index;
    displayedFrames += 1;
    title.dataset.frame = String(index + 1);
    prepareFrames(index);
  }

  function scheduleFrame() {
    clearTimeout(timer);
    if (!isPlaying()) return;
    const currentGeneration = generation;
    timer = setTimeout(async () => {
      const nextIndex = advanceFrame(activeFrame);
      for (let attempt = 0; attempt < frames.length; attempt += 1) {
        if (currentGeneration !== generation || !isPlaying()) return;
        const candidate = advanceFrame(nextIndex, attempt);
        try {
          await loadFrame(candidate);
          if (currentGeneration !== generation || !isPlaying()) return;
          displayFrame(candidate);
          break;
        } catch { /* Retain the last good still and continue past an unavailable frame. */ }
      }
      if (currentGeneration === generation) scheduleFrame();
    }, openingDurations[displayedFrames - 1] ?? frameDuration);
  }

  function refreshPlayback() {
    generation += 1;
    clearTimeout(timer);
    updateControl();
    scheduleFrame();
  }

  async function initializeFrames() {
    updateControl();
    prepareFrames(0);
    for (let index = 0; index < frames.length; index += 1) {
      try {
        await loadFrame(index);
        displayFrame(index);
        refreshPlayback();
        return;
      } catch { /* Keep the brown wordmark visible if no still is available. */ }
    }
    status.textContent = 'Film stills are temporarily unavailable.';
  }

  // Use native anchor navigation immediately; no exit animation or artificial delay.
  if (frames.length) initializeFrames();
  document.addEventListener('keydown', event => {
    if (event.code !== 'Space' || event.repeat || event.altKey || event.ctrlKey || event.metaKey || activeFrame < 0) return;
    if (event.target !== document.body && event.target !== entry) return;
    event.preventDefault();
    wantsPlayback = !wantsPlayback;
    refreshPlayback();
    // Announce user actions, not about six frame changes per second.
    status.textContent = wantsPlayback
      ? 'Film still sequence playing.'
      : `Film still sequence paused. Frame ${activeFrame + 1} of ${frames.length}: Cine Harbor.`;
  });
  document.addEventListener('visibilitychange', refreshPlayback);
  motion.addEventListener('change', event => {
    if (event.matches) {
      wantsPlayback = false;
      status.textContent = 'Film still sequence paused to respect reduced motion.';
    }
    refreshPlayback();
  });
})();
