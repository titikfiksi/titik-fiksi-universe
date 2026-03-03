import { db } from "@/lib/db";
import { updateChapter } from "@/lib/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, AlertTriangle, CalendarClock, Save } from "lucide-react";
import SubmitButton from "@/components/SubmitButton";
import EditorWrapper from "@/components/EditorWrapper";

export default async function EditChapterPage({ params }: { params: { id: string, chapterId: string } }) {
  const [novel, chapter] = await Promise.all([
    db.novel.findUnique({ where: { id: params.id } }),
    db.chapter.findUnique({ where: { id: params.chapterId } })
  ]);

  if (!novel || !chapter) return notFound();

  const tzOffset = new Date().getTimezoneOffset() * 60000; 
  const savedTime = chapter.publishAt ? new Date(chapter.publishAt.getTime() - tzOffset).toISOString().slice(0, 16) : new Date(Date.now() - tzOffset).toISOString().slice(0, 16);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 pt-28 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3"><Edit className="text-blue-600"/> Edit Bab</h1>
        <Link href={`/admin/novels/${params.id}`} className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-bold shadow-sm transition">
          <ArrowLeft size={18} /> Kembali ke Novel
        </Link>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-sm">
        <form action={updateChapter.bind(null, chapter.id, novel.id, novel.slug)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Judul Bab</label>
              <input type="text" name="title" defaultValue={chapter.title} required className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Urutan Bab (Angka)</label>
              <input type="number" name="orderIndex" defaultValue={chapter.orderIndex} required min="1" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Slug URL (Boleh Kosong)</label>
            {/* PERBAIKAN: Menghapus required agar saat diedit bisa dikosongkan untuk tes Auto-Slug */}
            <input type="text" name="slug" defaultValue={chapter.slug} placeholder="Kosongkan agar sistem membuat otomatis" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm text-gray-500" />
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
               <label className="block text-sm font-bold text-gray-700">Isi Cerita</label>
               <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-bold flex items-center gap-1"><AlertTriangle size={12}/> Editor dilengkapi Auto-Save</span>
            </div>
            <EditorWrapper defaultValue={chapter.content} chapterId={chapter.id} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 mt-6">
             <label className="flex items-start gap-4 p-5 border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition shadow-sm">
                <input type="checkbox" name="isPublished" defaultChecked={chapter.isPublished} className="w-6 h-6 mt-1 accent-blue-600 cursor-pointer" />
                <div>
                   <span className="font-black text-gray-900 block text-lg">Publikasikan Bab</span>
                   <span className="text-sm text-gray-500 leading-relaxed mt-1 block">Tampilkan bab ini ke pembaca publik.</span>
                </div>
             </label>
             <label className="flex items-start gap-4 p-5 border border-amber-200 bg-amber-50/50 rounded-2xl cursor-pointer hover:bg-amber-50 transition shadow-sm">
                <input type="checkbox" name="isLocked" defaultChecked={chapter.isLocked} className="w-6 h-6 mt-1 accent-amber-600 cursor-pointer" />
                <div>
                   <span className="font-black text-amber-900 block text-lg">Kunci Bab (Premium)</span>
                   <span className="text-sm text-amber-700 leading-relaxed mt-1 block">Pembaca butuh Kode Akses untuk membukanya.</span>
                </div>
             </label>
          </div>

          <div className="bg-emerald-50 p-5 border border-emerald-200 rounded-2xl shadow-sm mt-6">
             <div className="flex items-center gap-2 mb-3">
               <CalendarClock className="text-emerald-600" size={20}/>
               <span className="font-black text-emerald-900 text-lg">Jadwal Tayang (Scheduled Publish)</span>
             </div>
             <input type="datetime-local" name="publishAt" defaultValue={savedTime} className="w-full p-4 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-bold text-gray-800" />
             <p className="text-sm text-emerald-700 mt-2 font-medium">Atur ke masa depan jika ingin bab ini terbit otomatis nanti.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 mt-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Link Donasi (Saweria/Trakteer)</label>
              <input type="url" name="payLink" defaultValue={chapter.payLink || ""} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Kode Akses / Password</label>
              <input type="text" name="unlockCode" defaultValue={chapter.unlockCode || ""} className="w-full p-4 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-600 outline-none font-black text-amber-900 tracking-widest" />
            </div>
          </div>

          {/* PERBAIKAN: MEMANGGIL SUBMIT BUTTON DENGAN CARA YANG BENAR */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <SubmitButton 
              text="Simpan Perubahan"
              icon={<Save size={20} />}
              customClass="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black text-lg rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
            />
          </div>

        </form>
      </div>
    </div>
  );

}