import './styles.css';
import {
  MFES,
  PATH_FOR_DESTINATION,
  PATH_FOR_STEP,
  ROUTES,
} from './config.js';

/*
 * Compatibility shim for microfrontends built in Vite library mode.
 *
 * Vite replaces `process.env.NODE_ENV` in an app build but deliberately leaves
 * it alone in a lib build, because a library is normally consumed by another
 * bundler that will do the replacing. We import bundles straight into the
 * browser instead, so Vue's ESM-bundler build throws
 * "ReferenceError: process is not defined" on its first line.
 *
 * The account bundle hits this 246 times, all of them this one expression, so
 * defining it here is a complete fix. Runs before any dynamic import() below.
 *
 * The cleaner fix belongs in that repo's mfe build:
 *   define: { 'process.env.NODE_ENV': '"production"' }
 * Once it ships there, this shim becomes a no-op and can be deleted.
 */
globalThis.process ??= { env: { NODE_ENV: 'production' } };

const outlet = document.getElementById('outlet');

// The microfrontends draw their own header, so the shell's chrome — and the
// cart badge with it — may not be in the page at all.
const badge = document.getElementById('cart-badge');

const bundles = new Map();

function loadMfe(key) {
  if (!bundles.has(key)) {
    bundles.set(key, importBundle(key));
  }
  return bundles.get(key);
}

async function importBundle(key) {
  const { src, tag, label } = MFES[key];

  if (!src) {
    throw new Error(`${label} has no bundle URL yet — set MFES.${key}.src in src/config.js`);
  }

  await import(/* @vite-ignore */ src);

  if (!customElements.get(tag)) {
    throw new Error(`${src} loaded but never registered <${tag}>`);
  }
}

let mounted = { key: null, el: null };

function matchRoute(path) {
  for (const route of ROUTES) {
    const match = path.match(route.pattern);
    if (match) return { route, props: route.props(match) };
  }
  return { route: ROUTES[0], props: ROUTES[0].props([]) };
}

async function render(path) {
  const { route, props } = matchRoute(path);
  const config = MFES[route.mfe];

  highlightNav(path); // ملاحظة: هذه الدالة لن تفعل شيئاً الآن لأن الروابط اختفت، يمكنك تجاهلها

  if (mounted.key === route.mfe) {
    Object.assign(mounted.el, props);
    return;
  }

  outlet.replaceChildren(panel(`Loading ${config.label.toLowerCase()}…`));

  try {
    await loadMfe(route.mfe);
  } catch (error) {
    console.error(`[shell] ${route.mfe} failed to load`, error);
    outlet.replaceChildren(unavailablePanel(config, error));
    mounted = { key: null, el: null };
    return;
  }

  if (location.pathname !== path) return;

  const el = document.createElement(config.tag);
  el.routing = 'none';
  el.hideChrome = false;
  Object.assign(el, props);

  outlet.replaceChildren(el);
  mounted = { key: route.mfe, el };

  replayBufferedEvents(route.mfe);
}

function navigate(path) {
  if (path === location.pathname) return;
  history.pushState({}, '', path);
  render(path);
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-link]');
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
  event.preventDefault();
  navigate(new URL(link.href).pathname);
});

addEventListener('popstate', () => render(location.pathname));

function highlightNav(path) {
  for (const link of document.querySelectorAll('a[data-link]')) {
    const target = new URL(link.href).pathname;
    const active = target === '/' ? path === '/' : path.startsWith(target);
    link.classList.toggle('is-active', active);
  }
}

addEventListener('luxe:cart:updated', (event) => {
  if (!badge) return;
  const count = event.detail.itemCount;
  badge.textContent = count;
  badge.hidden = count === 0;
});

addEventListener('luxe:checkout:step', (event) => {
  const path = PATH_FOR_STEP[event.detail.step];
  if (!path || location.pathname === path) return;
  history.pushState({}, '', path);
  highlightNav(path);
});

addEventListener('luxe:navigate', (event) => {
  const { to, productId, path } = event.detail || {};

  if (path) {
    navigate(path);
    return;
  }
  if (to === 'product' && productId) {
    navigate(`/product/${encodeURIComponent(productId)}`);
    return;
  }
  navigate(PATH_FOR_DESTINATION[to] ?? '/');
});

addEventListener('luxe:checkout:goto', (event) => {
  const path = PATH_FOR_STEP[event.detail?.step];
  if (path) navigate(path);
});

addEventListener('luxe:order:placed', (event) => {
  console.info('[shell] order placed:', event.detail.order.reference);
});

const buffers = { cart: new Map() };
let replaying = false;

addEventListener('luxe:checkout:set-addresses', (event) => {
  if (!replaying) buffers.cart.set('luxe:checkout:set-addresses', event.detail);
});

function replayBufferedEvents(key) {
  const buffer = buffers[key];
  if (!buffer?.size) return;

  replaying = true;
  for (const [type, detail] of buffer) {
    dispatchEvent(new CustomEvent(type, { detail }));
  }
  replaying = false;
}

function panel(message) {
  const el = document.createElement('div');
  el.className = 'shell-panel';
  el.textContent = message;
  return el;
}

function unavailablePanel({ label, owner, src }, error) {
  const el = document.createElement('div');
  el.className = 'shell-panel shell-panel--error';
  el.innerHTML = `
    <h2>${label} isn't available</h2>
    <p>Owned by the ${owner} member. The shell renders it as soon as the bundle is live.</p>
    <code>${src ?? 'no URL configured'}</code>
    <p class="shell-panel__detail">${error.message}</p>
  `;
  return el;
}

render(location.pathname);

loadMfe('cart')
  .then(() => {
    dispatchEvent(new CustomEvent('luxe:cart:request'));
  })
  .catch((error) => {
    console.warn('[shell] cart preload failed —', error.message);
  });
