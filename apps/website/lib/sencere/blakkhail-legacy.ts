/** Legacy blakkhail.com content migrated into the Next.js storefront. */

export const BLAKKHAIL_LEGACY = {
  email: 'blakkhail@gmail.com',
  social: {
    facebook: 'https://www.facebook.com/blakk.hail',
    twitter: 'https://twitter.com/blakkhail',
    instagram: 'https://www.instagram.com/blakkhail/',
    youtube: 'https://www.youtube.com/watch?v=dDsoB8msubk',
  },
  video: {
    youtubeId: 'dDsoB8msubk',
    title: 'Blakk Hail Video',
  },
  nav: [
    { label: 'Home', href: '#home' },
    { label: 'Shop', href: '#shop' },
    { label: 'About Us', href: '#about' },
    { label: 'Look Book', href: '#look-book' },
    { label: 'Video', href: '#video' },
    { label: 'Collection', href: '#collection' },
    { label: 'Contact Us', href: '#contact' },
  ],
  assets: {
    logo: '/sencere-assets/blakkhail/sencere-rabbit-logo.png',
    wordmark: '/sencere-assets/blakkhail/blakkhail-wordmark.png',
    skull: '/sencere-assets/blakkhail/piff-city-skull.png',
    dropAd: '/sencere-assets/blakkhail/blakkhail-drop-ad.png',
    latestDrop: [
      '/sencere-assets/blakkhail/latest-drop-01.jpg',
      '/sencere-assets/blakkhail/latest-drop-02.jpg',
      '/sencere-assets/blakkhail/latest-drop-03.jpg',
    ],
    productCutouts: {
      strawberryFront: '/sencere-assets/blakkhail/latest-drop-01.jpg',
      strawberryBack: '/sencere-assets/blakkhail/latest-drop-01.jpg',
      berryFront: '/sencere-assets/blakkhail/latest-drop-02.jpg',
      berryBack: '/sencere-assets/blakkhail/latest-drop-02.jpg',
      peachFront: '/sencere-assets/blakkhail/latest-drop-03.jpg',
      peachBack: '/sencere-assets/blakkhail/latest-drop-03.jpg',
    },
    heroPhotos: [
      '/sencere-assets/legacy-blakkhail/home/P7210319.jpg',
      '/sencere-assets/legacy-blakkhail/home/P3190168.jpg',
    ],
    lookBook: ['/sencere-assets/legacy-blakkhail/look-book/P3190167.jpg'],
    shopPhotos: [
      '/sencere-assets/legacy-blakkhail/shop/P7210321.jpg',
      '/sencere-assets/legacy-blakkhail/shop/P7210348.jpg',
      '/sencere-assets/legacy-blakkhail/shop/P7210350.jpg',
      '/sencere-assets/legacy-blakkhail/shop/P7210351.jpg',
      '/sencere-assets/legacy-blakkhail/shop/P7210354.jpg',
      '/sencere-assets/legacy-blakkhail/shop/P7210356.jpg',
      '/sencere-assets/legacy-blakkhail/shop/P7210358.jpg',
      '/sencere-assets/legacy-blakkhail/shop/P7210360.jpg',
      '/sencere-assets/legacy-blakkhail/shop/P7210362.jpg',
    ],
  },
} as const;

/** Maps product slugs to legacy shop photos (blakkhail.com/shop.html). */
export const BLAKKHAIL_PRODUCT_IMAGES: Record<string, string> = {
  'chain-gang-black': BLAKKHAIL_LEGACY.assets.shopPhotos[0],
  '2cans-rwg': BLAKKHAIL_LEGACY.assets.shopPhotos[1],
  '2cans-bwb': BLAKKHAIL_LEGACY.assets.shopPhotos[2],
  'alien-alliance-gray': BLAKKHAIL_LEGACY.assets.shopPhotos[3],
  'alien-alliance-black': BLAKKHAIL_LEGACY.assets.shopPhotos[4],
  'alien-alliance-white': BLAKKHAIL_LEGACY.assets.shopPhotos[5],
};
