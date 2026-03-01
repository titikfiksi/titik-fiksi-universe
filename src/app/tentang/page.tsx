import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, BookOpen, Heart, ShieldCheck, Wrench, Users } from "lucide-react";

export const revalidate = 3600;

export default async function AboutPage() {
  const settings = await db.settings.findFirst();

  // GEMBOK MAINTENANCE MODE
  if (settings && !settings.isActive) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-6 text-center z-[100]">
        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-2xl border border-gray-700"><Wrench size={40} className="text-blue-500 animate-bounce" /></div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Website Sedang <span className="text-blue-500">Perbaikan</span></h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed mb-10">Kami sedang melakukan peningkatan sistem. Silakan kembali beberapa saat lagi.</p>
      </div>
    );
  }

  // Fallback jika admin belum mengisi teks
  const visi = settings?.visiPenulis || "Menjadi wadah utama bagi para pencerita untuk berkarya tanpa batas, membangun audiens mereka sendiri, dan mendapatkan apresiasi yang layak atas imajinasi yang mereka tuangkan.";
  const kekuatan = settings?.kekuatanPembaca || "Kami percaya bahwa pembaca adalah nyawa dari setiap cerita. Melalui dukungan, komentar, dan interaksi yang hangat, komunitas pembaca kitalah yang menghidupkan setiap karakter di dalam novel.";

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 animate-fade-in-up">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-8 transition-colors"><ArrowLeft size={20} /> Kembali ke Beranda</Link>

        {/* HEADER ABOUT */}
        <div className="bg-gray-900 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden mb-12 border border-gray-800 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl mb-2"><BookOpen size={32} /></div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Tentang <span className="text-blue-500">{settings?.siteName || "Titik Fiksi"}</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">Platform literasi digital modern yang menghubungkan imajinasi penulis dengan antusiasme pembaca.</p>
          </div>
        </div>

        {/* KONTEN DINAMIS DARI ADMIN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6"><ShieldCheck size={24} /></div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Visi Penulis</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{visi}</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-6"><Heart size={24} /></div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Kekuatan Pembaca</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{kekuatan}</p>
          </div>
        </div>

      </div>
    </div>
  );
}