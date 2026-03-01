import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Ganti URL ini dengan domain asli Anda saat sudah online nanti
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://titikfiksi.vercel.app'

  try {
    // 1. Ambil data semua novel dari database
    const novels = await db.novel.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const novelUrls = novels.map((novel: any) => ({
      url: `${baseUrl}/novel/${novel.slug}`,
      lastModified: novel.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));

    // 2. Ambil data semua bab (chapter) yang sudah dipublish
    const chapters = await db.chapter.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
        novel: {
          select: { slug: true }
        }
      },
    });

    const chapterUrls = chapters.map((chapter: any) => ({
      url: `${baseUrl}/novel/${chapter.novel.slug}/${chapter.slug}`,
      lastModified: chapter.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // 3. Gabungkan rute statis (Beranda, Cari) dengan rute dinamis
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'always',
        priority: 0.8,
      },
      ...novelUrls,
      ...chapterUrls,
    ];
  } catch (error) {
    console.error("Gagal membuat sitemap:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      }
    ];
  }
}