'use strict';

// The gallery is complete in HTML; JavaScript only adds the enlarged viewer.
const images = JSON.parse(document.querySelector('#gallery-data').textContent);
const dialog = document.querySelector('.photo-dialog');
const photo = document.querySelector('#full-photo');
const counter = document.querySelector('#photo-counter');
const previous = document.querySelector('#previous-photo');
const next = document.querySelector('#next-photo');
let current = 0;
let opener;

function show(index) {
  current = Math.max(0, Math.min(images.length - 1, index));
  photo.src = images[current].src;
  photo.alt = images[current].alt;
  counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`;
  previous.disabled = current === 0;
  next.disabled = current === images.length - 1;
}

document.querySelectorAll('[data-photo]').forEach(button => {
  button.addEventListener('click', () => {
    const index = Number(button.dataset.photo);
    if (typeof dialog.showModal !== 'function') { location.assign(images[index].src); return; }
    opener = button;
    show(index);
    dialog.showModal();
    document.body.classList.add('modal-open');
  });
});
previous.addEventListener('click', () => show(current - 1));
next.addEventListener('click', () => show(current + 1));
document.querySelector('#close-photo').addEventListener('click', () => dialog.close());
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
let backdropDown = false;
dialog.addEventListener('pointerdown', event => { backdropDown = event.target === dialog; });
dialog.addEventListener('click', event => { if (event.target === dialog && backdropDown) dialog.close(); backdropDown = false; });
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); opener?.focus({ preventScroll: true }); });
