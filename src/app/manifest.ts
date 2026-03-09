import type { MetadataRoute } from 'next';

const manifest: () => MetadataRoute.Manifest = () => ({
  name: 'Titik Fiksi Universe',
  short_name: 'TitikFiksi',
  description: 'Platform baca novel modern, ringan, dan elegan.',
  start_url: '/',
  display: 'standalone',
  background_color: '#f9fafb',
  theme_color: '#2563eb',
  icons: [
    {
      src: '/favicon.ico',
      sizes: 'any',
      type: 'image/x-icon',
    },
  ],
});

export default manifest;