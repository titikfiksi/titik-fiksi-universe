import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Titik Fiksi Universe',
    short_name: 'TitikFiksi',
    description: 'Platform baca novel modern, ringan, dan elegan.',
    start_url: '/',
    display: 'standalone', // Membuat website tampil fullscreen tanpa kolom browser URL di HP
    background_color: '#f9fafb', // Warna background saat aplikasi loading (gray-50)
    theme_color: '#2563eb', // Warna biru khas Titik Fiksi untuk status bar HP
    icons: [
      {
        src: '/favicon.ico', // Pastikan nanti Anda menaruh logo Anda (favicon.ico) di folder 'public'
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}