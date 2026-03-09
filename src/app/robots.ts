import type { MetadataRoute } from 'next';

const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    throw new Error('Environment variable NEXT_PUBLIC_APP_URL must be defined.');
  }
  return url.replace(/\/+$/, ''); // Ensure no trailing slash
};

const ROBOT_RULES: MetadataRoute.Robots['rules'] = [
  {
    userAgent: '*',
    allow: '/',
    disallow: ['/admin/', '/admin/*', '/api/'],
  },
];

const getSitemapUrl = (): string => `${getBaseUrl()}/sitemap.xml`;

/**
 * Generates the robots.txt metadata for the application.
 * Uses environment variable NEXT_PUBLIC_APP_URL as the canonical base URL.
 */
const robots = (): MetadataRoute.Robots => ({
  rules: ROBOT_RULES,
  sitemap: getSitemapUrl(),
});

export default robots;