import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Link from "next/link";
import { ArrowLeft, Edit3, Lock, CalendarClock } from "lucide-react";
import SubmitButton from "@/components/SubmitButton";
import { createChapterByAuthor } from "@/lib/actions";
import EditorWrapper from "@/components/EditorWrapper";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "TF_UNIVERSE_SECRET_KEY_2026_SAFE");

export default async function AuthorNewChapterPage({ params }: { params: { slug: string } }) {
  const token = cookies().get("admin_session")?.value;
  if (!token) redirect("/login");
  const verified = await jwtVerify(token, JWT_SECRET);
  const userId = verified.payload.userId as string;

  const novel = await db.novel.findUnique({ where: { slug: params.slug }, include: { _count: { select: { chapters: true } } } });
  if (!novel || novel.userId !== userId) return notFound();

  const nextOrderIndex = novel._count.chapters + 1;
  const createWithParams = createChapterByAuthor.bind(null, novel.id, novel.slug);

  // Set Waktu Default Saat Ini (WIB)
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000; 
  const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Edit3 className="text-indigo-600" size={32}/> Tulis <span className="text-indigo-600">Bab Baru</span>
          </h1>
          <p className="text-gray-500 font-bold mt-1">Novel: {novel.title}</p>
        </div>
        <Link href={`/author/novel/${novel.slug}`} className="inline-flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 font-bold transition shadow-sm">
          <ArrowLeft size={18} /> Batal
        </Link>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-200 shadow-sm relative overflow-hidden">
        <form action={createWithParams} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">No. Bab</label>
              <input type="number" name="orderIndex" defaultValue={nextOrderIndex} required className="w-full p-4 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl outline-none font-black text-center text-xl" />
            </div>
            <div className="md:col-span-6 space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Judul Bab</label>
              <input type="text" name="title" id="titleInput" required placeholder="Contoh: Pertemuan di Hutan" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-800" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Slug URL</label>
              <input type="text" name="slug" id="slugInput" required placeholder="pertemuan-di-hutan" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono text-sm" />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Isi Cerita</label>
            <EditorWrapper />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
             <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 space-y-3">
               <div className="flex items-center gap-2"><Lock className="text-amber-500" size={18}/><span className="font-bold text-amber-900">Bab Terkunci / Berbayar?</span></div>
               <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="isLocked" className="w-4 h-4 rounded text-amber-600" /><span className="text-sm font-bold text-amber-800">Ya, Kunci Bab Ini</span></label>
               <input type="url" name="payLink" placeholder="Link Trakteer / Saweria khusus bab ini" className="w-full p-3 bg-white border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500" />
               <input type="text" name="unlockCode" placeholder="Kode Buka Kunci (Opsional)" className="w-full p-3 bg-white border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 font-mono" />
             </div>

             <div className="space-y-4">
               <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 space-y-3">
                 <div className="flex items-center gap-2"><CalendarClock className="text-emerald-600" size={18}/><span className="font-bold text-emerald-900">Jadwal Tayang</span></div>
                 <input type="datetime-local" name="publishAt" defaultValue={localISOTime} className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500" />
                 <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-emerald-200/50">
                   <input type="checkbox" name="isPublished" defaultChecked className="w-4 h-4 rounded text-emerald-600" />
                   <span className="text-sm font-bold text-emerald-800">Aktifkan Publikasi</span>
                 </label>
                 <p className="text-[10px] text-emerald-700 font-bold">*Jika tanggal diatur ke masa depan, bab ini baru akan terlihat oleh pembaca pada tanggal tersebut.</p>
               </div>
               {/* TOMBOL YANG SUDAH DIPERBAIKI */}
               <SubmitButton text="Simpan & Unggah Bab" customClass="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-sm text-sm" isEdit={false} />
             </div>
          </div>
        </form>
        <script dangerouslySetInnerHTML={{ __html: `document.getElementById('titleInput').addEventListener('input', function(e) { document.getElementById('slugInput').value = e.target.value.toLowerCase().trim().replace(/[^a-z0-9\\s-]/g, '').replace(/\\s+/g, '-').replace(/-+/g, '-'); });`}} />
      </div>
    </div>
  );
}