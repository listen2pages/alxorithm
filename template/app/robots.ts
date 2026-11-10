import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.jedzeniewarszawa.pl';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/home/', '/auth/', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
