import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Link from "next/link";
import { ArrowLeft, PlusCircle, Lock, CalendarClock, Save } from "lucide-react";
import { createChapter } from "@/lib/actions";
import EditorWrapper from "@/components/EditorWrapper";
import { type FC } from "react";

// Define utility for slugifying on client
const slugifyScript = `
(function() {
  var titleInput = document.getElementById('titleInput');
  var slugInput = document.getElementById('slugInput');
  if (!titleInput || !slugInput) return;
  titleInput.addEventListener('input', function(e) {
    var val = e.target.value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\\s-]/g, '')
      .replace(/\\s+/g, '-')
      .replace(/-+/g, '-');
    slugInput.value = val;
  });
})();
`;

// Abstract session verification for better readability
async function verifyAdminSession() {
  const token = cookies().get("admin_session")?.value;
  if (!token) redirect("/login");
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || "TF_UNIVERSE_SECRET_KEY_2026_SAFE")
    );
    if (!verified) redirect("/login");
    // you may return decoded payload if needed
  } catch {
    redirect("/login");
  }
}

// Helper for default datetime-local input value (local time, no seconds)
function getLocalDateTimeValue(): string {
  const local = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

interface NewChapterPageProps {
  params: {
    id: string;
  };
}

const NewChapterPage: FC<NewChapterPageProps> = async ({ params }) => {
  await verifyAdminSession();

  const novel = await db.novel.findUnique({
    where: { id: params.id }
  });
  if (!novel) return notFound();

  const lastChapter = await db.chapter.findFirst({
    where: { novelId: novel.id },
    orderBy: { orderIndex: "desc" }
  });
  const nextOrderIndex: number = lastChapter ? lastChapter.orderIndex + 1 : 1;

  // Create action handler for the form, pre-bound with static params
  const createWithParams = createChapter.bind(null, novel.id, novel.slug);

  // Localize default datetime
  const defaultTime = getLocalDateTimeValue();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-32 pt-28 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <PlusCircle className="text-blue-500" size={32}/> Tambah <span className="text-blue-500">Bab Baru</span>
          </h1>
        </div>
        <Link
          href={`/admin/novels/${novel.id}/chapters`}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-600 font-bold transition"
        >
          <ArrowLeft size={18} /> Kembali
        </Link>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-200 shadow-sm relative">
        <form action={createWithParams} className="space-y-6" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="orderIndex" className="text-xs font-black text-gray-400 uppercase tracking-widest">No. Bab</label>
              <input
                type="number"
                name="orderIndex"
                id="orderIndex"
                defaultValue={nextOrderIndex}
                required
                min={1}
                className="w-full p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl outline-none font-black text-center text-xl"
              />
            </div>
            <div className="md:col-span-6 space-y-2">
              <label htmlFor="titleInput" className="text-xs font-black text-gray-400 uppercase tracking-widest">Judul Bab</label>
              <input
                type="text"
                name="title"
                id="titleInput"
                required
                placeholder="Contoh: Pertemuan Pertama"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold"
                autoComplete="off"
                maxLength={100}
              />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label htmlFor="slugInput" className="text-xs font-black text-gray-400 uppercase tracking-widest">Slug URL</label>
              <input
                type="text"
                name="slug"
                id="slugInput"
                required
                placeholder="pertemuan-pertama"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono text-sm"
                autoComplete="off"
                pattern="^[a-z0-9-]+$"
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Isi Cerita</label>
            <EditorWrapper defaultValue="" chapterId="new" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="text-amber-500" size={18}/>
                <span className="font-bold text-amber-900">Bab Terkunci / Berbayar?</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isLocked"
                  className="w-4 h-4 rounded text-amber-600"
                />
                <span className="text-sm font-bold text-amber-800">Ya, Kunci Bab Ini</span>
              </label>
              <input
                type="url"
                name="payLink"
                placeholder="Link Trakteer / Saweria"
                className="w-full p-3 bg-white border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
                maxLength={200}
                autoComplete="off"
              />
              <input
                type="text"
                name="unlockCode"
                placeholder="Kode Buka Kunci"
                className="w-full p-3 bg-white border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                maxLength={50}
                autoComplete="off"
              />
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 space-y-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="text-emerald-600" size={18}/>
                <span className="font-bold text-emerald-900">Jadwal Tayang</span>
              </div>
              <input
                type="datetime-local"
                name="publishAt"
                defaultValue={defaultTime}
                className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-emerald-200/50">
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className="text-sm font-bold text-emerald-800">Aktifkan Publikasi Langsung</span>
              </label>
            </div>
          </div>

          <div className="pt-10 flex justify-end border-t border-gray-100">
            <button
              type="submit"
              className="w-full sm:w-64 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Terbitkan Bab Baru
            </button>
          </div>
        </form>
        {/* Use only what is needed for slug autofill; wrap in IIFE for better safety */}
        <script
          dangerouslySetInnerHTML={{ __html: slugifyScript }}
        />
      </div>
    </div>
  );
};

export default NewChapterPage;