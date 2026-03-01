"use client";

import Link from "next/link";
import Image from "next/image";
import { Book, Search, Star, Bookmark, TrendingUp, Eye } from "lucide-react";
import { useState } from "react";
import { useReaderStore } from "@/lib/store";

export default function NovelList({ initialNovels }: { initialNovels: any[] }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Semua");
  const [activeGenre, setActiveGenre] = useState("Semua");
  
  // Menggunakan Store Pusat (Zustand) untuk reaktivitas instan
  const bookmarkedIds = useReaderStore((state) => state.bookmarks);

  const genres = ["Semua", ...Array.from(new Set(initialNovels.map((n) => n.genre)))];

  // Logika Filter & Sorting (Sesuai Versi Asli)
  let filteredNovels = initialNovels.filter((novel) => {
    const matchSearch = novel.title.toLowerCase().includes(search.toLowerCase()) || 
                       novel.genre.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "Favorit" ? bookmarkedIds.includes(novel.id) : true;
    const matchGenre = activeGenre === "Semua" ? true : novel.genre === activeGenre;
    return matchSearch && matchTab && matchGenre;
  });

  if (activeTab === "Trending") {
    filteredNovels = [...filteredNovels].sort((a, b) => (b.views || 0) - (a.views || 0));
  }

  return (
    <section>
      <div className="max-w-md mx-auto mb-8 relative">
        <input 
          type="text" 
          placeholder="Cari judul novel atau genre..." 
          className="w-full p-4 pl-12 rounded-full border border-gray-200 bg-white focus:ring-2 focus:ring-blue-600 outline-none shadow-sm text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute left-4 top-4 text-gray-400" size={20} />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex bg-gray-100 p-1 rounded-full w-full md:w-auto text-sm font-bold">
          <button onClick={() => setActiveTab("Semua")} className={`flex-1 md:px-6 py-2.5 rounded-full transition ${activeTab === "Semua" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
            Terbaru
          </button>
          <button onClick={() => setActiveTab("Trending")} className={`flex-1 md:px-6 py-2.5 rounded-full transition flex items-center justify-center gap-1.5 ${activeTab === "Trending" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
            <TrendingUp size={16} /> Trending
          </button>
          <button onClick={() => setActiveTab("Favorit")} className={`flex-1 md:px-6 py-2.5 rounded-full transition flex items-center justify-center gap-1.5 ${activeTab === "Favorit" ? "bg-white text-yellow-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
            <Bookmark size={16} fill={activeTab === "Favorit" ? "currentColor" : "none"} /> Favorit
          </button>
        </div>

        {activeTab === "Semua" && (
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 scrollbar-hide">
            {genres.map(genre => (
              <button key={genre} onClick={() => setActiveGenre(genre)} className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border ${activeGenre === genre ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredNovels.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-3xl opacity-60">
          <Book className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-lg font-medium text-gray-500">Tidak ada novel di kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredNovels.map((novel, index) => {
            const totalRatings = novel.ratings?.length || 0;
            const sumRatings = novel.ratings?.reduce((sum: number, r: any) => sum + r.value, 0) || 0;
            const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : "Baru";

            return (
              <Link key={novel.id} href={`/novel/${novel.slug}`} className="group block h-full">
                 <article className="h-full bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 relative flex flex-col">
                    
                    {activeTab === "Trending" && index < 3 && (
                      <div className="absolute top-0 left-0 z-10 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-black text-xs px-3 py-1.5 rounded-br-xl shadow-md flex items-center gap-1">
                        TOP {index + 1}
                      </div>
                    )}

                    <div className="aspect-[2/3] bg-gray-200 relative overflow-hidden">
                      {novel.coverImage ? (
                        <Image 
                          src={novel.coverImage} 
                          alt={novel.title} 
                          fill 
                          priority={index < 4}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : <div className="flex items-center justify-center h-full text-gray-400"><Book className="w-12 h-12" /></div>}
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md font-bold backdrop-blur-sm z-10">{novel.status}</div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-sm font-bold text-yellow-500">
                          <Star size={14} fill="currentColor" /> <span>{averageRating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                          <Eye size={14} /> {novel.views || 0}
                        </div>
                      </div>
                      <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{novel.title}</h3>
                      <div className="mt-auto text-xs font-semibold text-blue-600 uppercase tracking-wider">{novel.genre}</div>
                    </div>
                 </article>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}