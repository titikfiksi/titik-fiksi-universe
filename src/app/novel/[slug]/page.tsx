import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Star,
  Eye,
  BookOpen,
  ExternalLink,
  PenTool,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Link as LinkIcon,
  MessageCircle,
  Wrench,
  Heart,
} from "lucide-react";
import ViewTracker from "@/components/ViewTracker";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButton from "@/components/ShareButton";
import TrailerModal from "@/components/TrailerModal";
import ExpandableSynopsis from "@/components/ExpandableSynopsis";
import ContinueReadingButton from "@/components/ContinueReadingButton";
import PagedChapterList from "@/components/PagedChapterList";

export const revalidate = 60;

// ===============================
// SEO: Open Graph & Meta Generator
// ===============================
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const novel = await db.novel.findUnique({
    where: { slug: params.slug },
  });

  if (!novel) {
    return {
      title: "Novel Tidak Ditemukan | Titik Fiksi Universe",
    };
  }

  const safeDescription =
    novel.synopsis?.slice(0, 160) ??
    "Baca novel seru ini eksklusif di Titik Fiksi Universe";

  const imageUrl =
    novel.coverImage || "https://i.ibb.co.com/7xj5JTgp/Poster-2.jpg";

  return {
    title: `${novel.title} - Baca di Titik Fiksi Universe`,
    description: safeDescription,
    openGraph: {
      title: novel.title,
      description: safeDescription,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: `Cover Novel ${novel.title}`,
        },
      ],
    },
  };
}

