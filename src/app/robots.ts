import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // PERBAIKAN TAHAP 1: Menghapus hardcoded Vercel URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL wajib diisi!");
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/admin/*', '/api/'], 
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}