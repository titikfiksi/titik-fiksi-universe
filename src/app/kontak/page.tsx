import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle, Wrench, PhoneCall, Instagram, Twitter, Facebook, Youtube, Link as LinkIcon } from "lucide-react";

export const revalidate = 3600;

// Fungsi Kustom Ikon Sosmed
const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v7a8 8 0 1 1-8-8v3a5 5 0 1 0 5 5z"></path></svg>
);
function getIcon(platform: string, size = 24) {
  const p = platform.toLowerCase();
  if (p.includes("instagram")) return <Instagram size={size} />;
  if (p.includes("tiktok")) return <TikTokIcon size={size} />;
  if (p.includes("twitter") || p.includes("x")) return <Twitter size={size} />;
  if (p.includes("facebook") || p.includes("fb")) return <Facebook size={size} />;
  if (p.includes("youtube") || p.includes("yt")) return <Youtube size={size} />;
  return <LinkIcon size={size} />;
}

export default async function ContactPage() {
  const [settings, socialLinks] = await Promise.all([
    db.settings.findFirst(),
    db.socialLink.findMany() // MENARIK DATA SOSMED
  ]);

  if (settings && !settings.isActive) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-6 text-center z-[100]">
        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-2xl border border-gray-700"><Wrench size={40} className="text-blue-500 animate-bounce" /></div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Website Sedang <span className="text-blue-500">Perbaikan</span></h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed mb-10">Kami sedang melakukan peningkatan sistem.</p>
      </div>
    );
  }

  const email = settings?.email || "admin@titikfiksi.com";
  const waNumber = settings?.whatsappNumber || "6281234567890";
  const cleanWaNumber = waNumber.replace(/[^0-9]/g, ''); 

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 animate-fade-in-up">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-8 transition-colors"><ArrowLeft size={20} /> Kembali ke Beranda</Link>

        {/* DESAIN ASLI ANDA YANG RAPI */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><PhoneCall size={32} /></div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Hubungi Kami</h1>
          <p className="text-gray-600 text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            Punya pertanyaan, kritik, saran, atau ingin bekerjasama? Jangan ragu untuk menghubungi tim {settings?.siteName || "Titik Fiksi Universe"}.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a href={`https://wa.me/${cleanWaNumber}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100 hover:shadow-md transition-all group">
              <MessageCircle size={28} className="text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-black text-emerald-900 text-lg mb-1">WhatsApp</h3>
              <p className="text-emerald-700 font-medium text-sm">{waNumber}</p>
            </a>

            <a href={`mailto:${email}`} className="flex flex-col items-center justify-center p-8 bg-blue-50/50 rounded-3xl border border-blue-100 hover:shadow-md transition-all group">
              <Mail size={28} className="text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-black text-blue-900 text-lg mb-1">Email</h3>
              <p className="text-blue-700 font-medium text-sm">{email}</p>
            </a>
          </div>

          {/* MENU SOSIAL MEDIA YANG DIKEMBALIKAN */}
          {socialLinks.length > 0 && (
            <div className="mt-12 pt-10 border-t border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Sosial Media Resmi Kami</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {socialLinks.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-6 py-3 rounded-2xl hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all group">
                    {getIcon(link.platform, 20)}
                    <span className="font-bold text-sm capitalize">{link.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}