import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // PERBAIKAN TAHAP 1: Menghapus hardcoded Vercel URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
     throw new Error("NEXT_PUBLIC_APP_URL wajib diisi untuk sitemap!");
  }

  try {
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
        changeFrequency: 'daily',
        priority: 0.8,
      },
      ...novelUrls,
      ...chapterUrls,
    ];
  } catch (error) {
    console.error("Gagal generate sitemap:", error);
    return [];
  }
}