import Link from "next/link";
import { db } from "@/lib/db";
import { ArrowLeft, PenTool, DollarSign, ShieldCheck, Layout, Mail, MessageCircle, CheckCircle2, AlertTriangle, Wrench, LogIn } from "lucide-react";

export const revalidate = 0;

export default async function KirimKaryaPage() {
  const settings = await db.settings.findFirst();
  
  // PERBAIKAN BUG: Harus memanggil settings.isActive (bukan isActive langsung)
  if (settings && !settings.isActive) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-6 text-center z-[100]">
        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-2xl border border-gray-700">
          <Wrench size={40} className="text-blue-500 animate-bounce" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Website Sedang <span className="text-blue-500">Perbaikan</span></h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed mb-10">
          Kami sedang melakukan peningkatan sistem. Silakan kembali beberapa saat lagi.
        </p>
      </div>
    );
  }

  const isOpen = settings?.isOpenForWriters ?? true;

  // MENGAMBIL SEMUA DATA DINAMIS DARI DATABASE
  const waNumber = settings?.whatsappNumber || "6281234567890";
  const cleanWaNumber = waNumber.replace(/[^0-9]/g, '');
  const email = settings?.email || "admin@titikfiksi.com";

  const heroTitle = settings?.writerHeroTitle || "Karyamu, Aturanmu, 100% Keuntunganmu.";
  const heroDesc = settings?.writerHeroDesc || "Titik Fiksi Universe membuka pintu bagi para pencerita hebat. Terbitkan novel Anda di sini, bangun audiens Anda, dan nikmati sistem yang berpihak penuh pada penulis.";

  const b1Title = settings?.writerBenefit1Title || "100% Monetisasi Penulis";
  const b1Desc = settings?.writerBenefit1Desc || "Tidak ada potongan admin. Pasang link donasi Anda sendiri. Gunakan fitur 'Bab Terkunci' untuk menjual kode akses langsung ke rekening Anda.";
  const b2Title = settings?.writerBenefit2Title || "Hak Cipta 100% Milikmu";
  const b2Desc = settings?.writerBenefit2Desc || "Kami hanya etalase, bukan pemilik. Anda bebas menarik naskah Anda kapan saja jika mendapat tawaran dari penerbit cetak atau rumah produksi film.";
  const b3Title = settings?.writerBenefit3Title || "Personal Branding Kuat";
  const b3Desc = settings?.writerBenefit3Desc || "Identitas Anda diutamakan. Kami menyediakan tombol khusus yang mengarah langsung ke media sosial Anda di setiap halaman novel.";
  const b4Title = settings?.writerBenefit4Title || "UI Premium & Bebas Iklan";
  const b4Desc = settings?.writerBenefit4Desc || "Pembaca Anda tidak akan diganggu oleh iklan pop-up yang merusak mata. Karya Anda disajikan dalam antarmuka yang elegan dan cepat.";

  // PERUBAHAN: Teks Default Disetel Khusus untuk Pendaftaran Akun
  const defaultTerms = [
    "Identitas Pendaftar: Lampirkan Nama Lengkap (Sesuai ID) dan Nama Pena yang akan Anda gunakan.",
    "Kontak & Akses: Sertakan Alamat Email yang aktif. Email ini akan didaftarkan sebagai akses masuk ke Ruang Penulis.",
    "Jejak Digital: Kirimkan tautan akun Sosial Media utama Anda (Instagram/TikTok) untuk keperluan verifikasi penulis.",
    "Portofolio Naskah: Sertakan Judul, Sinopsis, Genre, dan minimal 3 Bab awal dari cerita yang ingin Anda terbitkan untuk proses kurasi.",
    "Komitmen: Bersedia mematuhi aturan platform, tidak mempublikasikan naskah plagiat, dan tidak mengandung unsur SARA/Hukum positif."
  ];
  const rawTerms = settings?.writerTerms;
  const termsList = rawTerms ? rawTerms.split('\n').filter(t => t.trim() !== '') : defaultTerms;

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 animate-fade-in-up">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-8 transition-colors"><ArrowLeft size={20} /> Kembali ke Beranda</Link>

        {/* LOGIKA SAKLAR */}
        {!isOpen ? (
          // JIKA SAKLAR DITUTUP
          <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-xl max-w-md mx-auto text-center space-y-6 animate-fade-in-up mb-12">
            <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={40} /></div>
            <h1 className="text-3xl font-black text-gray-900">Pendaftaran Ditutup</h1>
            <p className="text-gray-600 font-medium leading-relaxed">
              Mohon maaf, saat ini Titik Fiksi Universe sedang tidak menerima pendaftaran penulis baru karena antrean kurasi sedang penuh. Silakan cek kembali nanti!
            </p>
          </div>
        ) : (
          // JIKA SAKLAR DIBUKA
          <>
            <div className="bg-gray-900 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden mb-12 border border-gray-800">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
              <div className="relative z-10 text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl mb-2"><PenTool size={32} /></div>
                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">{heroTitle}</h1>
                <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">{heroDesc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6"><DollarSign size={24} /></div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{b1Title}</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{b1Desc}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6"><ShieldCheck size={24} /></div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{b2Title}</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{b2Desc}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6"><PenTool size={24} /></div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{b3Title}</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{b3Desc}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6"><Layout size={24} /></div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{b4Title}</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{b4Desc}</p>
              </div>
            </div>

            {/* PERUBAHAN JUDUL SYARAT */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-sm mb-12">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3"><CheckCircle2 className="text-blue-600" /> Syarat & Ketentuan Menjadi Penulis</h2>
              <ul className="space-y-4 text-gray-700">
                {termsList.map((term, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">{index + 1}</span>
                    <p className="leading-relaxed whitespace-pre-wrap">{term}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-600 rounded-3xl p-8 md:p-12 shadow-xl text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-white mb-4">Mulai Perjalananmu Sekarang</h2>
                <p className="text-blue-100 mb-8 max-w-xl mx-auto">Kirimkan kelengkapan data diri dan naskah Anda kepada admin untuk proses verifikasi dan pembuatan akun.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a href={`https://wa.me/${cleanWaNumber}?text=Halo%20Admin%20Titik%20Fiksi,%20saya%20ingin%20mendaftar%20sebagai%20penulis.%20Berikut%20data%20diri%20saya:`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg"><MessageCircle size={20} /> Daftar via WhatsApp</a>
                  <a href={`mailto:${email}?subject=Pendaftaran Akun Penulis Baru`} className="flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-bold transition shadow-lg"><Mail size={20} /> Daftar via Email</a>
                </div>
              </div>
            </div>
          </>
        )}

        {/* PERUBAHAN DESAIN PINTU AUTHOR (LEBIH PROFESIONAL & EKSKLUSIF) */}
        <div className="mt-16 pt-10 border-t border-gray-200">
          <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Sudah Punya Akun Penulis?</h3>
              <p className="text-gray-500 font-medium text-sm max-w-md">Lanjutkan menulis, pantau statistik cerita, dan kelola interaksi pembaca melalui panel eksklusif Anda.</p>
            </div>
            <Link 
              href="/login" 
              className="flex-shrink-0 flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 w-full md:w-auto"
            >
              <LogIn size={20} /> Masuk Ruang Penulis
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}