"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlayCircle, BookOpen } from "lucide-react";

export default function ContinueReadingButton({ novelSlug, chapters }: { novelSlug: string, chapters: any[] }) {
  const [lastReadSlug, setLastReadSlug] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Mengecek apakah pembaca punya riwayat bacaan di novel ini
    const saved = localStorage.getItem(`last_read_${novelSlug}`);
    if (saved) setLastReadSlug(saved);
  }, [novelSlug]);

  // Mencegah hydration error saat memuat halaman
  if (!mounted) {
    return <div className="h-12 w-full bg-gray-200 animate-pulse rounded-xl"></div>;
  }

  // Jika belum ada bab yang di-publish, sembunyikan tombol
  if (!chapters || chapters.length === 0) return null;

  const targetSlug = lastReadSlug || chapters[0].slug;
  const targetChapter = chapters.find((c: any) => c.slug === targetSlug) || chapters[0];
  const isContinuing = !!lastReadSlug;

  return (
    <Link 
      href={`/novel/${novelSlug}/${targetSlug}`}
      className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold transition-all shadow-sm ${
        isContinuing 
          ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md' 
          : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md'
      }`}
    >
      {isContinuing ? <PlayCircle size={18} /> : <BookOpen size={18} />}
      {isContinuing ? `Lanjut Baca (Bab ${targetChapter.orderIndex})` : "Mulai Baca Sekarang"}
    </Link>
  );
}