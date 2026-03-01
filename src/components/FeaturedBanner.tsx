import { db } from "@/lib/db";
import Link from "next/link";
import { Star, BookOpen, Crown, ChevronRight } from "lucide-react";

export default async function FeaturedBanner() {
  // 1. Ambil Novel yang SEDANG PROMOSI (isFeatured: true & Belum Expired) [cite: 11]
  let featuredNovels = await db.novel.findMany({
    where: {
      isFeatured: true,
      OR: [
        { featuredUntil: null },
        { featuredUntil: { gt: new Date() } } // Belum expired [cite: 11]
      ]
    },
    include: { ratings: true, _count: { select: { chapters: true } } },
    take: 5
  });

  // 2. Jika Kurang dari 3, Tambah dengan Novel RATING TERTINGGI (Backup) [cite: 14, 20]
  if (featuredNovels.length < 3) {
    const backupNovels = await db.novel.findMany({
      where: {
        id: { notIn: featuredNovels.map(n => n.id) }
      },
      include: { ratings: true, _count: { select: { chapters: true } } },
      orderBy: { ratings: { _count: 'desc' } }, // Berdasarkan popularitas rating [cite: 20]
      take: 5 - featuredNovels.length
    });
    featuredNovels = [...featuredNovels, ...backupNovels];
  }

  if (featuredNovels.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-gray-950 rounded-[2.5rem] mb-12 shadow-2xl border border-white/5">
      {/* Kita ambil satu yang utama untuk tampilan besar (Hero) */}
      {featuredNovels.slice(0, 1).map((novel) => (
        <div key={novel.id} className="relative min-h-[500px] flex items-center p-8 md:p-16">
          {/* Background Image Blur */}
          <div 
            className="absolute inset-0 opacity-30 blur-3xl scale-110"
            style={{ backgroundImage: `url(${novel.coverImage})`, backgroundSize: 'cover' }}
          ></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full">
            {/* Cover Novel */}
            <div className="w-48 md:w-64 aspect-[2/3] flex-shrink-0 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 transform -rotate-2 group-hover:rotate-0 transition-transform duration-500">
              <img src={novel.coverImage || ""} alt={novel.title} className="w-full h-full object-cover" />
            </div>

            {/* Konten Teks */}
            <div className="flex-1 text-center md:text-left">
              {novel.isFeatured && (
                <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-amber-500/30">
                  <Crown size={14} /> Rekomendasi Utama
                </div>
              )}
              
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight drop-shadow-lg line-clamp-2">
                {novel.title}
              </h1>
              
              <p className="text-gray-300 font-medium text-sm md:text-base mb-8 line-clamp-3 max-w-2xl leading-relaxed">
                {novel.synopsis} [cite: 11]
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-8 text-white/80 font-bold text-sm">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md">
                  <Star className="text-amber-400 fill-amber-400" size={18} /> 
                  {novel.ratings.length > 0 
                    ? (novel.ratings.reduce((a, b) => a + b.value, 0) / novel.ratings.length).toFixed(1) 
                    : "0.0"}
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md">
                  <BookOpen className="text-blue-400" size={18} /> 
                  {novel._count.chapters} Bab [cite: 17]
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link 
                  href={`/novel/${novel.slug}`} 
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-2xl font-black text-lg hover:bg-blue-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2 group"
                >
                  Baca Sekarang <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-white/40 font-bold text-xs uppercase tracking-widest">Karya: {novel.author} [cite: 13]</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}