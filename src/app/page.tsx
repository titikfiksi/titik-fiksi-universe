import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import {
  Book,
  Star,
  Eye,
  ChevronRight,
  Megaphone,
  Clock,
  Search,
  PenTool,
  Wrench,
  Crown,
  Award,
  PlayCircle,
} from "lucide-react";

export const revalidate = 0;

// --- Constants ---

const PREDEFINED_GENRES: readonly string[] = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Isekai",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "System",
  "Urban Fantasy",
];

// --- Types ---

type Rating = { value: number };
type Chapter = {
  id: string;
  novel: { slug: string; title: string; coverImage?: string | null };
  slug: string;
  title: string;
  orderIndex: number;
  createdAt: string | Date;
};
type Novel = {
  id: string;
  slug: string;
  title: string;
  author?: string | null;
  coverImage?: string | null;
  genre: string;
  status: string;
  views: number;
  synopsis?: string | null;
  youtubeTrailer?: string | null;
  ratings: Rating[];
  chapters: { id: string }[];
  [key: string]: any;
};
type Settings = {
  runningText?: string | null;
  isActive: boolean;
};

// --- Utility Functions ---

const getAverageRating = (ratings: Rating[]): number =>
  ratings?.length ? ratings.reduce((sum, { value }) => sum + value, 0) / ratings.length : 0;

const displayViews = (views: number): string =>
  views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views.toString();

// --- Components ---

const GenreLinks = ({ genres }: { genres: string }) => {
  const genreList = genres
    ? genres.split(",").map((g) => g.trim()).filter(Boolean)
    : [];
  if (!genreList.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {genreList.map((genre) => (
        <Link
          key={genre}
          href={`/search?genre=${encodeURIComponent(genre)}`}
          className="bg-gray-800/80 border border-gray-700 hover:border-blue-500 hover:bg-blue-600/30 px-3 py-1 rounded-lg text-xs font-bold text-gray-300 hover:text-blue-300 transition-all duration-300"
        >
          {genre}
        </Link>
      ))}
    </div>
  );
};