// =======================
// Social Icon Components
// =======================
const TikTokIcon = ({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v7a8 8 0 1 1-8-8v3a5 5 0 1 0 5 5z" />
  </svg>
);

function getSocialIcon(platformRaw: string, size = 14) {
  const platform = platformRaw?.toLowerCase() || "";
  if (platform.includes("instagram") || platform.includes("ig"))
    return <Instagram size={size} />;
  if (platform.includes("tiktok")) return <TikTokIcon size={size} />;
  if (platform.includes("twitter") || platform.includes("x"))
    return <Twitter size={size} />;
  if (platform.includes("facebook") || platform.includes("fb"))
    return <Facebook size={size} />;
  if (platform.includes("youtube") || platform.includes("yt"))
    return <Youtube size={size} />;
  if (platform.includes("whatsapp") || platform.includes("wa"))
    return <MessageCircle size={size} />;
  return <LinkIcon size={size} />;
}

// ==========================
// Main Page Component
// ==========================
interface NovelDetailPageProps {
  params: { slug: string };
}
export default async function NovelDetailPage({
  params,
}: NovelDetailPageProps) {
  // Fetch settings and show maintenance if needed early
  const settings = await db.settings.findFirst({});

  if (settings && settings.isActive === false) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center z-[100] relative">
        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-2xl border border-gray-700">
          <Wrench size={40} className="text-blue-500 animate-bounce" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          Website Sedang <span className="text-blue-500">Perbaikan</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed mb-10">
          Kami sedang melakukan peningkatan sistem. Silakan kembali beberapa saat
          lagi.
        </p>
      </div>
    );
  }

  // Fetch all novel data with a single request
  const novel = await db.novel.findUnique({
    where: { slug: params.slug },
    include: {
      chapters: {
        where: { isPublished: true },
        orderBy: { orderIndex: "asc" },
      },
      ratings: true,
      externalLinks: true,
      authorSocials: true,
    },
  });

  if (!novel) return notFound();

  // Calculate average rating; fallback to 0.0 if no rating
  const ratings = novel.ratings || [];
  const ratingsTotal = ratings.length;
  const avgRating =
    ratingsTotal > 0
      ? (ratings.reduce((sum, { value }) => sum + value, 0) / ratingsTotal).toFixed(1)
      : "0.0";

  const authorSocials = Array.isArray(novel.authorSocials)
    ? novel.authorSocials
    : [];
  const authorDonationUrl = novel.authorDonationUrl || "";

  // Genre splitting, trimming, filtering (remove empty strings)
  const genres =
    typeof novel.genre === "string"
      ? novel.genre
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean)
      : [];

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20">
      <ViewTracker novelId={novel.id} />
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Left Column ==================== */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <div className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-white group w-2/3 mx-auto md:w-full">
              {novel.coverImage ? (
                <Image
                  src={novel.coverImage}
                  alt={novel.title}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition duration-700"
                  sizes="(max-width: 768px) 66vw, 100vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                  <BookOpen size={64} />
                </div>
              )}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-yellow-400 font-black px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg z-10">
                <Star size={18} fill="currentColor" />
                {avgRating}
              </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              {/* -- Author Info -- */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs md:text-sm font-bold border-b border-gray-50 pb-4">
                <span className="text-gray-400 uppercase tracking-widest pt-1">
                  Penulis
                </span>
                <div className="flex flex-col sm:items-end gap-2">
                  <span className="text-gray-900 flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                    <PenTool size={14} className="text-emerald-600" />
                    {novel.author || "Lutfi Abdulloh"}
                  </span>

                  {/* -- Author Social Links & Donation -- */}
                  <div className="flex flex-wrap justify-start sm:justify-end gap-1.5 mt-1">
                    {authorDonationUrl && (
                      <a
                        href={authorDonationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5"
                      >
                        <Heart size={12} className="fill-current animate-pulse" />
                        Dukung Penulis
                      </a>
                    )}

                    {authorSocials.map((social) => (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-emerald-600 hover:shadow-md transition-all transform hover:-translate-y-0.5"
                        title={social.platform}
                        aria-label={social.platform}
                      >
                        {getSocialIcon(social.platform, 12)}
                        <span className="capitalize">{social.platform}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* -- Status, Readers, Genre -- */}
              <div className="flex items-center justify-between text-xs md:text-sm font-bold border-b border-gray-50 pb-4">
                <span className="text-gray-400 uppercase tracking-widest">
                  Status
                </span>
                <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {novel.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm font-bold border-b border-gray-50 pb-4">
                <span className="text-gray-400 uppercase tracking-widest">
                  Pembaca
                </span>
                <span className="text-gray-900 flex items-center gap-2">
                  <Eye size={16} />
                  {novel.views}
                </span>
              </div>

              <div className="flex items-start justify-between text-xs md:text-sm font-bold gap-4 pt-1">
                <span className="text-gray-400 uppercase tracking-widest flex-shrink-0 pt-1">
                  Genre
                </span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {genres.length > 0
                    ? genres.map((genre, i) => (
                        <Link
                          key={genre || i}
                          href={`/search?genre=${encodeURIComponent(genre)}`}
                          className="bg-gray-50 border border-gray-200 text-gray-700 px-2.5 py-1 rounded-lg text-[10px] md:text-xs hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md transition-all duration-300"
                          title={`Cari novel dengan genre ${genre}`}
                        >
                          {genre}
                        </Link>
                      ))
                    : null}
                </div>
              </div>
            </div>

            {/* -- External Links (availability elsewhere) -- */}
            {!!novel.externalLinks?.length && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">
                  Tersedia Juga Di:
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {novel.externalLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-500 transition shadow-sm group"
                      title={link.title}
                      aria-label={link.title}
                    >
                      <span className="font-bold text-gray-700 text-sm group-hover:text-blue-600">
                        {link.title}
                      </span>
                      <ExternalLink
                        size={16}
                        className="text-gray-300 group-hover:text-blue-500 flex-shrink-0"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* -- Actions -- */}
            <div className="flex flex-col gap-3">
              <ContinueReadingButton
                novelSlug={novel.slug}
                chapters={novel.chapters}
              />
              <BookmarkButton novel={{ id: novel.id, title: novel.title }} />
              <ShareButton title={novel.title} />
              {novel.youtubeTrailer && (
                <TrailerModal youtubeId={novel.youtubeTrailer} />
              )}
            </div>
          </div>

          {/* Right Column ==================== */}
          <div className="lg:col-span-8 space-y-10 md:space-y-12">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 md:mb-6 leading-tight text-center md:text-left">
                {novel.title}
              </h1>
              <ExpandableSynopsis text={novel.synopsis} />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-3">
                  Daftar Isi{" "}
                  <span className="text-xs md:text-sm font-bold bg-blue-600 text-white px-3 py-1 rounded-full">
                    {novel.chapters.length} Bab
                  </span>
                </h2>
              </div>
              <PagedChapterList
                chapters={novel.chapters}
                novelSlug={novel.slug}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}