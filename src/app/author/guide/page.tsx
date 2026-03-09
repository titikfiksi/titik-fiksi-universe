import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Edit3,
  Lock,
  CalendarClock,
  MessageSquare,
  HelpCircle,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

type GuideSection = {
  icon: React.ReactNode;
  colorClass: string;
  title: string;
  content: React.ReactNode;
};

const guideSections: GuideSection[] = [
  {
    icon: <BookOpen size={20} />,
    colorClass: "blue",
    title: "1. Membuat Karya & Menambahkan Poster",
    content: (
      <ul className="space-y-4 text-gray-600 font-medium ml-2 border-l-2 border-blue-100 pl-4">
        <li>
          <strong className="text-gray-900 block mb-1">Buat Novel Baru:</strong>
          Klik tombol &quot;Buat Novel Baru&quot; di beranda. Siapkan Judul, Sinopsis, dan Genre cerita Anda.
        </li>
        <li className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <strong className="text-blue-900 flex items-center gap-2 mb-2">
            <ImageIcon size={16} /> Cara Memasang Poster / Sampul Novel:
          </strong>
          <p className="text-sm text-gray-700 mb-2">
            Untuk menjaga agar web tetap cepat, sistem kita menggunakan tautan (URL) gambar. Ikuti langkah ini:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1.5 ml-4 text-gray-700">
            <li>
              Unggah poster Anda ke <b>Pinterest</b>, <b>ImgBB</b>, atau <b>Google Drive</b>.
              Pastikan poster berukuran potret (rasio 2:3).
            </li>
            <li>
              Jika menggunakan <b>Pinterest/ImgBB:</b> Buka gambarnya, klik kanan (atau tahan gambar jika di HP),
              lalu pilih <b>&quot;Copy Image Address&quot;</b> (Salin Alamat Gambar).
            </li>
            <li>
              Jika menggunakan <b>Google Drive:</b> Pastikan akses link diatur ke &quot;Siapa saja yang memiliki link (Publik)&quot;.
            </li>
            <li>
              Tempelkan (<i>Paste</i>) link yang sudah disalin tersebut ke dalam kolom <b>&quot;URL Gambar Sampul&quot;</b>.
            </li>
          </ul>
        </li>
        <li>
          <strong className="text-gray-900 block mb-1">Link Eksternal &amp; Sosmed:</strong>
          Setelah novel dibuat, buka Manajemen Karya. Anda bisa menambahkan link media sosial Anda (IG/TikTok)
          dan link ke platform lain (Wattpad/KBM) agar pembaca bisa mengikuti Anda di ekosistem lain.
        </li>
      </ul>
    ),
  },
  {
    icon: <Edit3 size={20} />,
    colorClass: "emerald",
    title: "2. Menulis Bab & Editor Otomatis",
    content: (
      <ul className="space-y-3 text-gray-600 font-medium ml-2 border-l-2 border-emerald-100 pl-4">
        <li>
          <strong className="text-gray-900 block mb-1">Rich Text Editor:</strong>
          Anda bisa langsung menebalkan teks (Bold) atau memiringkan teks (Italic) seperti di Microsoft Word.
          Copy-Paste naskah Anda dari MS Word / Google Docs sangat disarankan karena spasi dan paragrafnya akan otomatis menyesuaikan!
        </li>
        <li>
          <strong className="text-emerald-700 flex items-center gap-1.5 mb-1">
            Penyimpanan Otomatis (Auto-Save)
            <CheckCircle2 size={16} className="text-emerald-500" /> :
          </strong>
          Jangan takut mati lampu atau tab tertutup! Setiap ketikan Anda akan otomatis tersimpan di dalam <i>browser</i>.
          Buka kembali halamannya, dan draf terakhir Anda akan otomatis dipulihkan.
        </li>
      </ul>
    ),
  },
  {
    icon: <Lock size={20} />,
    colorClass: "amber",
    title: "3. Bab Eksklusif (Monetisasi)",
    content: (
      <ul className="space-y-3 text-gray-600 font-medium ml-2 border-l-2 border-amber-100 pl-4">
        <li>
          Ingin mendapatkan penghasilan dari karya Anda? Anda bisa &quot;Mengunci&quot; bab tertentu (seperti <i>extra chapter</i> atau adegan penting).
        </li>
        <li>
          Centang opsi <strong>&quot;Ya, Kunci Bab Ini&quot;</strong> saat membuat atau mengedit bab.
        </li>
        <li>
          Masukkan link donasi spesifik (misal: link karya Trakteer/KaryaKarsa Anda).
        </li>
        <li>
          Buat <strong>Kode Buka Kunci</strong> rahasia. Berikan kode ini di pesan otomatis Trakteer/KaryaKarsa Anda,
          agar pendukung yang sudah berdonasi bisa membuka gembok bab tersebut.
        </li>
      </ul>
    ),
  },
  {
    icon: <CalendarClock size={20} />,
    colorClass: "purple",
    title: "4. Fitur Jadwal Tayang",
    content: (
      <ul className="space-y-3 text-gray-600 font-medium ml-2 border-l-2 border-purple-100 pl-4">
        <li>Punya banyak stok tulisan dan ingin liburan? Gunakan fitur Jadwal Tayang!</li>
        <li>
          Di menu penulisan bab, atur <strong>Tanggal &amp; Jam</strong> ke masa depan (misalnya: besok jam 19:00).
        </li>
        <li>
          Pastikan centang &quot;Aktifkan Publikasi&quot; dibiarkan menyala. Sistem akan menyimpan bab tersebut secara otomatis
          dan baru akan menampilkannya kepada publik tepat di jam yang telah Anda tentukan.
        </li>
      </ul>
    ),
  },
  {
    icon: <MessageSquare size={20} />,
    colorClass: "pink",
    title: "5. Membalas Komentar Pembaca",
    content: (
      <ul className="space-y-3 text-gray-600 font-medium ml-2 border-l-2 border-pink-100 pl-4">
        <li>
          Lihat menu <strong>Komentar Terbaru</strong> di dalam layar Manajemen Karya masing-masing novel.
        </li>
        <li>
          Klik tombol biru kecil <strong>&quot;Balas Pembaca Ini&quot;</strong> di bawah komentar yang ingin Anda balas.
        </li>
        <li>
          Balasan Anda akan otomatis diunggah dan ditandai dengan ikon mahkota (👑) sebagai tanda resmi dari Penulis asli.
        </li>
        <li>
          Anda juga memiliki wewenang penuh untuk menghapus komentar <i>spam</i> atau komentar kasar di lapak Anda dengan mengklik tombol ikon tempat sampah merah.
        </li>
      </ul>
    ),
  },
];