const NovelCard = ({ novel }: { novel: Novel }) => {
  const avgRating = getAverageRating(novel.ratings).toFixed(1);
  const genres = novel.genre
    ? novel.genre.split(",").map((g) => g.trim()).filter(Boolean)
    : [];
  return (
    <Link
      href={`/novel/${novel.slug}`}
      className="group flex flex-col bg-white border border-gray-100 rounded-3xl p-2 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gray-200 mb-3 shadow-sm">
        {novel.coverImage ? (
          <Image
            src={novel.coverImage}
            alt={novel.title}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
            <Book size={40} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md border border-white/20 text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
          <Star size={10} className="fill-amber-400" /> {avgRating}
        </div>
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg z-10">
          {novel.status}
        </div>
      </div>
      <div className="flex flex-col flex-1 px-2 pb-1">
        <h3 className="font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
          {novel.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-2 mb-2 text-gray-500">
          <PenTool size={10} className="text-blue-500" />
          <span className="text-[10px] font-bold truncate max-w-[120px]">
            {novel.author ?? "Lutfi Abdulloh"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {genres.slice(0, 2).map((g) => (
            <span
              key={g}
              className="text-[9px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-md truncate max-w-[80px]"
            >
              {g}
            </span>
          ))}
          {genres.length > 2 && (
            <span className="text-[9px] bg-gray-50 text-gray-500 font-bold px-1.5 py-0.5 rounded-md">
              +{genres.length - 2}
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500 font-medium border-t border-gray-100 pt-2.5">
          <span className="flex items-center gap-1">
            <Eye size={14} />
            {displayViews(novel.views)}
          </span>
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">
            {novel.chapters?.length ?? 0} Bab
          </span>
        </div>
      </div>
    </Link>
  );
};

const ChapterListItem = ({ chapter }: { chapter: Chapter }) => {
  const { novel, slug, title, orderIndex, createdAt } = chapter;
  return (
    <Link
      href={`/novel/${novel.slug}/${slug}`}
      className="flex items-center gap-4 p-3 bg-white hover:bg-blue-50/50 border border-gray-100 hover:border-blue-100 rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
    >
      <div className="w-16 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 shadow-sm relative aspect-[2/3]">
        {novel.coverImage ? (
          <Image
            src={novel.coverImage}
            alt="cover"
            fill
            sizes="100px"
            className="object-cover transform group-hover:scale-110 transition-transform duration-500"
            priority={false}
          />
        ) : (
          <Book size={20} className="absolute inset-0 m-auto h-full text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0 py-1">
        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full mb-1">
          Bab {orderIndex}
        </span>
        <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1 leading-tight">
          {novel.title}
        </h4>
        <p className="text-xs font-medium text-gray-600 line-clamp-2 mt-1 leading-snug pr-2">
          {title}
        </p>
        <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-2">
          <Clock size={10} />{" "}
          {new Date(createdAt).toLocaleDateString("id-ID")}
        </div>
      </div>
      <ChevronRight
        size={16}
        className="text-gray-300 group-hover:text-blue-500 transition-transform transform group-hover:translate-x-1 flex-shrink-0 mr-1"
      />
    </Link>
  );
};

interface BannerProps {
  novel: Novel;
  autoPilot: boolean;
  avgRating: string;
}
const Banner = ({ novel, autoPilot, avgRating }: BannerProps) => (
  <div className="container mx-auto px-4 max-w-6xl mb-16 animate-fade-in-up delay-100">
    <div className="relative rounded-3xl overflow-hidden bg-gray-900 shadow-2xl group border border-gray-800">
      <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity duration-700 bg-gray-900">
        {novel.coverImage && (
          <Image
            src={novel.coverImage}
            alt="bg-blur"
            fill
            className="object-cover blur-2xl scale-125 opacity-60"
            priority
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12">
        <div className="w-48 md:w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 transform group-hover:scale-105 transition-transform duration-500 bg-gray-800 relative aspect-[2/3]">
          {novel.coverImage ? (
            <Image
              src={novel.coverImage}
              alt={novel.title}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <Book size={48} />
            </div>
          )}
          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/20 text-amber-400 text-xs font-black px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 z-20">
            <Star size={14} className="fill-amber-400" /> {avgRating}
          </div>
          <div className={`absolute top-3 right-3 ${autoPilot
            ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
            : "bg-gradient-to-r from-amber-400 to-amber-600 text-gray-900"
            } text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-[0_4px_15px_rgba(251,191,36,0.4)] uppercase tracking-widest z-20`}>
            {autoPilot
              ? (<><Award size={12} /> Populer</>)
              : (<><Crown size={12} className="fill-gray-900" /> Sorotan</>)
            }
          </div>
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-3 drop-shadow-lg">
            {novel.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-300 mb-6">
            <div className="flex items-center gap-1.5">
              <PenTool size={16} className="text-blue-400" />
              <span className="font-bold tracking-wide">
                {novel.author ?? "Lutfi Abdulloh"}
              </span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
            <GenreLinks genres={novel.genre || ""} />
          </div>
          <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-8 max-w-2xl leading-relaxed">
            {novel.synopsis}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <Link
              href={`/novel/${novel.slug}`}
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-xl flex items-center gap-2 transform hover:-translate-y-1"
            >
              Mulai Membaca <ChevronRight size={20} />
            </Link>
            {!!novel.youtubeTrailer && (
              <a
                href={novel.youtubeTrailer}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-4 rounded-xl font-bold hover:bg-white/20 transition flex items-center gap-2"
              >
                <PlayCircle size={20} className="text-red-500" /> Trailer
              </a>
            )}
            <div className="flex flex-col justify-center ml-2 md:ml-4 border-l border-gray-700 pl-4 md:pl-6">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">
                Total Pembaca
              </span>
              <div className="flex items-center gap-1.5 text-gray-300 font-bold">
                <Eye size={18} className="text-blue-400" />
                <span>
                  {displayViews(novel.views)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Page ---

const getHomeData = () =>
  Promise.all([
    db.settings.findFirst() as Promise<Settings | null>,
    db.novel.findMany({
      orderBy: { views: "desc" },
      take: 12,
      include: {
        chapters: {
          where: { isPublished: true },
          select: { id: true },
        },
        ratings: { select: { value: true } },
      },
    }) as Promise<Novel[]>,
    db.chapter.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        novel: { select: { title: true, slug: true, coverImage: true } },
      },
    }) as Promise<Chapter[]>,
    db.novel.findMany({
      where: {
        isFeatured: true,
        OR: [
          { featuredUntil: null },
          { featuredUntil: { gt: new Date() } },
        ],
      },
      include: {
        chapters: { select: { id: true } },
        ratings: { select: { value: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 1,
    }) as Promise<Novel[]>,
    db.novel.findMany({
      where: { status: "Ongoing" },
      include: {
        chapters: { select: { id: true } },
        ratings: { select: { value: true } },
      },
      orderBy: { views: "desc" },
      take: 50,
    }) as Promise<Novel[]>,
  ]);

export default async function HomePage() {
  const [
    settings,
    novels,
    latestChapters,
    featuredManual,
    candidateNovels,
  ] = await getHomeData();

  if (settings && !settings.isActive) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center z-[100] relative">
        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-2xl border border-gray-700">
          <Wrench size={40} className="text-blue-500 animate-bounce" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          Website Sedang <span className="text-blue-500">Perbaikan</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed mb-10">
          Kami sedang melakukan peningkatan sistem untuk memberikan pengalaman membaca yang lebih baik. Silakan kembali beberapa saat lagi.
        </p>
        <Link href="/admin" className="text-gray-600 hover:text-gray-300 text-sm font-bold transition-colors">
          Akses Khusus Admin
        </Link>
      </div>
    );
  }

  // Banner logic
  let bannerNovel: Novel | undefined = featuredManual[0];
  let isAutoPilot = false;

  if (!bannerNovel && candidateNovels.length > 0) {
    // Pick highest rated from candidates (with a tiebreak for no ratings)
    const sortedByRating = candidateNovels
      .map((novel) => ({
        ...novel,
        avgRating: getAverageRating(novel.ratings),
      }))
      .sort((a, b) => b.avgRating - a.avgRating);

    bannerNovel = sortedByRating[0].avgRating > 0 ? sortedByRating[0] : candidateNovels[0];
    isAutoPilot = true;
  }

  const fAvgRating =
    bannerNovel && bannerNovel.ratings.length > 0
      ? getAverageRating(bannerNovel.ratings).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen pb-20 pt-28 overflow-x-hidden bg-gray-50">
      {settings?.runningText && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm py-2 px-4 shadow-md flex items-center overflow-hidden mb-8 animate-fade-in-up">
          <Megaphone size={16} className="mr-3 flex-shrink-0 animate-pulse relative z-10 bg-indigo-700 rounded-full p-1 box-content" />
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-marquee font-bold tracking-wide">
              {settings.runningText}
            </div>
          </div>
        </div>
      )}

      {bannerNovel && (
        <Banner
          novel={bannerNovel}
          autoPilot={isAutoPilot}
          avgRating={fAvgRating}
        />
      )}

      {/* Search Bar */}
      <div className="container mx-auto px-4 max-w-6xl mb-12 animate-fade-in-up delay-100">
        <form
          action="/search"
          method="GET"
          className="relative max-w-2xl mx-auto"
        >
          <input
            type="text"
            name="q"
            placeholder="Cari judul novel..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-medium text-gray-700"
            autoComplete="off"
          />
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-6xl animate-fade-in-up delay-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Novels Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                Koleksi <span className="text-blue-600">Novel</span>
              </h2>
            </div>
            <div className="flex overflow-x-auto custom-scrollbar pb-3 mb-6 gap-2">
              <Link
                href="/search"
                className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-bold whitespace-nowrap shadow-md hover:bg-blue-700 transition"
              >
                Semua Novel
              </Link>
              {PREDEFINED_GENRES.map((g) => (
                <Link
                  key={g}
                  href={`/search?genre=${encodeURIComponent(g)}`}
                  className="px-5 py-2 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 rounded-full text-sm font-bold whitespace-nowrap transition-colors shadow-sm"
                >
                  {g}
                </Link>
              ))}
            </div>
            {novels.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-200 shadow-sm">
                Belum ada novel yang dirilis.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {novels.map((novel) => (
                    <NovelCard key={novel.id} novel={novel} />
                  ))}
                </div>
                {novels.length >= 12 && (
                  <div className="mt-10 text-center">
                    <Link
                      href="/search"
                      className="inline-block px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-50 hover:text-blue-600 transition shadow-sm"
                    >
                      Lihat Semua Novel
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Latest Chapters Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                Update <span className="text-blue-600">Terbaru</span>
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {latestChapters.length === 0 ? (
                <div className="text-center py-10 bg-white border border-gray-200 rounded-2xl text-gray-400 text-sm shadow-sm">
                  Belum ada bab rilis.
                </div>
              ) : (
                latestChapters.map((chapter) => (
                  <ChapterListItem key={chapter.id} chapter={chapter} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}