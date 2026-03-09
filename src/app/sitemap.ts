import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

/**
 * Helper to get the canonical base URL from env, with trailing slash removed.
 */
const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
  if (!url) throw new Error("Environment variable NEXT_PUBLIC_APP_URL is required for sitemap.");
  return url;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // Use Promise.all for parallel querying
  const [novels, chapters] = await Promise.all([
    db.novel.findMany({
      select: { slug: true, updatedAt: true },
    }),
    db.chapter.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
        novel: { select: { slug: true } },
      },
    }),
  ]);

  // Strongly type the items (minimize use of any)
  type Novel = { slug: string; updatedAt: Date };
  type Chapter = { slug: string; updatedAt: Date; novel: { slug: string } };

  const now = new Date();

  const urls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...novels.map((novel: Novel) => ({
      url: `${baseUrl}/novel/${encodeURIComponent(novel.slug)}`,
      lastModified: novel.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...chapters.map((chapter: Chapter) => ({
      url: `${baseUrl}/novel/${encodeURIComponent(chapter.novel.slug)}/${encodeURIComponent(chapter.slug)}`,
      lastModified: chapter.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return urls;
}