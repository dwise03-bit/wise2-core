import type { MetadataRoute } from 'next';

const publicRoutes = [
  '/', '/platform', '/products', '/hermes', '/about', '/contact', '/services',
  '/solutions', '/work', '/pricing', '/process', '/soundlab', '/sound-labs',
  '/wise-defense', '/hvac', '/fieldtech', '/quest', '/privacy', '/terms',
  '/start-your-build',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://wise2.net';
  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' || route === '/hermes' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : route === '/hermes' ? 0.95 : 0.7,
  }));
}
