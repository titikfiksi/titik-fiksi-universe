"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { useReaderStore } from "@/lib/store";

export default function BookmarkButton({ novel }: { novel: { id: string, title: string } }) {
  const [mounted, setMounted] = useState(false);
  
  // Menggunakan Zustand untuk sinkronisasi antar halaman
  const bookmarks = useReaderStore((state) => state.bookmarks);
  const toggleBookmark = useReaderStore((state) => state.toggleBookmark);

  const isBookmarked = bookmarks.includes(novel.id);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Placeholder saat proses hidrasi untuk mencegah Layout Shift
  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold bg-gray-100 text-gray-400 border border-gray-200 animate-pulse w-full md:w-auto">
        <Bookmark size={20} />
        Memuat...
      </div>
    );
  }

  return (
    <button 
      onClick={() => toggleBookmark(novel.id)} 
      className={`flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold transition shadow-lg w-full md:w-auto ${
        isBookmarked 
          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200' 
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
      {isBookmarked ? "Tersimpan" : "Simpan Favorit"}
    </button>
  );
}