import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Link from "next/link";
import { ArrowLeft, Edit3, Lock, CalendarClock } from "lucide-react";
import SubmitButton from "@/components/SubmitButton";
import { updateChapterByAuthor } from "@/lib/actions";
import EditorWrapper from "@/components/EditorWrapper";
import type { FC } from "react";

// Utility for slug generation (keep in sync with client script)
const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// Get JWT secret safer, fail early with clear error
const getJwtSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set in environment variables");
  return new TextEncoder().encode(secret);
};

export default async function AuthorEditChapterPage({
  params,
}: {
  params: { slug: string; chapterId: string };
}) {
  // Authenticate author via JWT
  const token = cookies().get("admin_session")?.value;
  if (!token) {
    redirect("/login");
  }

  let userId: string;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    userId = payload.userId as string;
    if (!userId) throw new Error();
  } catch {
    // Invalid JWT, force re-login
    redirect("/login");
  }

  // Fetch novel and chapter data, or 404 invalid access
  const [novel, chapter] = await Promise.all([
    db.novel.findUnique({ where: { slug: params.slug } }),
    db.chapter.findUnique({ where: { id: params.chapterId } }),
  ]);

  if (
    !novel ||
    !chapter ||
    novel.userId !== userId ||
    chapter.novelId !== novel.id
  ) {
    return notFound();
  }

  const action = updateChapterByAuthor.bind(null, chapter.id, novel.id, novel.slug);

  // Normalize date to display as local time in input field
  const getSavedTime = (): string => {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    const baseDate = chapter.publishAt ?? new Date();
    return new Date(baseDate.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // Component for form field grouping
  const FormGroup: FC<{ label: string; children: React.ReactNode }> = ({
    label,
    children,
  }) => (
    <div className="space-y-2">
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <Edit3 className="text-amber-500" size={32} />
          Revisi <span className="text-amber-500">Bab</span>
        </h1>
        <Link
          href={`/author/novel/${novel.slug}`}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-600 font-bold transition"
        >
          <ArrowLeft size={18} /> Batal Revisi
        </Link>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-200 shadow-sm relative overflow-hidden">
        <form id="novelForm" action={action} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-2">
              <FormGroup label="No. Bab">
                <input
                  type="number"
                  name="orderIndex"
                  defaultValue={chapter.orderIndex}
                  required
                  className="w-full p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl outline-none font-black text-center text-xl"
                />
              </FormGroup>
            </div>
            <div className="md:col-span-6">
              <FormGroup label="Judul Bab">
                <input
                  type="text"
                  name="title"
                  id="titleInput"
                  defaultValue={chapter.title}
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold"
                  autoComplete="off"
                />
              </FormGroup>
            </div>
            <div className="md:col-span-4">
              <FormGroup label="Slug URL">
                <input
                  type="text"
                  name="slug"
                  id="slugInput"
                  defaultValue={chapter.slug}
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono text-sm"
                  autoComplete="off"
                />
              </FormGroup>
            </div>
          </div>
          <FormGroup label="Isi Cerita">
            <EditorWrapper defaultValue={chapter.content} chapterId={chapter.id} />
          </FormGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="text-amber-500" size={18} />
                <span className="font-bold text-amber-900">
                  Bab Terkunci / Berbayar?
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isLocked"
                  defaultChecked={chapter.isLocked}
                  className="w-4 h-4 rounded text-amber-600"
                />
                <span className="text-sm font-bold text-amber-800">
                  Ya, Kunci Bab Ini
                </span>
              </label>
              <input
                type="url"
                name="payLink"
                defaultValue={chapter.payLink || ""}
                placeholder="Link Trakteer / Saweria"
                className="w-full p-3 bg-white border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
                autoComplete="off"
              />
              <input
                type="text"
                name="unlockCode"
                defaultValue={chapter.unlockCode || ""}
                placeholder="Kode Buka Kunci"
                className="w-full p-3 bg-white border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                autoComplete="off"
              />
            </div>
            <div className="space-y-4">
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="text-emerald-600" size={18} />
                  <span className="font-bold text-emerald-900">
                    Jadwal Tayang
                  </span>
                </div>
                <input
                  type="datetime-local"
                  name="publishAt"
                  defaultValue={getSavedTime()}
                  className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-emerald-200/50">
                  <input
                    type="checkbox"
                    name="isPublished"
                    defaultChecked={chapter.isPublished}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="text-sm font-bold text-emerald-800">
                    Aktifkan Publikasi
                  </span>
                </label>
              </div>
              <div className="flex justify-end pt-4">
                <SubmitButton
                  text="Simpan Revisi"
                  customClass="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition shadow-sm text-sm"
                />
              </div>
            </div>
          </div>
        </form>
        {/* Inline script: slug auto-generation for better UX.
            NOTE: This is legacy DOM logic. Next step for best practices: migrate to a controlled React component.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
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
                  titleInput.addEventListener('input', function(e) {
                    slugInput.value = generateSlug(e.target.value);
                  });

                  if (form) {
                    form.addEventListener('submit', function() {
                      if (!slugInput.value || slugInput.value.trim() === "") {
                        slugInput.value = generateSlug(titleInput.value);
                      }
                    });
                  }
                }
              })();
            `,
          }}
        />
      </div>
    </div>
  );
}