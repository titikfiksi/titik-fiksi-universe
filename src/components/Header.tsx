import Link from "next/link";
import { db } from "@/lib/db";
import { PenTool } from "lucide-react";
import { unstable_cache } from "next/cache";

// OPTIMASI TAHAP 3.1: Caching + Error Handling Kuat
// Hasil query disimpan di memori server, dan tidak akan crash jika DB gagal merespons
const getCachedSettings = unstable_cache(
  async () => {
    try {
      return await db.settings.findFirst({
        select: { siteName: true, isOpenForWriters: true } 
      });
    } catch (error) {
      console.error("Gagal memuat pengaturan Header:", error);
      return null; // Mengembalikan null agar website tetap berjalan
    }
  },
  ['header-settings'], 
  { revalidate: 60 }   
);

export default async function Header() {
  const settings = await getCachedSettings();
  const isWriterOpen = settings?.isOpenForWriters ?? true;
  
  return (
    <header className="fixed w-full max-w-[100vw] top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
      <div className="container mx-auto px-4 max-w-6xl h-20 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md">TF</div>
          <div>
            <h1 className="font-black text-gray-900 text-lg">{settings?.siteName || "Titik Fiksi"}</h1>
            <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Universe</p>
          </div>
        </Link>

        {/* MENU NAVIGASI LENGKAP */}
        <div className="hidden lg:flex items-center gap-8 font-bold text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600 transition">Beranda</Link>
          <Link href="/toko" className="hover:text-blue-600 transition">Toko & Dukungan</Link>
          
          <Link href="/partnership" className="text-purple-600 hover:text-purple-800 transition">
            Sponsorship
          </Link>

          <Link href="/tentang" className="hover:text-blue-600 transition">Tentang Kami</Link>
          <Link href="/kontak" className="hover:text-blue-600 transition">Kontak</Link>
        </div>

        <div className="flex items-center gap-4">
          {isWriterOpen && (
            <Link 
              href="/kirim-karya" 
              className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full hover:bg-emerald-700 transition shadow-md text-sm font-bold"
            >
              <PenTool size={16} /> Gabung Penulis
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}