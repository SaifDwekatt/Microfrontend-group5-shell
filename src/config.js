/**
 * The only file in this repo that changes when a teammate redeploys.
 *
 * `src` must point at the built microfrontend BUNDLE — not the site homepage.
 * Each bundle is a single ES module that registers `tag` as a custom element.
 *
 * Set a bundle to `null` while its owner is still building; the shell then
 * shows a "not deployed yet" panel for that section instead of breaking.
 *
 * Any entry can be pointed somewhere else for local work via `.env.local`
 * (see .env.example) without touching this file — useful for testing your own
 * microfrontend against the shell before it is deployed.
 */
const env = import.meta.env;

export const MFES = {
  catalog: {
    label: 'Catalog & discovery',
    owner: 'React + MUI',
    tag: 'luxe-catalog',
    // TODO: 'https://<catalog>.vercel.app/mfe/luxe-catalog.js'
    src: env.VITE_MFE_CATALOG ?? null,
  },

  cart: {
    label: 'Cart & checkout',
    owner: 'Lit + Material Web',
    tag: 'luxe-cart-checkout',
    src: env.VITE_MFE_CART ?? 'https://saif-group5.vercel.app/mfe/luxe-cart-checkout.js',
  },

  account: {
    label: 'Account & orders',
    owner: 'Vue + Vuetify',
    tag: 'luxe-account',
    // TODO: 'https://<account>.vercel.app/mfe/luxe-account.js'
    src: env.VITE_MFE_ACCOUNT ?? null,
  },
};

/**
 * Path → which microfrontend renders, and what step it opens on.
 * `props` are assigned to the element, so they hit the component's
 * properties rather than attributes (objects survive, casing is exact).
 */
export const ROUTES = [
  { pattern: /^\/$/, mfe: 'catalog', props: () => ({ route: 'home' }) },
  { pattern: /^\/products\/?$/, mfe: 'catalog', props: () => ({ route: 'list' }) },
  {
    pattern: /^\/product\/([^/]+)$/,
    mfe: 'catalog',
    props: (m) => ({ route: 'detail', productId: m[1] }),
  },

  { pattern: /^\/cart\/?$/, mfe: 'cart', props: () => ({ route: 'cart' }) },
  { pattern: /^\/checkout\/shipping\/?$/, mfe: 'cart', props: () => ({ route: 'shipping' }) },
  { pattern: /^\/checkout\/payment\/?$/, mfe: 'cart', props: () => ({ route: 'payment' }) },
  {
    pattern: /^\/checkout\/confirmation\/?$/,
    mfe: 'cart',
    props: () => ({ route: 'confirmation' }),
  },

  { pattern: /^\/account\/orders\/?$/, mfe: 'account', props: () => ({ route: 'orders' }) },
  { pattern: /^\/account/, mfe: 'account', props: () => ({ route: 'profile' }) },
];

/** Reverse of the cart routes — used to keep the URL in step with the MFE. */
export const PATH_FOR_STEP = {
  cart: '/cart',
  shipping: '/checkout/shipping',
  payment: '/checkout/payment',
  confirmation: '/checkout/confirmation',
};

/** Where `luxe:navigate` should send us for destinations the cart doesn't own. */
export const PATH_FOR_DESTINATION = {
  catalog: '/products',
  orders: '/account/orders',
};
