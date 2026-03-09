import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Book, Star, Eye, Search as SearchIcon, ChevronLeft, Wrench, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  genre?: string;
  p?: string;
};

type NovelCardProps = {
  id: string;
  slug: string;
  title: string;
  coverImage?: string | null;
  views: number;
  chapters: { id: string }[];
  ratings: { value: number }[];
};

const ITEMS_PER_PAGE = 12;

function getPaginationParams(pageParam: string | undefined) {
  const page = Math.max(Number(pageParam) || 1, 1);
  const skip = (page - 1) * ITEMS_PER_PAGE;
  return { page, skip };
}

function buildWhereClause(query: string, genre: string) {
  const where: Record<string, any> = {};
  if (query) {
    where.title = { contains: query, mode: "insensitive" };
  }
  if (genre) {
    where.genre = { contains: genre, mode: "insensitive" };
  }
  return where;
}

function createPageUrl(base: string, query: string, genre: string, page: number) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (genre) params.set("genre", genre);
  params.set("p", page.toString());
  return `${base}?${params.toString()}`;
}

function getAverageRating(ratings: { value: number }[]): string {
  if (!ratings.length) return "0.0";
  const sum = ratings.reduce((a, b) => a + b.value, 0);
  return (sum / ratings.length).toFixed(1);
}

function Pagination({
  currentPage,
  totalPages,
  createUrl,
}: {
  currentPage: number;
  totalPages: number;
  createUrl: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const pageNumbers: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pageNumbers.push(i);
    } else if (
      i === currentPage - 2 ||
      i === currentPage + 2
    ) {
      pageNumbers.push("ellipsis");
    }
  }

  let lastWasEllipsis = false;

  return (
    <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-gray-200">
      <Link
        href={currentPage > 1 ? createUrl(currentPage - 1) : "#"}
        aria-disabled={currentPage <= 1}
        tabIndex={currentPage <= 1 ? -1 : 0}
        className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
          currentPage > 1
            ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300"
            : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed pointer-events-none"
        }`}
      >
        <ChevronLeft size={20} />
      </Link>
      <div className="flex items-center gap-1 px-2">
        {pageNumbers.map((pageNum, idx) => {
          if (pageNum === "ellipsis") {
            if (lastWasEllipsis) return null;
            lastWasEllipsis = true;
            return (
              <span key={`ellipsis-${idx}`} className="text-gray-400 px-1">
                ...
              </span>
            );
          }
          lastWasEllipsis = false;
          return (
            <Link
              key={pageNum}
              href={createUrl(Number(pageNum))}
              aria-current={Number(pageNum) === currentPage ? "page" : undefined}
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                Number(pageNum) === currentPage
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      <Link
        href={currentPage < totalPages ? createUrl(currentPage + 1) : "#"}
        aria-disabled={currentPage >= totalPages}
        tabIndex={currentPage >= totalPages ? -1 : 0}
        className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
          currentPage < totalPages
            ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300"
            : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed pointer-events-none"
        }`}
      >
        <ChevronRight size={20} />
      </Link>
    </div>
  );
}

function SearchSummary({
  query,
  genre,
  total,
}: {
  query: string;
  genre: string;
  total: number;
}) {
  if (!query && !genre) return null;
  return (
    <div className="mb-8 p-4 bg-blue-50 text-blue-700 font-medium rounded-2xl flex items-center justify-between gap-2">
      <span>
        Menampilkan hasil untuk:{" "}
        <strong>{query || genre}</strong>
      </span>
      <span className="text-sm font-bold bg-blue-100 px-3 py-1 rounded-full">
        {total} Ditemukan
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
      <Book className="mx-auto text-gray-300 mb-4" size={48} />
      <h2 className="text-xl font-bold text-gray-700 mb-2">Tidak Ditemukan</h2>
      <p className="text-gray-500">
        Coba gunakan kata kunci atau kategori genre yang berbeda.
      </p>
    </div>
  );
}

function NovelGrid({ novels }: { novels: NovelCardProps[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {novels.map((novel) => {
        const avgRating = getAverageRating(novel.ratings);
        return (
          <Link
            key={novel.id}
            href={`/novel/${novel.slug}`}
            className="group flex flex-col bg-white border border-gray-100 rounded-3xl p-2 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gray-200 mb-3">
              {novel.coverImage ? (
                <Image
                  src={novel.coverImage}
                  alt={novel.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                  priority={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Book size={40} />
                </div>
              )}
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1 z-10">
                <Star size={10} fill="currentColor" />
                {avgRating}
              </div>
            </div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 px-1">
              {novel.title}
            </h3>
            <div className="mt-auto pt-3 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
              <span className="flex items-center gap-1">
                <Eye size={12} /> {novel.views}
              </span>
              <span>{novel.chapters.length} Bab</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = (searchParams.q ?? "").trim();
  const genre = (searchParams.genre ?? "").trim();

  const { page: currentPage, skip } = getPaginationParams(searchParams.p);

  const whereClause = buildWhereClause(query, genre);

  //  Data fetch: get global settings, count, and paginated novels, all in parallel
  const [settings, totalNovels, novels] = await Promise.all([
    db.settings.findFirst({ select: { isActive: true } }),
    db.novel.count({ where: whereClause }),
    db.novel.findMany({
      where: whereClause,
      skip,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        slug: true,
        title: true,
        coverImage: true,
        views: true,
        chapters: { where: { isPublished: true }, select: { id: true } },
        ratings: { select: { value: true } }
      },
      orderBy: { createdAt: "desc" }, // Let’s show recent novels first.
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalNovels / ITEMS_PER_PAGE));
  const createUrl = (page: number) =>
    createPageUrl("/search", query, genre, page);

  if (settings && !settings.isActive) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-6 text-center z-[100]">
        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-2xl border border-gray-700">
          <Wrench size={40} className="text-blue-500 animate-bounce" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          Website Sedang <span className="text-blue-500">Perbaikan</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed mb-10">
          Kami sedang melakukan peningkatan sistem. Silakan kembali beberapa saat lagi.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-32 overflow-x-hidden bg-gray-50">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-4 transition"
            >
              <ChevronLeft size={20} />
              Kembali
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              Eksplorasi <span className="text-blue-600">Cerita</span>
            </h1>
          </div>
          <form
            className="relative w-full md:w-96"
            action="/search"
            method="GET"
            autoComplete="off"
          >
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari judul novel..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium text-gray-700"
              aria-label="Cari judul novel"
            />
            {genre && <input type="hidden" name="genre" value={genre} />}
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-800 transition"
            >
              Cari
            </button>
          </form>
        </div>

        <SearchSummary query={query} genre={genre} total={totalNovels} />

        {novels.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <NovelGrid novels={novels} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              createUrl={createUrl}
            />
          </>
        )}
      </div>
    </div>
  );
}