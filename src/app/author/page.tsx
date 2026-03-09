import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify, JWTPayload } from "jose";
import Link from "next/link";
import {
  Plus,
  BookOpen,
  Eye,
  Crown,
  Megaphone,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { redirect } from "next/navigation";

// Use a helper for JWT secret
const getJwtSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET tidak ditemukan di environment variables!");
  return new TextEncoder().encode(secret);
};

const getUserIdFromToken = async (token: string, secret: Uint8Array): Promise<string | null> => {
  try {
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.userId === "string" ? payload.userId : null;
  } catch {
    return null;
  }
};

export const dynamic = "force-dynamic";

export default async function AuthorDashboardPage() {
  const token = cookies().get("admin_session")?.value;
  if (!token) return redirect("/login");

  const JWT_SECRET = getJwtSecret();
  const userId = await getUserIdFromToken(token, JWT_SECRET);
  if (!userId) return redirect("/login");

  // Fetch user, user novels, and settings in parallel
  const [user, userNovels, settings] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.novel.findMany({
      where: { userId },
      include: { chapters: true },
      orderBy: { createdAt: "desc" }
    }),
    db.settings.findFirst()
  ]);

  // WhatsApp link for promotion
  const waNumber = settings?.whatsappNumber ?? "";
  const cleanWaNumber = waNumber.replace(/\D+/g, "");
  const promoMessage = encodeURIComponent(
    `Halo Admin TF Universe, saya penulis atas nama ${user?.name}. Saya tertarik untuk menyewa Banner Sorotan Utama untuk mempromosikan karya saya.`
  );
  const waLink = cleanWaNumber
    ? `https://wa.me/${cleanWaNumber}?text=${promoMessage}`
    : "#";

  // Helper for split and emphasize last two words of promoPremiumTitle
  function renderPromoPremiumTitle(title?: string) {
    if (!title) {
      return (
        <>
          Jadikan Karyamu <span className="text-amber-400">Sorotan Utama!</span>
        </>
      );
    }
    const words = title.split(" ");
    if (words.length < 2) return title;
    const before = words.slice(0, -2).join(" ");
    const after = words.slice(-2).join(" ");
    return (
      <>
        {before} <span className="text-amber-400">{after}</span>
      </>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up space-y-8">

      {/* Welcome Banner */}
      <section className="bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-500/30">
        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/20 mb-4 tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Ruang Kreator Aktif
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 drop-shadow-lg">
            Halo, {user?.name ?? "-"}!
          </h1>
          <p className="text-indigo-100 font-medium max-w-lg leading-relaxed opacity-90 text-sm">
            Selamat datang di pusat komando Anda. Mulailah menulis bab baru, berinteraksi dengan pembaca, dan kembangkan sayap karyamu di Titik Fiksi Universe.
          </p>
        </div>
        <BookOpen className="absolute -bottom-10 -right-10 text-white opacity-10 transform rotate-12" size={250} />
      </section>

      {/* Info & Promotion */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Announcements */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Papan Pengumuman</h2>
              <p className="text-xs text-gray-500 font-bold">Info & Kebijakan Terbaru</p>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            {/* Announcement 1 */}
            <div className="group flex gap-4 items-start">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 relative">
                <div className="absolute inset-0 bg-blue-500 animate-ping rounded-full opacity-50"></div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">
                  {settings?.authorAnnounce1Title ?? "Selamat Datang di Dasbor Baru!"}
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {settings?.authorAnnounce1Desc ??
                    "Sistem Titik Fiksi Universe v2.0 telah aktif. Pastikan Anda membaca Panduan Penulis untuk memahami fitur-fitur baru seperti Kunci Bab Premium."}
                </p>
              </div>
            </div>
            {/* Announcement 2 */}
            <div className="group flex gap-4 items-start pt-4 border-t border-gray-50">
              <div className="w-2 h-2 rounded-full bg-gray-300 mt-2"></div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">
                  {settings?.authorAnnounce2Title ?? "Kebijakan Kreator Penulis"}
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {settings?.authorAnnounce2Desc ??
                    "Harap pastikan semua karya yang dipublikasikan mematuhi pedoman komunitas kami dan tidak mengandung unsur plagiarisme."}
                </p>
                <Link
                  href="/author/guide"
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 flex items-center gap-1 hover:underline"
                >
                  Baca Panduan <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Promotion */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] border border-gray-700 p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors duration-700"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-amber-500/30">
              <Crown size={12} className="fill-amber-400" /> Fitur Eksklusif
            </div>
            <h2 className="text-2xl font-black text-white mb-2 leading-tight">
              {renderPromoPremiumTitle(settings?.promoPremiumTitle)}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {settings?.promoPremiumDesc ??
                "Dapatkan ribuan pembaca baru dengan menampilkan novelmu di Banner Raksasa pada halaman utama Titik Fiksi Universe. Slot sangat terbatas!"}
            </p>
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3.5 rounded-xl text-sm font-black flex items-center justify-between hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95 group/btn"
          >
            Pesan Slot Promosi Sekarang{" "}
            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      {/* Novels List */}
      <section className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BookOpen className="text-indigo-600" />
            Pustaka Karyamu
          </h2>
          <Link
            href="/author/new"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30 active:scale-95"
          >
            <Plus size={18} /> Buat Novel Baru
          </Link>
        </div>
        {userNovels.length === 0 ? (
          <p className="text-center py-10 text-gray-500 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            Belum Ada Karya
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userNovels.map((novel) => (
              <Link
                key={novel.id}
                href={`/author/novel/${novel.slug}`}
                className="bg-white rounded-[2rem] border border-gray-100 p-3 shadow-sm hover:border-indigo-300 hover:shadow-xl transition-all duration-300 block group transform hover:-translate-y-1"
              >
                <div className="aspect-[2/3] bg-gray-100 rounded-2xl mb-4 overflow-hidden relative shadow-inner">
                  {novel.coverImage ? (
                    <img
                      src={novel.coverImage}
                      alt={novel.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-300 bg-gray-50">
                      <BookOpen size={40} />
                    </div>
                  )}
                </div>
                <div className="px-2 pb-2">
                  <h3 className="font-black text-gray-900 leading-tight line-clamp-2 mb-3 group-hover:text-indigo-600 transition-colors">
                    {novel.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-black uppercase tracking-widest border-t border-gray-50 pt-3">
            {userNovels.map(novel => (
               <Link key={novel.id} href={`/author/novel/${novel.slug}`} className="bg-white rounded-[2rem] border border-gray-100 p-3 shadow-sm hover:border-indigo-300 hover:shadow-xl transition-all duration-300 block group transform hover:-translate-y-1">
                 <div className="aspect-[2/3] bg-gray-100 rounded-2xl mb-4 overflow-hidden relative shadow-inner">
                   {novel.coverImage ? <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" /> : <div className="flex items-center justify-center w-full h-full text-gray-300 bg-gray-50"><BookOpen size={40}/></div>}
                 </div>
                 <div className="px-2 pb-2">
                   <h3 className="font-black text-gray-900 leading-tight line-clamp-2 mb-3 group-hover:text-indigo-600 transition-colors">{novel.title}</h3>
                   <div className="flex items-center justify-between text-[10px] text-gray-500 font-black uppercase tracking-widest border-t border-gray-50 pt-3">
                     <span className="flex items-center gap-1"><Eye size={12}/> {novel.views}</span>
                     <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg">{novel.chapters.length} Bab</span>
                   </div>
                 </div>
               </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );

}