const Section = ({ icon, colorClass, title, content }: GuideSection) => (
  <section className="space-y-4">
    <div className={`flex items-center gap-3 pb-2 border-b border-gray-100`}>
      <div
        className={`w-10 h-10 bg-${colorClass}-100 text-${colorClass}-600 rounded-xl flex items-center justify-center`}
        // For clsx safety, fallback to the default blue if colorClass pattern breaks.
        style={{
          backgroundColor: `var(--tw-bg-opacity,1) var(--${colorClass}-100, ${colorClass === "blue" ? "#DBEAFE" : ""})`,
          color: `var(--${colorClass}-600, ${colorClass === "blue" ? "#2563EB" : ""})`,
        }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-black text-gray-900">{title}</h3>
    </div>
    {content}
  </section>
);

export default function AuthorGuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <HelpCircle className="text-indigo-600" size={32} />
            Panduan <span className="text-indigo-600">Penulis</span>
          </h1>
          <p className="text-gray-500 font-bold mt-1">
            Pelajari cara memaksimalkan fitur ruang kerjamu.
          </p>
        </div>
        <Link
          href="/author"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 font-bold transition shadow-sm"
        >
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
      </header>

      <main className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-200 shadow-sm space-y-12">
        {/* PENGANTAR */}
        <section className="bg-indigo-50 border border-indigo-100 p-6 md:p-8 rounded-2xl">
          <h2 className="text-xl font-black text-indigo-900 mb-3">
            Selamat Datang di Titik Fiksi Universe! 🚀
          </h2>
          <p className="text-indigo-800 font-medium leading-relaxed">
            Panel ini dirancang khusus untuk memanjakan Anda dalam berkarya. Mulai dari penyimpanan otomatis, jadwal tayang, hingga monetisasi karya—semuanya ada di genggaman Anda. Silakan baca panduan di bawah ini untuk memulai.
          </p>
        </section>
        {guideSections.map((section, idx) => (
          <Section key={idx} {...section} />
        ))}
      </main>
    </div>
  );
}