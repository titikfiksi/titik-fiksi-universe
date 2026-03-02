import { db } from "@/lib/db";
import Link from "next/link";
import { Book, Edit, Plus, Star, Eye, Crown, Search } from "lucide-react";
import { toggleFeaturedNovel } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminNovelsListPage() {
  // OPTIMASI TAHAP 3: Hindari mengambil seluruh data novel (seperti sinopsis dll)
  // Hanya ambil field (kolom) yang benar-benar akan dirender ke dalam HTML
  const novels = await db.novel.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      coverImage: true,
      views: true,
      author: true,
      isFeatured: true,
      _count: { select: { chapters: true } }
    }
  });

  // FUNGSI PEMBUNGKUS (Solusi untuk mengatasi Error TypeScript Vercel)
  const handleToggleFeatured = async (id: string, formData: FormData) => {
    "use server";
    await toggleFeaturedNovel(id, 7);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Book className="text-blue-600" /> Semua Koleksi Novel
          </h1>
          <p className="text-gray-500 font-medium mt-1">Kelola publikasi dan promosikan karya terbaik Anda.</p>
        </div>
        <Link href="/admin/novel/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg">
          <Plus size={20} /> Tulis Novel Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {novels.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <Book size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold">Belum ada novel yang dibuat.</p>
          </div>
        ) : (
          novels.map((novel) => (
            <div key={novel.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-6">
              {/* Cover Kecil */}
              <div className="w-20 h-28 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 relative">
                {novel.coverImage && (
                  <img src={novel.coverImage} alt="cover" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Info Novel */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-black text-gray-900 text-lg leading-tight mb-1">{novel.title}</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Eye size={14}/> {novel.views} Views</span>
                  <span className="flex items-center gap-1 text-blue-500">{novel._count.chapters} Bab</span>
                  <span className="text-gray-300">|</span>
                  <span>Penulis: {novel.author}</span>
                </div>
              </div>

              {/* Tombol Aksi & Sorotan */}
              <div className="flex items-center gap-3">
                {/* PERBAIKAN: Menggunakan fungsi pembungkus handleToggleFeatured */}
                <form action={handleToggleFeatured.bind(null, novel.id)}>
                  <button 
                    type="submit"
                    title={novel.isFeatured ? "Hapus dari Sorotan" : "Jadikan Sorotan Utama"}
                    className={`p-3 rounded-2xl transition-all border ${
                      novel.isFeatured 
                      ? "bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-200" 
                      : "bg-gray-50 text-gray-400 border-gray-100 hover:text-amber-500 hover:bg-amber-50"
                    }`}
                  >
                    <Crown size={22} className={novel.isFeatured ? "fill-white" : ""} />
                  </button>
                </form>

                <Link 
                  href={`/admin/novels/${novel.id}`} 
                  className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Edit size={22} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}