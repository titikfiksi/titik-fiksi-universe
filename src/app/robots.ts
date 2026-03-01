import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Ganti URL ini dengan domain asli Anda saat sudah online nanti
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://titikfiksi.vercel.app'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Mencegah Google melacak dan menampilkan halaman panel kontrol Admin ke publik
      disallow: ['/admin/', '/admin/*', '/api/'], 
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}