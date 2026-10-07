// Run: node build-projects.mjs. Output is plain HTML for GitHub Pages.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
// Keep designated closing projects last, even when new entries are appended.
const projects = JSON.parse(readFileSync(path.join(root, 'projects-data.json'), 'utf8'))
  .sort((a, b) => String(a.collection).localeCompare(String(b.collection)) || (a.collection === 'fashion' ? Number(a.fashionOrder || 99) - Number(b.fashionOrder || 99) : Number(a.pinLast === true) - Number(b.pinLast === true) || (a.pinLast === true && b.pinLast === true ? Number(a.pinLastOrder || 0) - Number(b.pinLastOrder || 0) : Number(b.fashionPriority === true) - Number(a.fashionPriority === true) || Number(a.contentOrder || 99) - Number(b.contentOrder || 99) || Number(Number(a.aspectRatio) < 1) - Number(Number(b.aspectRatio) < 1))));
const labels = { films: 'Films', commercials: 'Commercials', 'branded-content': 'Editorial', fashion: 'Fashion', content: 'Content', social: 'Fashion', photography: 'Photography' };
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const version = 'film-stage-4';
writeFileSync(path.join(root, 'projects.js'), '// Generated from projects-data.json by build-projects.mjs.\nconst projects = ' + JSON.stringify(projects, null, 2) + ';\n');

function photo(image, index, hero = false) {
  return `<button class="gallery-photo${hero ? ' hero-photo' : ''}" type="button" data-photo="${index}" aria-label="Enlarge photograph ${index + 1}">
    <img src="${esc(image.src)}" ${image.small ? `srcset="${esc(image.small)} 960w, ${esc(image.src)} 1920w" sizes="${hero ? '(max-width: 1000px) 94vw, 78vw' : '(max-width: 600px) 92vw, (max-width: 900px) 46vw, 26vw'}"` : ''} width="${image.width}" height="${image.height}" alt="${esc(image.alt)}" loading="${hero ? 'eager' : 'lazy'}" decoding="async"${hero ? ' fetchpriority="high"' : ''}>
  </button>`;
}

function relatedVideo(video, showTitle = false, headingLevel = 2) {
  if (!/^\d+$/.test(video.vimeo || '')) throw new Error('A related video needs a Vimeo ID');
  const hash = video.vimeoHash ? 'h=' + encodeURIComponent(video.vimeoHash) + '&' : '';
  const embed = `https://player.vimeo.com/video/${video.vimeo}?${hash}playsinline=1&title=0&byline=0&portrait=0&dnt=1`;
  const portrait = showTitle && Number(video.aspectRatio) < 1;
  return `<article class="related-video${portrait ? ' related-video-portrait' : ''}"><div class="related-video-player" style="--video-ratio:${Number(video.aspectRatio) || 16 / 9}"><iframe src="${esc(embed)}" title="${esc(video.title)} — Vimeo video player" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>${showTitle ? `<h${headingLevel} class="related-video-title">${esc(video.title)}</h${headingLevel}>` : ''}</article>`;
}

