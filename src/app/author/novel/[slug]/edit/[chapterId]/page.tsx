import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Link from "next/link";
import { ArrowLeft, Edit3, Lock, CalendarClock } from "lucide-react";
import SubmitButton from "@/components/SubmitButton";
import { updateChapterByAuthor } from "@/lib/actions";
import EditorWrapper from "@/components/EditorWrapper";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "TF_UNIVERSE_SECRET_KEY_2026_SAFE");

export default async function AuthorEditChapterPage({ params }: { params: { slug: string, chapterId: string } }) {
  const token = cookies().get("admin_session")?.value;
  if (!token) redirect("/login");
  const verified = await jwtVerify(token, JWT_SECRET);
  const userId = verified.payload.userId as string;

  const novel = await db.novel.findUnique({ where: { slug: params.slug } });
  const chapter = await db.chapter.findUnique({ where: { id: params.chapterId } });
  if (!novel || !chapter || novel.userId !== userId || chapter.novelId !== novel.id) return notFound();

  const updateWithParams = updateChapterByAuthor.bind(null, chapter.id, novel.id, novel.slug);

  // Ambil Waktu Tersimpan
  const tzOffset = new Date().getTimezoneOffset() * 60000; 
  const savedTime = chapter.publishAt ? new Date(chapter.publishAt.getTime() - tzOffset).toISOString().slice(0, 16) : new Date(Date.now() - tzOffset).toISOString().slice(0, 16);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Edit3 className="text-amber-500" size={32}/> Revisi <span className="text-amber-500">Bab</span>
          </h1>
        </div>
        <Link href={`/author/novel/${novel.slug}`} className="inline-flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-600 font-bold transition">
          <ArrowLeft size={18} /> Batal Revisi
        </Link>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-200 shadow-sm relative overflow-hidden">
        <form action={updateWithParams} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">No. Bab</label>
              <input type="number" name="orderIndex" defaultValue={chapter.orderIndex} required className="w-full p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl outline-none font-black text-center text-xl" />
            </div>
            <div className="md:col-span-6 space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Judul Bab</label>
              <input type="text" name="title" id="titleInput" defaultValue={chapter.title} required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold" />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Slug URL</label>
              <input type="text" name="slug" id="slugInput" defaultValue={chapter.slug} required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono text-sm" />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Isi Cerita</label>
            <EditorWrapper defaultValue={chapter.content} chapterId={chapter.id} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
             <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 space-y-3">
               <div className="flex items-center gap-2"><Lock className="text-amber-500" size={18}/><span className="font-bold text-amber-900">Bab Terkunci / Berbayar?</span></div>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" name="isLocked" defaultChecked={chapter.isLocked} className="w-4 h-4 rounded text-amber-600" />
                 <span className="text-sm font-bold text-amber-800">Ya, Kunci Bab Ini</span>
               </label>
               <input type="url" name="payLink" defaultValue={chapter.payLink || ""} placeholder="Link Trakteer / Saweria" className="w-full p-3 bg-white border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500" />
               <input type="text" name="unlockCode" defaultValue={chapter.unlockCode || ""} placeholder="Kode Buka Kunci" className="w-full p-3 bg-white border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 font-mono" />
             </div>

             <div className="space-y-4">
               <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 space-y-3">
                 <div className="flex items-center gap-2"><CalendarClock className="text-emerald-600" size={18}/><span className="font-bold text-emerald-900">Jadwal Tayang</span></div>
                 <input type="datetime-local" name="publishAt" defaultValue={savedTime} className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500" />
                 <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-emerald-200/50">
                   <input type="checkbox" name="isPublished" defaultChecked={chapter.isPublished} className="w-4 h-4 rounded text-emerald-600" />
                   <span className="text-sm font-bold text-emerald-800">Aktifkan Publikasi</span>
                 </label>
               </div>
               
               <div className="flex justify-end pt-4">
                 <SubmitButton text="Simpan Revisi" />
               </div>

             </div>
          </div>
        </form>
        <script dangerouslySetInnerHTML={{ __html: `document.getElementById('titleInput').addEventListener('input', function(e) { document.getElementById('slugInput').value = e.target.value.toLowerCase().trim().replace(/[^a-z0-9\\s-]/g, '').replace(/\\s+/g, '-').replace(/-+/g, '-'); });`}} />
      </div>
    </div>
  );
}
        {/* PERBAIKAN SCRIPT: Otomatisasi saat mengetik & saat tombol Save ditekan */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            const form = document.getElementById('novelForm');
            const titleInput = document.getElementById('titleInput');
            const slugInput = document.getElementById('slugInput');

            function generateSlug(text) {
              return text.toLowerCase().trim()
                .replace(/[^a-z0-9\\s-]/g, '')
                .replace(/\\s+/g, '-')
                .replace(/-+/g, '-');
            }

            if (titleInput && slugInput) {
              // Otomatis saat mengetik
              titleInput.addEventListener('input', function(e) {
                slugInput.value = generateSlug(e.target.value);
              });

              // JAMINAN: Pastikan slug terisi saat tombol Save diklik
              if (form) {
                form.addEventListener('submit', function() {
                  if (!slugInput.value || slugInput.value.trim() === "") {
                    slugInput.value = generateSlug(titleInput.value);
                  }
                });
              }
            }
          })();
        `}} />