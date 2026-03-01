import { db } from "@/lib/db";
import Link from "next/link";
import { updateSettings, addSocialLink, deleteSocialLink, addDonationLink, deleteDonationLink, addSponsor, deleteSponsor } from "@/lib/actions";
import { Settings, Type, Link as LinkIcon, Save, Plus, Heart, MessageCircle, PenTool, Info, Home, ShoppingBag, LayoutDashboard, UserCog, Lock, ShieldAlert } from "lucide-react";
import DeleteButton from "@/components/DeleteButton";
import SubmitButton from "@/components/SubmitButton";
import MultiImageInput from "@/components/MultiImageInput";
import PasswordInput from "@/components/PasswordInput"; // <-- Memanggil Komponen Mata

export default async function SettingsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const [settings, socials, donations, sponsors] = await Promise.all([
    db.settings.findFirst(), db.socialLink.findMany(), db.donationLink.findMany(), db.sponsor.findMany()
  ]);

  const activeTab = searchParams.tab || "beranda";

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3"><Settings className="text-blue-600"/> Pengaturan Sistem</h1>
          <p className="text-gray-500 font-medium mt-1">Kategori panel admin disusun presisi sesuai Menu Header Publik.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* SIDEBAR TAB PENGATURAN */}
        <div className="md:col-span-1 bg-white border border-gray-200 rounded-[2rem] p-4 shadow-sm sticky top-24 flex flex-col gap-2">
          <Link href="?tab=beranda" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'beranda' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Home size={18} /> Beranda
          </Link>
          
          {/* TAB BARU: PENGATURAN AKUN (TERPISAH) */}
          <Link href="?tab=akun" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'akun' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <UserCog size={18} /> Pengaturan Akun
          </Link>

          <Link href="?tab=toko" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'toko' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <ShoppingBag size={18} /> Toko & Dukungan
          </Link>
          <Link href="?tab=tentang" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'tentang' ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Info size={18} /> Tentang Kami
          </Link>
          <Link href="?tab=kontak" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'kontak' ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <MessageCircle size={18} /> Kontak
          </Link>
          <Link href="?tab=penulis" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'penulis' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <PenTool size={18} /> Gabung Penulis
          </Link>
          <Link href="?tab=dasbor_kreator" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'dasbor_kreator' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <LayoutDashboard size={18} /> Dasbor Kreator
          </Link>
        </div>

        {/* KONTEN TAB */}
        <div className="md:col-span-3 space-y-8">
          
          {/* TAB 1: BERANDA (Tanpa Password) */}
          {activeTab === "beranda" && (
            <form action={updateSettings} className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up">
              <input type="hidden" name="activeTab" value="beranda" />
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h2 className="font-black text-gray-800 flex items-center gap-2"><Home className="text-blue-600"/> Setup Beranda & Sistem</h2>
                <SubmitButton text="Simpan Beranda" icon={<Save size={16}/>} customClass="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-md" />
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nama Website</label>
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" name="siteName" defaultValue={settings?.siteName} required className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Pengumuman (Running Text)</label>
                  <input type="text" name="runningText" defaultValue={settings?.runningText || ""} placeholder="Teks berjalan di beranda..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium" />
                </div>
                <div className="flex items-center justify-between p-5 bg-blue-50 rounded-2xl border border-blue-200">
                  <div>
                    <span className="font-bold text-blue-900 block text-sm">Status Website (Maintenance Mode)</span>
                    <span className="text-xs text-blue-700">Buka akses publik. Matikan jika sedang perbaikan.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="isActive" defaultChecked={settings?.isActive} className="sr-only peer" />
                    <div className="w-11 h-6 bg-blue-200 peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-blue-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Teks Hak Cipta (Footer)</label>
                  <input type="text" name="copyrightText" defaultValue={settings?.copyrightText || ""} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium" />
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: PENGATURAN AKUN (Tab Baru) */}
          {activeTab === "akun" && (
            <form action={updateSettings} className="bg-white rounded-[2.5rem] border border-red-200 shadow-sm overflow-hidden animate-fade-in-up">
              <input type="hidden" name="activeTab" value="akun" />
              <div className="p-6 border-b border-red-100 bg-red-50/50 flex items-center justify-between">
                <h2 className="font-black text-red-900 flex items-center gap-2"><UserCog className="text-red-600"/> Keamanan Akun Admin</h2>
                <SubmitButton text="Simpan Akun" icon={<Save size={16}/>} customClass="bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition shadow-md" />
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-start gap-3">
                  <ShieldAlert className="text-red-500 flex-shrink-0" size={24}/>
                  <p className="text-sm font-medium text-red-800">
                    Ini adalah kredensial utama untuk mengakses pintu belakang (Admin Door). <strong>Wajib masukkan Sandi Saat Ini</strong> jika Anda mengubah Email atau Sandi Baru.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Admin (Login)</label>
                    <input type="email" name="adminEmail" defaultValue={settings?.adminEmail || settings?.email || ""} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Password Baru (Opsional)</label>
                    {/* MEMAKAI KOMPONEN MATA */}
                    <PasswordInput name="newAdminPassword" placeholder="Kosongkan jika tidak diubah" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-bold placeholder:font-normal text-sm" />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 w-full md:w-1/2">
                  <label className="block text-[10px] font-black text-red-600 flex items-center gap-1 uppercase tracking-widest mb-2"><Lock size={12}/> Konfirmasi Password Saat Ini</label>
                  {/* MEMAKAI KOMPONEN MATA */}
                  <PasswordInput name="oldAdminPassword" placeholder="Wajib diisi untuk menyimpan perubahan" className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl outline-none focus:ring-2 focus:ring-red-600 text-sm placeholder:text-red-300" />
                </div>
              </div>
            </form>
          )}

          {/* TAB LAINNYA TETAP UTUH (TOKO, TENTANG, KONTAK, PENULIS, DASBOR KREATOR) */}
          {activeTab === "toko" && (
             <div className="space-y-8 animate-fade-in-up">
              <div className="bg-white p-8 rounded-[2.5rem] border border-red-200 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-6"><Heart className="text-red-500"/> Link Donasi Web</h3>
                <form action={addDonationLink} className="space-y-3 mb-6">
                  <input type="text" name="platform" placeholder="Platform (Saweria/Trakteer)" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-red-500" />
                  <input type="url" name="url" placeholder="URL Link Donasi" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500" />
                  <SubmitButton text="Tambah Donasi" icon={<Plus size={16}/>} customClass="w-full bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition shadow-md flex items-center justify-center gap-2 py-3" />
                </form>
                <div className="space-y-2 pt-2">
                  {donations.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                      <span className="font-bold text-red-900 text-sm uppercase">{d.platform}</span>
                      <form action={deleteDonationLink.bind(null, d.id)}><DeleteButton message={`Hapus donasi ${d.platform}?`}/></form>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-indigo-200 shadow-sm">
                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-6"><ShoppingBag className="text-indigo-600"/> Kelola Sponsor / Produk</h2>
                <form action={addSponsor} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                   <input type="text" name="title" placeholder="Nama Produk/Sponsor" required className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 md:col-span-2" />
                   <MultiImageInput />
                   <input type="url" name="linkUrl" placeholder="Link Tujuan Pembelian" required className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 md:col-span-2" />
                   <textarea name="description" placeholder="Deskripsi Singkat" className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 md:col-span-2"></textarea>
                   <SubmitButton text="Tambah Produk" icon={<Plus size={16}/>} customClass="md:col-span-2 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-md" />
                </form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sponsors.map(s => {
                    const imgArray = s.imageUrl.split(",");
                    return (
                      <div key={s.id} className="flex flex-col p-4 bg-indigo-50 rounded-2xl border border-indigo-100 gap-3 relative overflow-hidden">
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-indigo-900 block text-sm truncate pr-6">{s.title}</span>
                          <form action={deleteSponsor.bind(null, s.id)} className="absolute top-4 right-4"><DeleteButton message={`Hapus produk ${s.title}?`}/></form>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                          {imgArray.map((imgUrl, i) => (
                            <img key={i} src={imgUrl} alt="Produk" className="w-12 h-12 object-cover rounded-lg border border-indigo-200 shadow-sm flex-shrink-0" />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "tentang" && (
            <form action={updateSettings} className="bg-white rounded-[2.5rem] border border-amber-200 shadow-sm overflow-hidden animate-fade-in-up">
              <input type="hidden" name="activeTab" value="tentang" />
              <div className="p-6 border-b border-amber-100 bg-amber-50/50 flex items-center justify-between">
                <h2 className="font-black text-amber-900 flex items-center gap-2"><Info className="text-amber-600"/> Tentang Kami</h2>
                <SubmitButton text="Simpan" icon={<Save size={16}/>} customClass="bg-amber-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-amber-700 transition shadow-md" />
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-black text-amber-800 uppercase tracking-widest mb-2">Visi Penulis</label>
                  <textarea name="visiPenulis" defaultValue={settings?.visiPenulis || ""} rows={4} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium leading-relaxed"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-black text-amber-800 uppercase tracking-widest mb-2">Kekuatan Pembaca</label>
                  <textarea name="kekuatanPembaca" defaultValue={settings?.kekuatanPembaca || ""} rows={4} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium leading-relaxed"></textarea>
                </div>
              </div>
            </form>
          )}

          {activeTab === "kontak" && (
            <div className="space-y-8 animate-fade-in-up">
              <form action={updateSettings} className="bg-white rounded-[2.5rem] border border-sky-200 shadow-sm overflow-hidden">
                <input type="hidden" name="activeTab" value="kontak" />
                <div className="p-6 border-b border-sky-100 bg-sky-50/50 flex items-center justify-between">
                  <h2 className="font-black text-sky-900 flex items-center gap-2"><MessageCircle className="text-sky-600"/> Info Kontak Utama</h2>
                  <SubmitButton text="Simpan" icon={<Save size={16}/>} customClass="bg-sky-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-sky-700 transition shadow-md" />
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-sky-800 uppercase tracking-widest mb-2">Email Publik</label>
                    <input type="email" name="email" defaultValue={settings?.email || ""} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-sky-800 uppercase tracking-widest mb-2">No. WhatsApp Utama</label>
                    <input type="text" name="whatsappNumber" defaultValue={settings?.whatsappNumber || ""} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 font-bold" />
                  </div>
                </div>
              </form>
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-6"><LinkIcon className="text-blue-600"/> Sosial Media</h3>
                <form action={addSocialLink} className="space-y-3 mb-6">
                  <input type="text" name="platform" placeholder="Platform (Instagram/TikTok)" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600" />
                  <input type="url" name="url" placeholder="URL Profil" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600" />
                  <SubmitButton text="Tambah Sosmed" icon={<Plus size={16}/>} customClass="w-full bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2 py-3" />
                </form>
                <div className="space-y-2 pt-2">
                  {socials.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="font-bold text-gray-800 text-sm uppercase">{s.platform}</span>
                      <form action={deleteSocialLink.bind(null, s.id)}><DeleteButton message={`Hapus sosmed ${s.platform}?`}/></form>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "penulis" && (
            <form action={updateSettings} className="bg-white rounded-[2.5rem] border border-emerald-200 shadow-sm overflow-hidden animate-fade-in-up">
              <input type="hidden" name="activeTab" value="penulis" />
              <div className="p-6 border-b border-emerald-100 bg-emerald-50/50 flex items-center justify-between">
                <h2 className="font-black text-emerald-900 flex items-center gap-2"><PenTool className="text-emerald-600"/> Setup Pendaftaran Penulis</h2>
                <SubmitButton text="Simpan" icon={<Save size={16}/>} customClass="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition shadow-md" />
              </div>
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between p-5 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div><span className="font-bold text-emerald-900 block text-sm">Buka Pendaftaran (Menu Gabung Penulis)</span></div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="isOpenForWriters" defaultChecked={settings?.isOpenForWriters ?? true} className="sr-only peer" />
                    <div className="w-11 h-6 bg-emerald-200 peer-focus:ring-2 peer-focus:ring-emerald-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <div className="space-y-4">
                  <input type="text" name="writerHeroTitle" defaultValue={settings?.writerHeroTitle || ""} placeholder="Judul Panggilan (Contoh: Karyamu, Aturanmu)" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold" />
                  <textarea name="writerHeroDesc" defaultValue={settings?.writerHeroDesc || ""} rows={2} placeholder="Deskripsi pendek..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-3">
                      <label className="block text-[10px] font-black text-emerald-800 uppercase">Kotak Keuntungan 1</label>
                      <input type="text" name="writerBenefit1Title" defaultValue={settings?.writerBenefit1Title || ""} placeholder="Judul..." className="w-full p-2.5 rounded-lg text-sm font-bold outline-none" />
                      <textarea name="writerBenefit1Desc" defaultValue={settings?.writerBenefit1Desc || ""} rows={2} placeholder="Deskripsi..." className="w-full p-2.5 rounded-lg text-xs outline-none"></textarea>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-3">
                      <label className="block text-[10px] font-black text-emerald-800 uppercase">Kotak Keuntungan 2</label>
                      <input type="text" name="writerBenefit2Title" defaultValue={settings?.writerBenefit2Title || ""} placeholder="Judul..." className="w-full p-2.5 rounded-lg text-sm font-bold outline-none" />
                      <textarea name="writerBenefit2Desc" defaultValue={settings?.writerBenefit2Desc || ""} rows={2} placeholder="Deskripsi..." className="w-full p-2.5 rounded-lg text-xs outline-none"></textarea>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-3">
                      <label className="block text-[10px] font-black text-emerald-800 uppercase">Kotak Keuntungan 3</label>
                      <input type="text" name="writerBenefit3Title" defaultValue={settings?.writerBenefit3Title || ""} placeholder="Judul..." className="w-full p-2.5 rounded-lg text-sm font-bold outline-none" />
                      <textarea name="writerBenefit3Desc" defaultValue={settings?.writerBenefit3Desc || ""} rows={2} placeholder="Deskripsi..." className="w-full p-2.5 rounded-lg text-xs outline-none"></textarea>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-3">
                      <label className="block text-[10px] font-black text-emerald-800 uppercase">Kotak Keuntungan 4</label>
                      <input type="text" name="writerBenefit4Title" defaultValue={settings?.writerBenefit4Title || ""} placeholder="Judul..." className="w-full p-2.5 rounded-lg text-sm font-bold outline-none" />
                      <textarea name="writerBenefit4Desc" defaultValue={settings?.writerBenefit4Desc || ""} rows={2} placeholder="Deskripsi..." className="w-full p-2.5 rounded-lg text-xs outline-none"></textarea>
                    </div>
                </div>
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                  <label className="block text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">Syarat & Ketentuan Naskah</label>
                  <textarea name="writerTerms" defaultValue={settings?.writerTerms || ""} rows={6} className="w-full p-4 bg-white border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 font-medium leading-relaxed"></textarea>
                  <p className="text-[10px] text-emerald-700 font-bold mt-2">Pisahkan dengan ENTER untuk membuat nomor urut otomatis.</p>
                </div>
              </div>
            </form>
          )}

          {activeTab === "dasbor_kreator" && (
            <form action={updateSettings} className="bg-white rounded-[2.5rem] border border-purple-200 shadow-sm overflow-hidden animate-fade-in-up">
              <input type="hidden" name="activeTab" value="dasbor_kreator" />
              <div className="p-6 border-b border-purple-100 bg-purple-50/50 flex items-center justify-between">
                <h2 className="font-black text-purple-900 flex items-center gap-2"><LayoutDashboard className="text-purple-600"/> Dasbor Kreator Penulis</h2>
                <SubmitButton text="Simpan" icon={<Save size={16}/>} customClass="bg-purple-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-purple-700 transition shadow-md" />
              </div>
              <div className="p-8 space-y-8">
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <p className="text-sm font-bold text-purple-800">Atur Papan Pengumuman dan Banner Promosi Eksklusif yang akan dilihat oleh semua Penulis di Dasbor mereka.</p>
                </div>
                <div className="space-y-4">
                   <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Pengumuman 1 (Atas)</h3>
                   <input type="text" name="authorAnnounce1Title" defaultValue={settings?.authorAnnounce1Title || "Selamat Datang di Dasbor Baru!"} placeholder="Judul Pengumuman 1" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-purple-600" />
                   <textarea name="authorAnnounce1Desc" rows={2} defaultValue={settings?.authorAnnounce1Desc || "Sistem Titik Fiksi Universe v2.0 telah aktif. Pastikan Anda membaca Panduan Penulis untuk memahami fitur-fitur baru seperti Kunci Bab Premium."} placeholder="Isi Pengumuman 1" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600"></textarea>
                </div>
                <div className="space-y-4">
                   <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Pengumuman 2 (Bawah)</h3>
                   <input type="text" name="authorAnnounce2Title" defaultValue={settings?.authorAnnounce2Title || "Kebijakan Kreator Penulis"} placeholder="Judul Pengumuman 2" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-purple-600" />
                   <textarea name="authorAnnounce2Desc" rows={2} defaultValue={settings?.authorAnnounce2Desc || "Harap pastikan semua karya yang dipublikasikan mematuhi pedoman komunitas kami dan tidak mengandung unsur plagiarisme."} placeholder="Isi Pengumuman 2" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600"></textarea>
                </div>
                <div className="space-y-4 p-5 bg-gray-900 rounded-2xl border border-gray-700">
                   <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest border-b border-gray-700 pb-2">Teks Banner Promosi Premium</h3>
                   <input type="text" name="promoPremiumTitle" defaultValue={settings?.promoPremiumTitle || "Jadikan Karyamu Sorotan Utama!"} placeholder="Judul Banner Promosi" className="w-full p-3 bg-gray-800 border border-gray-600 text-white rounded-xl font-black outline-none focus:ring-2 focus:ring-amber-500" />
                   <textarea name="promoPremiumDesc" rows={2} defaultValue={settings?.promoPremiumDesc || "Dapatkan ribuan pembaca baru dengan menampilkan novelmu di Banner Raksasa pada halaman utama Titik Fiksi Universe. Slot sangat terbatas!"} placeholder="Isi Promo" className="w-full p-3 bg-gray-800 border border-gray-600 text-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"></textarea>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}