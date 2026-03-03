"use client";

import { useState } from "react";
import { createNovel } from "@/lib/actions";
import Link from "next/link";
import { ArrowLeft, BookOpen, PenTool, Save } from "lucide-react";
import SubmitButton from "@/components/SubmitButton";

export default function NewNovelPage() {
  const PREDEFINED_GENRES = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Isekai", "Mystery", "Romance", "Sci-Fi", "System", "Urban Fantasy"];

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isManualSlug, setIsManualSlug] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    if (!isManualSlug) {
      const generatedSlug = newTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") 
        .replace(/\s+/g, "-")         
        .replace(/-+/g, "-");         
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsManualSlug(true); 
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 pt-28 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <BookOpen className="text-blue-600" size={32}/> Tambah <span className="text-blue-600">Novel Baru</span>
        </h1>
        <Link href="/admin" className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-bold shadow-sm transition">
          <ArrowLeft size={18} /> Kembali
        </Link>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-sm">
        <form action={createNovel} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Judul Novel</label>
              <input 
                type="text" 
                name="title" 
                value={title}
                onChange={handleTitleChange}
                required 
                placeholder="Contoh: System Raja Keberuntungan" 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-gray-800" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Slug URL (Boleh Kosong)</label>
              {/* PERBAIKAN: Menghapus 'required' agar bisa dites kosongan */}
              <input 
                type="text" 
                name="slug" 
                value={slug}
                onChange={handleSlugChange}
                placeholder="Kosongkan agar sistem membuat otomatis" 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><PenTool size={12}/> Nama Penulis</label>
              <input type="text" name="author" defaultValue="Lutfi Abdulloh" required placeholder="Nama Penulis" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-gray-800" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Status Cerita</label>
              <select name="status" defaultValue="Ongoing" className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-gray-700">
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Hiatus">Hiatus</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">YouTube ID (Opsional)</label>
              <input type="text" name="youtubeTrailer" placeholder="Contoh: dQw4w9WgXcQ" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Pilih Kategori Genre</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PREDEFINED_GENRES.map((g) => (
                <label key={g} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl cursor-pointer hover:border-blue-500 transition">
                  <input type="checkbox" name="genre" value={g} className="w-4 h-4 rounded text-blue-600 cursor-pointer" />
                  <span className="text-sm font-bold text-gray-700">{g}</span>
                </label>
              ))}
            </div>
            <input type="text" name="customGenre" placeholder="Genre Lainnya? (Pisahkan koma)" className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm font-medium" />
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-100 mt-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Sinopsis</label>
            <textarea name="synopsis" required rows={6} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none leading-relaxed resize-none"></textarea>
          </div>

          <div className="pt-4 mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">Link Gambar Cover (Opsional)</label>
            <input type="url" name="coverImage" placeholder="https://i.ibb.co.com/..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
          </div>

          {/* PERBAIKAN: MEMANGGIL SUBMIT BUTTON DENGAN BENAR DI DALAM FORM */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <SubmitButton 
              text="Simpan Novel Baru"
              icon={<Save size={20} />}
              customClass="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black text-lg rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
            />
          </div>

        </form>
      </div>
    </div>
  );

}