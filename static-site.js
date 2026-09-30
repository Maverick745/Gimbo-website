// Lightweight progressive enhancement for the standalone static export only.
document.querySelector('.documentary-play')?.addEventListener('click', (event) => {
  const button = event.currentTarget;
  const frame = document.createElement('iframe');
  frame.src = 'https://www.youtube-nocookie.com/embed/EVJxh23jBoM?autoplay=1&rel=0';
  frame.title = "Gimbo Children's Foundation documentary";
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  button.replaceWith(frame);
});
const toggle = document.querySelector('.mobile-nav-toggle');
const layer = document.querySelector('.mobile-nav-layer');
const panel = document.querySelector('.mobile-nav-panel');
function setMenu(open) {
  if (!layer) return;
  layer.inert = !open;
  layer.classList.toggle('is-open', open);
  layer.setAttribute('aria-hidden', String(!open));
  toggle?.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  requestAnimationFrame(() => (open ? panel?.querySelector('button') : toggle)?.focus());
}
toggle?.addEventListener('click', () => setMenu(true));
layer?.querySelectorAll('a,button').forEach(el => el.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (!layer?.classList.contains('is-open')) return;
  if (event.key === 'Escape') setMenu(false);
  if (event.key === 'Tab') {
    const items = [...panel.querySelectorAll('a,button')];
    const target = event.shiftKey ? items.at(-1) : items[0];
    if (document.activeElement === (event.shiftKey ? items[0] : items.at(-1))) { event.preventDefault(); target.focus(); }
  }
});

document.querySelectorAll('video').forEach(video => {
  const button = video.parentElement.querySelector('button');
  const allowAuto = !matchMedia('(prefers-reduced-motion: reduce)').matches && !navigator.connection?.saveData;
  let manualPause = false;
  const play = () => video.play().catch(() => {});
  video.addEventListener('canplay', () => video.classList.add('is-ready'));
  const label = () => {
    button.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
    button.querySelector('span').textContent = video.paused ? '▶' : 'Ⅱ';
  };
  video.addEventListener('play', label); video.addEventListener('pause', label);
  button?.addEventListener('click', () => { manualPause = !video.paused; if (manualPause) video.pause(); else play(); });
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) video.pause();
    else if (allowAuto && !manualPause) play();
  }, {threshold: .2});
  observer.observe(video);
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
});

const photos = [...document.querySelectorAll('.gallery-item > button')];
if (photos.length) {
  const dialog = document.createElement('dialog');
  dialog.className = 'static-photo-dialog';
  dialog.setAttribute('aria-label', 'Photo viewer');
  dialog.innerHTML = '<button aria-label="Close photo viewer">Close ×</button><img alt=""><p></p><div><button aria-label="Previous image">Previous</button><button aria-label="Next image">Next</button></div>';
  document.body.append(dialog);
  let active = 0;
  const show = index => {
    active = (index + photos.length) % photos.length;
    const source = photos[active].querySelector('img');
    dialog.querySelector('img').src = source.src;
    dialog.querySelector('img').alt = source.alt;
    dialog.querySelector('p').textContent = source.alt;
  };
  photos.forEach((button,index) => button.addEventListener('click', () => { show(index); dialog.showModal(); }));
  dialog.querySelector('[aria-label="Close photo viewer"]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[aria-label="Previous image"]').addEventListener('click', () => show(active - 1));
  dialog.querySelector('[aria-label="Next image"]').addEventListener('click', () => show(active + 1));
  dialog.addEventListener('keydown', event => { if (event.key === 'ArrowRight') show(active+1); if (event.key === 'ArrowLeft') show(active-1); });
  dialog.addEventListener('close', () => photos[active].focus());
}
