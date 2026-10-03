// Run: node build-projects.mjs. Output is plain HTML for GitHub Pages.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const projects = JSON.parse(readFileSync(path.join(root, 'projects-data.json'), 'utf8'));
const labels = { films: 'Films', commercials: 'Commercials', photography: 'Photography', social: 'Social Contents' };
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const version = 'brown-josefin-2';
writeFileSync(path.join(root, 'projects.js'), '// Generated from projects-data.json by build-projects.mjs.\nconst projects = ' + JSON.stringify(projects, null, 2) + ';\n');

function photo(image, index, hero = false) {
  return `<button class="gallery-photo${hero ? ' hero-photo' : ''}" type="button" data-photo="${index}" aria-label="Enlarge photograph ${index + 1}">
    <img src="${esc(image.src)}" ${image.small ? `srcset="${esc(image.small)} 960w, ${esc(image.src)} 1920w" sizes="${hero ? '(max-width: 1000px) 94vw, 78vw' : '(max-width: 600px) 92vw, (max-width: 900px) 46vw, 26vw'}"` : ''} width="${image.width}" height="${image.height}" alt="${esc(image.alt)}" loading="${hero ? 'eager' : 'lazy'}" decoding="async"${hero ? ' fetchpriority="high"' : ''}>
  </button>`;
}

for (const project of projects) {
  if (!labels[project.collection] || !/^[a-z0-9-]+$/.test(project.slug)) throw new Error('Invalid project route');
  const images = project.images || [];
  const isPhoto = project.kind === 'photo';
  const label = labels[project.collection];
  const back = '/#' + project.collection;
  const siblings = projects.filter(p => p.collection === project.collection);
  const next = siblings.length > 1 ? siblings[(siblings.indexOf(project) + 1) % siblings.length] : null;
  const ratio = Number(project.aspectRatio) || 16 / 9;
  const provider = project.vimeo ? 'Vimeo' : 'YouTube';
  const external = project.vimeo ? `https://vimeo.com/${project.vimeo}` : `https://www.youtube.com/watch?v=${project.youtube}`;
  const embed = project.vimeo ? `https://player.vimeo.com/video/${project.vimeo}?playsinline=1&title=0&byline=0&portrait=0&dnt=1` : `https://www.youtube-nocookie.com/embed/${project.youtube}?playsinline=1&rel=0`;
  const hero = isPhoto ? (images[0] ? photo(images[0], 0, true) : '') : `<div class="detail-player${ratio < 1 ? ' detail-player-portrait' : ''}" style="--video-ratio:${ratio}"><iframe src="${esc(embed)}" title="${esc(project.title)} — ${provider} video player" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
  const description = project.description ? `<div class="project-description">${project.description.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')}</div>` : '';
  const credits = Array.isArray(project.credits) && project.credits.length ? `<dl class="project-credits">${project.credits.map(c => `<div><dt>${esc(c.role)}</dt><dd>${esc(c.name)}</dd></div>`).join('')}</dl>` : project.credit ? `<p class="project-credits">${esc(project.credit)}</p>` : '';
  const galleryImages = isPhoto ? images.slice(1) : images;
  const gallery = galleryImages.length ? `<section class="project-gallery" aria-label="${isPhoto ? 'Photography' : 'Project stills'}">${galleryImages.map((im, i) => photo(im, i + (isPhoto ? 1 : 0))).join('\n')}</section>` : '';
  const lightbox = images.length ? `<dialog class="photo-dialog" aria-label="Photograph viewer"><div class="photo-viewer"><div class="photo-toolbar"><p id="photo-counter" aria-live="polite"></p><button type="button" class="close-button" id="close-photo" autofocus>Close <span aria-hidden="true">×</span></button></div><img id="full-photo" alt=""><div class="photo-navigation"><button type="button" id="previous-photo" class="close-button">Previous</button><button type="button" id="next-photo" class="close-button">Next</button></div></div></dialog><script id="gallery-data" type="application/json">${JSON.stringify(images).replace(/</g, '\\u003c')}</script><script src="/project.js?v=${version}" defer></script>` : '';
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#ebe4d6"><meta name="referrer" content="strict-origin-when-cross-origin"><title>${esc(project.title)} · Cine Harbor</title><meta name="description" content="${esc(project.description || `${project.title} — ${label} by Cine Harbor, London.`)}"><link rel="icon" href="/assets/favicon.svg?v=845" type="image/svg+xml"><link rel="stylesheet" href="/style.css?v=${version}"></head>
<body id="top"><a class="skip-link" href="#project">Skip to project</a><div class="page-shell detail-page">
<header class="site-header"><a class="wordmark" href="${back}" aria-label="Cine Harbor, work"><img class="site-logo" src="/assets/logo.svg?v=849-175" width="389" height="123" alt="Cine Harbor"></a><nav aria-label="Main navigation"><a href="${back}" aria-current="location">Work</a><a href="/about.html">About</a><a href="/contact.html">Contact</a></nav></header>
<main id="project"><div class="detail-breadcrumb"><a href="${back}">${label}</a><span>${esc(project.title)}</span></div>${hero}
<section class="project-information" aria-labelledby="project-title"><div class="project-heading"><h1 id="project-title">${esc(project.title)}</h1><p class="project-category">${label}${project.year ? ' · ' + esc(project.year) : ''}</p></div>${description}<div class="project-facts">${project.location ? `<p>${esc(project.location)}</p>` : ''}${credits}${!isPhoto ? `<a class="original-film" href="${external}" target="_blank" rel="noopener noreferrer">Watch on ${provider}</a>` : `<p>${images.length} photographs</p>`}</div></section>
${gallery}<nav class="project-pagination" aria-label="Project navigation"><a href="${back}">Back to ${label}</a>${next ? `<a href="${esc(next.url)}"><span>Next project</span><strong>${esc(next.title)}</strong></a>` : ''}</nav></main>
<footer class="site-footer"><p>© ${new Date().getFullYear()} Cine Harbor</p><img class="footer-logo" src="/assets/logo.svg?v=849-175" width="389" height="123" alt="" aria-hidden="true"><a href="#top">Back to top</a></footer></div>${lightbox}</body></html>\n`;
  writeFileSync(path.join(root, project.url.slice(1)), html);
}
console.log(`Generated ${projects.length} project pages and homepage data.`);
