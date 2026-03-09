import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Image as ImageIcon,
  Save,
  ShieldCheck,
  Youtube,
} from "lucide-react";
import { createNovelByAuthor } from "@/lib/actions";
import { type ReactNode } from "react";

const JWT_SECRET = process.env.JWT_SECRET
  ? new TextEncoder().encode(process.env.JWT_SECRET)
  : new TextEncoder().encode("TF_UNIVERSE_SECRET_KEY_2026_SAFE");

const GENRES = [
  "Romansa",
  "Fantasi",
  "Aksi",
  "Horor",
  "Misteri",
  "Komedi",
  "Sci-Fi",
  "Slice of Life",
  "Drama",
] as const;

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function YouTubePromoBox(): ReactNode {
  return (
    <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 p-5 md:p-6 rounded-2xl shadow-inner mt-2">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Youtube size={24} />
        </div>
        <div>
          <h3 className="text-sm md:text-base font-black text-red-900 mb-1 flex items-center gap-2">
            Maksimalkan Fitur YouTube! <span className="text-lg">🚀</span>
          </h3>
          <p className="text-xs md:text-sm text-red-800 leading-relaxed mb-3">
            Zaman sekarang, audiens lebih suka <strong>menonton & mendengarkan</strong>.
            Jangan lewatkan peluang ini! Buatlah video <em>Teaser Cerita</em>,{" "}
            <em>Review Alur</em>, atau <em>Audiobook/Podcast</em> dari novel Anda di YouTube.
          </p>
          <ul className="space-y-1.5 text-[11px] md:text-xs font-bold text-red-700">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <strong>Promosi Silang:</strong> Tarik penonton YouTube menjadi pembaca, dan sebaliknya.
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <strong>Monetisasi Ganda:</strong> Penghasilan dari donasi Web + AdSense YouTube!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function GenreCheckboxes() {
  return (
    <div className="flex flex-wrap gap-3">
      {GENRES.map((g) => (
        <label
          key={g}
          className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition"
        >
          <input
            type="checkbox"
            name="genre"
            value={g}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          <span className="text-sm font-bold text-gray-700">{g}</span>
        </label>
      ))}
    </div>
  );
}

export default async function AuthorNewNovelPage() {
  // Validate JWT server-side, redirect on failure
  const token = cookies().get("admin_session")?.value;
  if (!token) return redirect("/login");
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    if (!verified) return redirect("/login");
  } catch {
    return redirect("/login");
  }

  // Render form page
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <BookOpen className="text-indigo-600" size={32} />
            Buat <span className="text-indigo-600">Karya Baru</span>
          </h1>
          <p className="text-gray-500 font-bold mt-1">
            Mulai perjalanan ceritamu di sini.
          </p>
        </div>
        <Link
          href="/author"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 font-bold transition shadow-sm"
        >
          <ArrowLeft size={18} /> Batal
        </Link>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-200 shadow-sm relative overflow-hidden">
        {/* The form is kept simple, no client JS needed for slug/submit loading */}
        <form
          id="novel-form"
          action={createNovelByAuthor}
          className="space-y-6"
          autoComplete="off"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-xs font-black text-gray-400 uppercase tracking-widest"
              >
                Judul Novel
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                placeholder="Judul Mahakarya Anda"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-gray-900"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="slug"
                className="text-xs font-black text-gray-400 uppercase tracking-widest"
              >
                Slug URL
              </label>
              <input
                type="text"
                name="slug"
                id="slug"
                required
                placeholder="judul-mahakarya-anda"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-mono text-sm"
                autoComplete="off"
                // We encourage users to type, but server-side will also sanitize slug.
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="synopsis"
              className="text-xs font-black text-gray-400 uppercase tracking-widest"
            >
              Sinopsis Cerita
            </label>
            <textarea
              name="synopsis"
              id="synopsis"
              required
              rows={5}
              placeholder="Ceritakan sedikit tentang kisah ini..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-gray-800 resize-none"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="coverImage"
                className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"
              >
                <ImageIcon size={14} /> URL Gambar Sampul
              </label>
              <input
                type="url"
                name="coverImage"
                id="coverImage"
                placeholder="Link gambar (Pinterest/G-Drive)"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
                autoComplete="off"
              />
              <p className="text-[10px] font-bold text-gray-400">
                *Gunakan gambar dengan rasio potret (2:3)
              </p>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="status"
                className="text-xs font-black text-gray-400 uppercase tracking-widest"
              >
                Status Cerita
              </label>
              <select
                name="status"
                id="status"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-gray-800"
                defaultValue="Ongoing"
              >
                <option value="Ongoing">Sedang Berjalan (Ongoing)</option>
                <option value="Completed">Tamat (Completed)</option>
                <option value="Hiatus">Hiatus</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Pilih Genre
            </label>
            <GenreCheckboxes />
            <input
              type="text"
              name="customGenre"
              placeholder="Genre lain? Pisahkan dengan koma (Contoh: Isekai, Sistem)"
              className="w-full p-3 mt-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div className="space-y-2">
              <label
                htmlFor="authorDonationUrl"
                className="text-xs font-black text-gray-400 uppercase tracking-widest"
              >
                Link Donasi Utama (Opsional)
              </label>
              <input
                type="url"
                name="authorDonationUrl"
                id="authorDonationUrl"
                placeholder="Link Saweria / Trakteer profil Anda"
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600"
                autoComplete="off"
              />
            </div>

            <YouTubePromoBox />

            <div className="space-y-2 col-span-1 md:col-span-2">
              <label
                htmlFor="youtubeTrailer"
                className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"
              >
                <Youtube size={14} className="text-red-500" /> Link Trailer YouTube (Opsional)
              </label>
              <input
                type="url"
                name="youtubeTrailer"
                id="youtubeTrailer"
                placeholder="Contoh: https://youtube.com/watch?v=..."
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <label className="flex items-start gap-4 cursor-pointer p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl hover:bg-indigo-50 transition group">
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  name="agreement"
                  id="agreement"
                  required
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <span className="flex items-center gap-2 text-indigo-900 font-black mb-1">
                  <ShieldCheck size={18} className="text-indigo-600" /> Persetujuan Publikasi Karya
                </span>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  Saya menyatakan dengan sadar bahwa cerita ini adalah <strong>karya asli saya (bukan plagiat)</strong>. Saya bertanggung jawab penuh atas isi cerita dan siap menanggung sanksi penghapusan akun jika terbukti melanggar Syarat &amp; Ketentuan platform ini.
                </p>
              </div>
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              id="submit-btn"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-md text-sm"
            >
              <Save size={18} /> <span>Simpan &amp; Terbitkan Novel</span>
            </button>
          </div>
        </form>
      </div>

      {/* 
        Client-side JS for slug auto-generation and loading indication on submit is removed for SSR/SPA separation and best practice.
        You could add these behaviors with React hooks and Client Components if truly needed.
        Ensure your action handler on the server validates and transforms `slug` as required (i.e., use generateSlug).
      */}
    </div>
  );
}