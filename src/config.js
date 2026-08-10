const env = import.meta.env;

export const MFES = {
  catalog: {
    label: 'Catalog & discovery',
    owner: 'React + MUI',
    tag: 'luxe-catalog',
    src: env.VITE_MFE_CATALOG ?? 'https://luxe-catalog-microfrontend.onrender.com/mfe/luxe-catalog.js',
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
    src: env.VITE_MFE_ACCOUNT ?? 'https://microfrontend-account-order.vercel.app/mfe/luxe-account.js',
  },
};

export const ROUTES = [
  // Catalog
  { pattern: /^\/$/, mfe: 'catalog', props: () => ({ route: 'home' }) },
  { pattern: /^\/products\/?$/, mfe: 'catalog', props: () => ({ route: 'list' }) },
  { pattern: /^\/product\/([^/]+)$/, mfe: 'catalog', props: (m) => ({ route: 'detail', productId: m[1] }) },
  { pattern: /^\/living-room\/?$/, mfe: 'catalog', props: () => ({ route: 'living-room' }) },
  { pattern: /^\/bedroom\/?$/, mfe: 'catalog', props: () => ({ route: 'bedroom' }) },
  { pattern: /^\/kitchen\/?$/, mfe: 'catalog', props: () => ({ route: 'kitchen' }) },
  { pattern: /^\/decor\/?$/, mfe: 'catalog', props: () => ({ route: 'decor' }) },
  { pattern: /^\/search\/?$/, mfe: 'catalog', props: () => ({ route: 'search' }) },

  // Cart
  { pattern: /^\/cart\/?$/, mfe: 'cart', props: () => ({ route: 'cart' }) },
  { pattern: /^\/checkout\/shipping\/?$/, mfe: 'cart', props: () => ({ route: 'shipping' }) },
  { pattern: /^\/checkout\/payment\/?$/, mfe: 'cart', props: () => ({ route: 'payment' }) },
  { pattern: /^\/checkout\/confirmation\/?$/, mfe: 'cart', props: () => ({ route: 'confirmation' }) },

  // Account — her element accepts profile | orders | login | wishlist | reviews.
  // The bare /account catch-all must stay last, or it swallows the others.
  { pattern: /^\/account\/orders\/?$/, mfe: 'account', props: () => ({ route: 'orders' }) },
  { pattern: /^\/account\/login\/?$/, mfe: 'account', props: () => ({ route: 'login' }) },
  { pattern: /^\/account\/wishlist\/?$/, mfe: 'account', props: () => ({ route: 'wishlist' }) },
  { pattern: /^\/account\/reviews\/?$/, mfe: 'account', props: () => ({ route: 'reviews' }) },
  { pattern: /^\/account/, mfe: 'account', props: () => ({ route: 'profile' }) },
];

export const PATH_FOR_STEP = {
  cart: '/cart',
  shipping: '/checkout/shipping',
  payment: '/checkout/payment',
  confirmation: '/checkout/confirmation',
};

export const PATH_FOR_DESTINATION = {
  catalog: '/products',
  orders: '/account/orders',
  'living-room': '/living-room',
  bedroom: '/bedroom',
  kitchen: '/kitchen',
  decor: '/decor',
  search: '/search',
};