"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, ChevronLeft, ChevronRight, List } from "lucide-react";

type Chapter = {
  id: string;
  slug: string;
  title: string;
  orderIndex: number;
  isLocked: boolean;
};

export default function PagedChapterList({ chapters, novelSlug }: { chapters: Chapter[], novelSlug: string }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 20; // Menampilkan 20 bab per halaman
  const totalPages = Math.ceil(chapters.length / itemsPerPage);

  const startIndex = (page - 1) * itemsPerPage;
  const visibleChapters = chapters.slice(startIndex, startIndex + itemsPerPage);

  // Jika tidak ada bab
  if (chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
        <List size={40} className="text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">Belum ada bab yang dirilis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleChapters.map((chapter) => (
          <Link key={chapter.id} href={`/novel/${novelSlug}/${chapter.slug}`} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-md transition group min-h-[72px]">
            <div className="flex items-center gap-4 flex-1 pr-2">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition flex-shrink-0">
                {chapter.orderIndex}
              </div>
              <span className="font-bold text-gray-700 text-sm md:text-base group-hover:text-gray-900 line-clamp-2 leading-snug">
                {chapter.title}
              </span>
            </div>
            {chapter.isLocked && <Lock size={16} className="text-amber-500 flex-shrink-0" />}
          </Link>
        ))}
      </div>

      {/* Navigasi Pagination (Hanya muncul jika bab lebih dari 20) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4 mt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 disabled:bg-gray-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            Halaman {page} dari {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 disabled:bg-gray-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}