for (const project of projects) {
  if (!labels[project.collection] || !/^[a-z0-9-]+$/.test(project.slug)) throw new Error('Invalid project route');
  const images = project.images || [];
  const isPhoto = project.kind === 'photo';
  const label = labels[project.collection];
  const back = '/work.html#' + (project.collection === 'content' ? 'commercials' : project.collection);
  // Retain merged project routes, but show one entry in Work and project navigation.
  const siblings = projects.filter(p => p.listed !== false && p.collection === project.collection);
  const next = siblings.length > 1 ? siblings[(siblings.indexOf(project) + 1) % siblings.length] : null;
  const ratio = Number(project.aspectRatio) || 16 / 9;
  if (!isPhoto && !/^\d+$/.test(project.vimeo || '')) throw new Error('A video project needs a Vimeo ID');
  const provider = 'Vimeo';
  const hash = project.vimeoHash ? encodeURIComponent(project.vimeoHash) : '';
  const embed = `https://player.vimeo.com/video/${project.vimeo}?${hash ? 'h=' + hash + '&' : ''}playsinline=1&title=0&byline=0&portrait=0&dnt=1`;
  const hero = project.groupedVideoLayout ? '' : isPhoto ? '' : `<div class="detail-player${ratio < 1 ? ' detail-player-portrait' : ''}" style="--video-ratio:${ratio}"><iframe src="${esc(embed)}" title="${esc(project.title)} — ${provider} video player" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
  const description = project.description ? `<div class="project-description">${project.description.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')}</div>` : '';
  const credits = Array.isArray(project.credits) && project.credits.length ? `<dl class="project-credits">${project.credits.map(c => `<div><dt>${esc(c.role)}</dt><dd>${esc(c.name)}</dd></div>`).join('')}</dl>` : project.credit ? `<p class="project-credits">${esc(project.credit)}</p>` : '';
  const galleryImages = images;
  let gallery = galleryImages.length ? `<section class="project-gallery" aria-label="${isPhoto ? 'Photography' : 'Project stills'}">${galleryImages.map((im, i) => photo(im, i)).join('\n')}</section>` : '';
  if (isPhoto && project.photoGroups?.length) {
    const indices = project.photoGroups.flatMap(group => group.indices);
    if (indices.length !== images.length || new Set(indices).size !== images.length || indices.some(i => !images[i])) throw new Error('Photo groups must include every image exactly once');
    gallery = `<div class="photo-sections">${project.photoGroups.map((group, i) => `<section class="photo-group" ${group.title ? `aria-labelledby="photo-group-${i}"` : 'aria-label="Photography"'}>${group.title ? `<h2 id="photo-group-${i}">${esc(group.title)}</h2>` : ''}<div class="project-gallery">${group.indices.map(index => photo(images[index], index)).join('\n')}</div></section>`).join('\n')}</div>`;
  }
  const relatedVideos = (project.relatedVideoGroups || []).flatMap(group => group.videos || []);
  if (project.groupedVideoLayout && !relatedVideos.some(video => video.vimeo === project.vimeo)) throw new Error('A grouped project must include its primary video in a group');
  const related = project.groupedVideoLayout
    ? `<section class="related-videos video-series" aria-label="Film series">${(project.relatedVideoGroups || []).filter(group => group.videos?.length).map((group, index) => `<section class="video-series-group" aria-labelledby="video-group-${index}"><h2 class="video-series-heading" id="video-group-${index}">${esc(group.title)}</h2><div class="related-video-grid-grouped${group.videos.length === 4 && group.videos.every(video => Number(video.aspectRatio) < 1) ? ' portrait-pair-grid' : ''}">${group.videos.map(video => relatedVideo(video, true, 3)).join('\n')}</div></section>`).join('\n')}</section>`
    : relatedVideos.length ? `<section class="related-videos" aria-label="${project.showVideoTitles ? 'More films in this series' : 'Related videos'}"><div class="related-video-grid${project.showVideoTitles ? ' related-video-grid-labelled' : ''}">${relatedVideos.map(video => relatedVideo(video, project.showVideoTitles === true)).join('\n')}</div></section>` : '';
  const seriesStyles = project.showVideoTitles || project.groupedVideoLayout || (!isPhoto && ratio < 1) ? `<link rel="stylesheet" href="/project-series.css?v=large-portrait-20261008b">` : '';
  const videoCaption = project.videoTitle ? `<p class="detail-video-caption">${esc(project.videoTitle)}</p>` : '';
  const lightbox = images.length ? `<dialog class="photo-dialog" aria-label="Photograph viewer"><div class="photo-viewer"><div class="photo-toolbar"><p id="photo-counter" aria-live="polite"></p><button type="button" class="close-button" id="close-photo" autofocus>Close <span aria-hidden="true">×</span></button></div><img id="full-photo" alt=""><div class="photo-navigation"><button type="button" id="previous-photo" class="close-button">Previous</button><button type="button" id="next-photo" class="close-button">Next</button></div></div></dialog><script id="gallery-data" type="application/json">${JSON.stringify(images).replace(/</g, '\\u003c')}</script><script src="/project.js?v=${version}" defer></script>` : '';
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#ebe4d6"><meta name="referrer" content="strict-origin-when-cross-origin"><title>${esc(project.title)} · Cine Harbor</title><meta name="description" content="${esc(project.description || `${project.title} — ${label} by Cine Harbor, London.`)}"><link rel="icon" href="/assets/favicon.svg?v=845" type="image/svg+xml"><link rel="stylesheet" href="/style.css?v=${isPhoto ? 'photo-galleries-20261007' : 'embedded-only-20261005'}">${seriesStyles}<link rel="stylesheet" href="/work-header.css?v=unified-brand-20261007"></head>
<body id="top"${isPhoto ? ' class="photography-detail"' : ''}><a class="skip-link" href="#project">Skip to project</a><div class="page-shell detail-page">
<header class="site-header work-header"><a class="wordmark work-wordmark" href="/index.html" aria-label="Cine Harbor, home"><span aria-hidden="true">CINE</span><span aria-hidden="true">HARBOR</span></a><nav class="work-header-right" aria-label="Main navigation"><a href="${back}" aria-current="page">Work</a><a href="/about.html">About</a><a href="/contact.html">Contact</a></nav></header>
<main id="project"><div class="detail-breadcrumb"><a href="${back}">${label}</a><span>${esc(project.title)}</span></div>${hero}${videoCaption}
<section class="project-information" aria-labelledby="project-title"><div class="project-heading"><div class="project-title-row"><h1 id="project-title">${esc(project.title)}</h1></div><p class="project-category">${[project.displayCategory || label, project.location, project.year].filter(Boolean).map(esc).join(' · ')}</p></div>${description}${credits ? `<div class="project-facts">${credits}</div>` : ''}</section>
${gallery}${related}<nav class="project-pagination" aria-label="Project navigation"><a href="${back}">Back to ${label}</a>${next ? `<a href="${esc(next.url)}"><span>Next project</span><strong>${esc(next.title)}</strong></a>` : ''}</nav></main>
<div class="page-return"><a href="#top">Back to top ↑</a></div><footer class="site-footer"><p>© ${new Date().getFullYear()} Cine Harbor</p><p class="footer-location">LONDON <span aria-hidden="true">·</span> WORLDWIDE</p><nav class="footer-socials" aria-label="Contact Cine Harbor"><a href="mailto:info@cineharbor.space" aria-label="Email info@cineharbor.space" title="Email"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6 8.5 7 8.5-7"/></svg></a></nav></footer></div>${lightbox}</body></html>\n`;
  writeFileSync(path.join(root, project.url.slice(1)), html);
}
console.log(`Generated ${projects.length} project pages and homepage data.`);

