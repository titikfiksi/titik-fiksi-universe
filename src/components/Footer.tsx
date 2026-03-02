import Link from "next/link";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { Instagram, Twitter, Facebook, Mail, Link as LinkIcon, Youtube, MessageCircle } from "lucide-react";

// Komponen Ikon TikTok Kustom
const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v7a8 8 0 1 1-8-8v3a5 5 0 1 0 5 5z"></path>
  </svg>
);

// Fungsi Cerdas Pencari Ikon Otomatis
function getIcon(platform: string, size = 20) {
  const p = platform.toLowerCase();
  if (p.includes("instagram")) return <Instagram size={size} />;
  if (p.includes("tiktok")) return <TikTokIcon size={size} />;
  if (p.includes("twitter") || p.includes("x")) return <Twitter size={size} />;
  if (p.includes("facebook") || p.includes("fb")) return <Facebook size={size} />;
  if (p.includes("youtube") || p.includes("yt")) return <Youtube size={size} />;
  if (p.includes("whatsapp") || p.includes("wa")) return <MessageCircle size={size} />;
  return <LinkIcon size={size} />;
}

// ======================================================================
// OPTIMASI FINAL: Caching Footer agar tidak berebut koneksi dengan Header
// ======================================================================
const getCachedFooterData = unstable_cache(
  async () => {
    try {
      const [settings, socialLinks] = await Promise.all([
        db.settings.findFirst(),
        db.socialLink.findMany()
      ]);
      return { settings, socialLinks };
    } catch (error) {
      console.error("Gagal memuat data Footer:", error);
      return { settings: null, socialLinks: [] }; // Fallback aman
    }
  },
  ['footer-data-cache'],
  { revalidate: 60 } // Disimpan di memori selama 60 detik
);

export default async function Footer() {
  // Menggunakan data dari memori (Cache), bukan tembak langsung ke Database
  const { settings, socialLinks } = await getCachedFooterData();

  // Membaca status sakelar pendaftaran dari database
  const isWriterOpen = settings?.isOpenForWriters ?? true;

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md group-hover:bg-blue-600 transition">TF</div>
            <div>
              <span className="font-extrabold text-xl text-gray-900 block">{settings?.siteName || "Titik Fiksi"}</span>
              <span className="text-xs text-gray-500 font-medium tracking-widest uppercase">Universe</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition">Beranda</Link>
            <Link href="/toko" className="hover:text-blue-600 transition">Toko & Dukungan</Link>
            
            {/* LINK SPONSORSHIP (UNGU) */}
            <Link href="/partnership" className="text-purple-600 hover:text-purple-800 transition">Sponsorship</Link>
            
            <Link href="/tentang" className="hover:text-blue-600 transition">Tentang Kami</Link>
            <Link href="/kontak" className="hover:text-blue-600 transition">Kontak</Link>
            
            {/* TAUTAN GABUNG PENULIS (HIJAU) */}
            {isWriterOpen && (
              <Link href="/kirim-karya" className="text-emerald-600 hover:text-emerald-800 transition">Gabung Penulis</Link>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100">
          
          <div className="text-sm text-gray-400 font-medium flex flex-wrap items-center justify-center md:justify-start">
             {/* PINTU RAHASIA ADMIN (PRESISI HANYA PADA LOGO ©) */}
             <Link 
               href="/admin-door" 
               className="cursor-default outline-none text-gray-400 hover:text-gray-600 transition-colors select-none flex items-center justify-center w-5 h-5 mr-1 rounded-full" 
               title=" "
             >
               &copy;
             </Link>
             <span>
               {settings?.copyrightText ? (
                 settings.copyrightText.replace('©', '').trim()
               ) : (
                 `${new Date().getFullYear()} ${settings?.siteName || "Titik Fiksi"}. All rights reserved.`
               )}
             </span>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            {settings?.email && (
              <Link href={`mailto:${settings.email}`} className="hover:text-gray-900 transition transform hover:scale-110" title="Email"><Mail size={20} /></Link>
            )}
            {socialLinks.map(link => (
              <Link key={link.id} href={link.url} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition transform hover:scale-110" title={link.platform}>
                {getIcon(link.platform, 20)}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}