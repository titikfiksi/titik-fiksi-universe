import { db } from "@/lib/db";
import { Megaphone, Target, Eye, TrendingUp, ArrowRight } from "lucide-react";
import { cache } from "react";

// ISR: Revalidate page every hour
export const revalidate = 3600;

// Ideally this comes from your prisma or db schema
type Settings = {
  whatsappNumber?: string | null;
} | null;

// Memoize DB call with React cache to improve SSR performance
const getSettings = cache(async (): Promise<Settings> => {
  // Only select the needed field for optimal performance
  return await db.settings.findFirst({ select: { whatsappNumber: true } });
});

// Utility: Normalize WhatsApp Number (08xxxx -> 628xxxx)
function normalizeWhatsAppNumber(number: string): string {
  const digits = number.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

// Message Template (static, could be i18n)
const WA_MESSAGE = `Halo Tim Admin Titik Fiksi Universe! 👋

Kami tertarik untuk menjadi sponsor dan menempatkan brand/produk kami di platform Anda. Berikut rincian awal pengajuan kami:

🏢 *Nama Brand / Perusahaan* : [Isi di sini]
💼 *Kategori Produk / Jasa* : [Misal: Buku, Merchandise, Event, Aplikasi, dll]
📌 *Penempatan Promosi* : Etalase Eksklusif di Halaman Toko & Dukungan
🔗 *Link Referensi Brand/Produk* : [Masukkan link IG/Website/Toko]
📅 *Rencana Periode Tayang* : [Misal: 1 Minggu / 1 Bulan]

Mohon panduannya mengenai Syarat & Ketentuan serta *Rate Card* (Daftar Harga) yang berlaku.

Terima kasih dan salam sukses!`;

const REASONS = [
  {
    icon: <Target size={28} />,
    color: "bg-blue-50 text-blue-600",
    title: "Audiens Tertarget",
    desc:
      "Pengunjung kami adalah pecinta literasi, pop-culture, dan anak muda. Sangat cocok untuk produk buku, merchandise, hingga lifestyle.",
  },
  {
    icon: <Eye size={28} />,
    color: "bg-emerald-50 text-emerald-600",
    title: "Visibilitas Premium",
    desc:
      "Produk Anda akan dipajang dengan rapi di etalase eksklusif kami yang dapat diakses langsung dari menu utama oleh seluruh pengunjung.",
  },
  {
    icon: <TrendingUp size={28} />,
    color: "bg-purple-50 text-purple-600",
    title: "Trafik Loyal",
    desc:
      "Pembaca menghabiskan waktu berjam-jam di website kami, memberikan brand awareness yang jauh lebih efektif daripada sekadar iklan lewat.",
  },
];

const SPONSOR_STEPS = [
  {
    number: 1,
    color: "bg-gray-100 text-gray-400",
    title: "Hubungi Kami",
    desc: "Klik tombol WhatsApp di atas dan isi formulir pengajuan penempatan sponsor.",
  },
  {
    number: 2,
    color: "bg-gray-100 text-gray-400",
    title: "Kirim Materi",
    desc: "Siapkan foto produk/banner terbaik, deskripsi singkat, dan Link tujuan promosi.",
  },
  {
    number: 3,
    color: "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm",
    title: "Promosi Tayang!",
    desc: "Sponsor Anda akan langsung mengudara di etalase toko kami sesuai periode.",
  },
];

function getWhatsAppLink(waNumber: string | null | undefined): string {
  if (!waNumber) return "#";
  const normalized = normalizeWhatsAppNumber(waNumber);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(WA_MESSAGE)}`;
}

export default async function PartnershipPage() {
  // Fetch settings efficiently using a memoized function
  const settings = await getSettings();
  // Accept nulls in DB but default to a sane number
  const waNumber = settings?.whatsappNumber ?? "6281234567890";
  const waLink = getWhatsAppLink(waNumber);

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 animate-fade-in-up">
      <div className="max-w-5xl mx-auto px-4">
        {/* HERO SECTION */}
        <section className="bg-gradient-to-br from-indigo-900 via-gray-900 to-black rounded-[3rem] p-8 md:p-16 text-white text-center shadow-2xl relative overflow-hidden mb-12 border border-gray-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <Megaphone size={14} /> Peluang Kerjasama
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight drop-shadow-lg">
              Jangkau Ribuan Audiens <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Generasi Kreatif
              </span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-10">
              Titik Fiksi Universe adalah rumah bagi ribuan imajinasi dan pembaca setia. Promosikan produk, merchandise, atau brand Anda secara eksklusif di ekosistem kami.
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full font-black hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Hubungi Tim Kami <ArrowRight size={20} />
            </a>
          </div>
        </section>

        {/* WHY US */}
        <section className="mb-16">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-10">
            Kenapa Harus Memilih Kami?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REASONS.map(({ icon, color, title, desc }) => (
              <div
                key={title}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6`}>
                  {icon}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-200 shadow-sm">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Cara Menjadi Sponsor</h2>
            <p className="text-gray-500 font-medium">Proses cepat, mudah, dan transparan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (Desktop only) */}
            <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-[2px] bg-gray-100 z-0" />
            {SPONSOR_STEPS.map(({ number, color, title, desc }) => (
              <div key={number} className="relative z-10 flex flex-col items-center text-center">
                <div
                  className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center font-black text-xl mb-6 select-none pointer-events-none ring-4 ring-white`}
                >
                  {number}
                </div>
                <h4 className="font-black text-gray-900 mb-2">{title}</h4>
                <p className="text-sm text-gray-500 px-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}