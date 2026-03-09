import { db } from "@/lib/db";
import { updateChapter } from "@/lib/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, AlertTriangle, CalendarClock, Save } from "lucide-react";
import SubmitButton from "@/components/SubmitButton";
import EditorWrapper from "@/components/EditorWrapper";
import { cache } from "react";

/**
 * The params prop for App Router page and layout components.
 */
interface PageProps {
  params: {
    id: string;
    chapterId: string;
  };
}

/**
 * Returns a date in "YYYY-MM-DDTHH:mm" local format for datetime-local input.
 * Handles null or undefined dates with today's date.
 */
function getDateTimeLocalString(date?: Date | null) {
  const dt = date ? new Date(date) : new Date();
  // Returns UTC in "YYYY-MM-DDTHH:mm", but for input value we "localize" it.
  const offset = dt.getTimezoneOffset();
  const local = new Date(dt.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

/**
 * Memoized DB fetch for SSR to avoid redundant parallel calls.
 */
const fetchNovelAndChapter = cache(async (novelId: string, chapterId: string) => {
  // Only fetch necessary fields
  const [novel, chapter] = await Promise.all([
    db.novel.findUnique({
      where: { id: novelId },
      select: { id: true, slug: true, title: true },
    }),
    db.chapter.findUnique({
      where: { id: chapterId },
      // Only select necessary fields for rendering & form
      select: {
        id: true,
        title: true,
        content: true,
        orderIndex: true,
        slug: true,
        isPublished: true,
        isLocked: true,
        publishAt: true,
        payLink: true,
        unlockCode: true,
      },
    }),
  ]);
  return { novel, chapter };
});

/**
 * Isolated form for chapter edit.
 * Receives only what's needed for rendering.
 */
function ChapterForm({
  chapter,
  novel,
}: {
  chapter: NonNullable<Awaited<ReturnType<typeof fetchNovelAndChapter>>["chapter"]>;
  novel: NonNullable<Awaited<ReturnType<typeof fetchNovelAndChapter>>["novel"]>;
}) {
  // Fix arg error: linting Date|null
  const defaultPublishAt = getDateTimeLocalString(chapter.publishAt);

  return (
    <form
      action={updateChapter.bind(null, chapter.id, novel.id, novel.slug)}
      className="space-y-6"
      autoComplete="off"
      noValidate
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="title">
            Judul Bab
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={chapter.title}
            required
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="orderIndex">
            Urutan Bab (Angka)
          </label>
          <input
            type="number"
            id="orderIndex"
            name="orderIndex"
            defaultValue={chapter.orderIndex}
            required
            min={1}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="slug">
          Slug URL (Boleh Kosong)
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          defaultValue={chapter.slug || ""}
          placeholder="Kosongkan agar sistem membuat otomatis"
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm text-gray-500"
        />
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-bold text-gray-700">Isi Cerita</label>
          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-bold flex items-center gap-1">
            <AlertTriangle size={12} /> Editor dilengkapi Auto-Save
          </span>
        </div>
        <EditorWrapper defaultValue={chapter.content} chapterId={chapter.id} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 mt-6">
        <label className="flex items-start gap-4 p-5 border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition shadow-sm">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={chapter.isPublished}
            className="w-6 h-6 mt-1 accent-blue-600 cursor-pointer"
          />
          <div>
            <span className="font-black text-gray-900 block text-lg">Publikasikan Bab</span>
            <span className="text-sm text-gray-500 leading-relaxed mt-1 block">
              Tampilkan bab ini ke pembaca publik.
            </span>
          </div>
        </label>
        <label className="flex items-start gap-4 p-5 border border-amber-200 bg-amber-50/50 rounded-2xl cursor-pointer hover:bg-amber-50 transition shadow-sm">
          <input
            type="checkbox"
            name="isLocked"
            defaultChecked={chapter.isLocked}
            className="w-6 h-6 mt-1 accent-amber-600 cursor-pointer"
          />
          <div>
            <span className="font-black text-amber-900 block text-lg">Kunci Bab (Premium)</span>
            <span className="text-sm text-amber-700 leading-relaxed mt-1 block">
              Pembaca butuh Kode Akses untuk membukanya.
            </span>
          </div>
        </label>
      </div>

      <div className="bg-emerald-50 p-5 border border-emerald-200 rounded-2xl shadow-sm mt-6">
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock className="text-emerald-600" size={20} />
          <span className="font-black text-emerald-900 text-lg">
            Jadwal Tayang (Scheduled Publish)
          </span>
        </div>
        <input
          type="datetime-local"
          name="publishAt"
          defaultValue={defaultPublishAt}
          className="w-full p-4 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-bold text-gray-800"
        />
        <p className="text-sm text-emerald-700 mt-2 font-medium">
          Atur ke masa depan jika ingin bab ini terbit otomatis nanti.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 mt-6 mb-8">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="payLink">
            Link Donasi (Saweria/Trakteer)
          </label>
          <input
            type="url"
            id="payLink"
            name="payLink"
            defaultValue={chapter.payLink || ""}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="unlockCode">
            Kode Akses / Password
          </label>
          <input
            type="text"
            id="unlockCode"
            name="unlockCode"
            defaultValue={chapter.unlockCode || ""}
            className="w-full p-4 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-600 outline-none font-black text-amber-900 tracking-widest"
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
        <SubmitButton
          text="Simpan Perubahan"
          icon={<Save size={20} />}
          customClass="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black text-lg rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
        />
      </div>
    </form>
  );
}

// Use an async page component directly as App Router best practice
export default async function EditChapterPage({ params }: PageProps) {
  const { chapter, novel } = await fetchNovelAndChapter(params.id, params.chapterId);

  if (!novel || !chapter) return notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 pt-28 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <Edit className="text-blue-600" /> Edit Bab
        </h1>
        <Link
          href={`/admin/novels/${params.id}`}
          className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-bold shadow-sm transition"
        >
          <ArrowLeft size={18} /> Kembali ke Novel
        </Link>
      </div>
      <div className="bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-sm">
        <ChapterForm chapter={chapter} novel={novel} />
      </div>
    </div>
  );
}