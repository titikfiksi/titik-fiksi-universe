import { db } from "@/lib/db";
import Link from "next/link";
import { Megaphone, Target, Eye, TrendingUp, ArrowRight, CheckCircle2, Store, Users, Zap } from "lucide-react";

export const revalidate = 3600;

export default async function PartnershipPage() {
  const settings = await db.settings.findFirst();
  
  // 1. MENGAMBIL DAN MEMFORMAT NOMOR WHATSAPP (08 -> 628)
  const waNumber = settings?.whatsappNumber || "6281234567890";
  let cleanWaNumber = waNumber.replace(/[^0-9]/g, ''); 
  if (cleanWaNumber.startsWith('0')) {
    cleanWaNumber = '62' + cleanWaNumber.substring(1);
  }

  // 2. TEMPLATE FORMULIR WA YANG JUJUR & FOKUS PADA ETALASE TOKO
  const waMessage = `Halo Tim Admin Titik Fiksi Universe! 👋

Kami tertarik untuk menjadi sponsor dan menempatkan brand/produk kami di platform Anda. Berikut rincian awal pengajuan kami:

🏢 *Nama Brand / Perusahaan* : [Isi di sini]
💼 *Kategori Produk / Jasa* : [Misal: Buku, Merchandise, Event, Aplikasi, dll]
📌 *Penempatan Promosi* : Etalase Eksklusif di Halaman Toko & Dukungan
🔗 *Link Referensi Brand/Produk* : [Masukkan link IG/Website/Toko]
📅 *Rencana Periode Tayang* : [Misal: 1 Minggu / 1 Bulan]

Mohon panduannya mengenai Syarat & Ketentuan serta *Rate Card* (Daftar Harga) yang berlaku.

Terima kasih dan salam sukses!`;

  const waLink = cleanWaNumber ? `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(waMessage)}` : "#";

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 animate-fade-in-up">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* HERO SECTION */}
        <div className="bg-gradient-to-br from-indigo-900 via-gray-900 to-black rounded-[3rem] p-8 md:p-16 text-white text-center shadow-2xl relative overflow-hidden mb-12 border border-gray-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <Megaphone size={14} /> Peluang Kerjasama
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight drop-shadow-lg">
              Jangkau Ribuan Audiens <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Generasi Kreatif</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-10">
              Titik Fiksi Universe adalah rumah bagi ribuan imajinasi dan pembaca setia. Promosikan produk, merchandise, atau brand Anda secara eksklusif di ekosistem kami.
            </p>
            
            {/* TOMBOL WHATSAPP */}
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full font-black hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Hubungi Tim Kami <ArrowRight size={20} />
            </a>
          </div>
        </div>

        {/* MENGAPA BERIKLAN DI SINI? */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-10">Kenapa Harus Memilih Kami?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Target size={28} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">Audiens Tertarget</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Pengunjung kami adalah pecinta literasi, pop-culture, dan anak muda. Sangat cocok untuk produk buku, merchandise, hingga lifestyle.</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Eye size={28} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">Visibilitas Premium</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Produk Anda akan dipajang dengan rapi di etalase eksklusif kami yang dapat diakses langsung dari menu utama oleh seluruh pengunjung.</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">Trafik Loyal</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Pembaca menghabiskan waktu berjam-jam di website kami, memberikan brand awareness yang jauh lebih efektif daripada sekadar iklan lewat.</p>
            </div>
          </div>
        </div>

        {/* ALUR KERJA */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-200 shadow-sm">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Cara Menjadi Sponsor</h2>
            <p className="text-gray-500 font-medium">Proses cepat, mudah, dan transparan.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Garis Penghubung (Hanya Desktop) */}
            <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-[2px] bg-gray-100 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center font-black text-xl mb-6 select-none pointer-events-none ring-4 ring-white">1</div>
              <h4 className="font-black text-gray-900 mb-2">Hubungi Kami</h4>
              <p className="text-sm text-gray-500 px-2 leading-relaxed">Klik tombol WhatsApp di atas dan isi formulir pengajuan penempatan sponsor.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center font-black text-xl mb-6 select-none pointer-events-none ring-4 ring-white">2</div>
              <h4 className="font-black text-gray-900 mb-2">Kirim Materi</h4>
              <p className="text-sm text-gray-500 px-2 leading-relaxed">Siapkan foto produk/banner terbaik, deskripsi singkat, dan Link tujuan promosi.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl mb-6 select-none pointer-events-none ring-4 ring-white shadow-sm border border-blue-100">3</div>
              <h4 className="font-black text-gray-900 mb-2">Promosi Tayang!</h4>
              <p className="text-sm text-gray-500 px-2 leading-relaxed">Sponsor Anda akan langsung mengudara di etalase toko kami sesuai periode.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}