import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  Edit,
  BookOpen,
  Link as LinkIcon,
  Save,
  Image as ImageIcon,
  Layout,
  Lock,
  PenTool,
  AtSign,
  Heart,
  MessageSquare,
  Reply,
  Crown,
  Star,
} from "lucide-react";
import {
  deleteChapter,
  addExternalLink,
  deleteExternalLink,
  updateNovel,
  addAuthorSocial,
  deleteAuthorSocial,
  deleteComment,
  replyCommentByAdmin,
  toggleFeaturedNovel,
} from "@/lib/actions";
import DeleteButton from "@/components/DeleteButton";
import TitleSlugInput from "@/components/TitleSlugInput";
import SubmitButton from "@/components/SubmitButton";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "TF_UNIVERSE_SECRET_KEY_2026_SAFE"
);

export const dynamic = "force-dynamic";

const PREDEFINED_GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Isekai",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "System",
  "Urban Fantasy",
];

type ManageNovelPageProps = {
  params: { id: string };
};

const getCurrentUserAndNovel = async (id: string) => {
  const token = cookies().get("admin_session")?.value;
  if (!token) redirect("/login");
  let isAdmin = false;
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    if (verified.payload.role === "ADMIN") {
      isAdmin = true;
    } else {
      redirect("/");
    }
  } catch {
    redirect("/login");
  }

  const novel = await db.novel.findUnique({
    where: { id },
    include: {
      chapters: {
        orderBy: { orderIndex: "desc" },
        include: {
          comments: { orderBy: { createdAt: "desc" } },
        },
      },
      externalLinks: true,
      authorSocials: true,
    },
  });

  if (!novel) notFound();

  return { novel, isAdmin };
};

// Util: Flatten chapter comments & sort by date descending, limit to 15
const getRecentComments = (novel: any) =>
  novel.chapters
    .flatMap((ch: any) =>
      ch.comments.map((c: any) => ({
        ...c,
        chapterTitle: ch.title,
        chapterIndex: ch.orderIndex,
        chapterId: ch.id,
      }))
    )
    .sort(
      (a: any, b: any) =>
        b.createdAt.getTime() - a.createdAt.getTime()
    )
    .slice(0, 15);

// Util: Parse genres
const parseGenres = (genre: string) => {
  const savedGenres = genre.split(",").map((g) => g.trim());
  const customGenres = savedGenres.filter(
    (g) => !PREDEFINED_GENRES.includes(g)
  );
  return {
    savedGenres,
    customGenresString: customGenres.join(", "),
  };
};

// UI Helper Components

function SectionHeading({
  children,
  icon,
  className = "",
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`font-bold text-gray-800 flex items-center gap-2 ${className}`}
    >
      {icon}
      {children}
    </h2>
  );
}

function NovelInfoForm({ novel }: { novel: any }) {
  const { savedGenres, customGenresString } = parseGenres(novel.genre);

  return (
    <form
      action={updateNovel.bind(null, novel.id)}
      className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <SectionHeading icon={<Edit size={18} />}>
          Informasi Novel & Penulis
        </SectionHeading>
        <SubmitButton text="Simpan Perubahan" icon={<Save size={16} />} />
      </div>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-10 gap-4">
            <TitleSlugInput
              defaultTitle={novel.title}
              defaultSlug={novel.slug}
              titleLabel="Judul Novel"
              slugLabel="Slug URL (Link)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <PenTool size={12} />
              Penulis Utama
            </label>
            <input
              type="text"
              name="author"
              defaultValue={novel.author || "Lutfi Abdulloh"}
              required
              className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-emerald-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Heart size={12} />
              Link Donasi Penulis
            </label>
            <input
              type="url"
              name="authorDonationUrl"
              defaultValue={novel.authorDonationUrl ?? ""}
              placeholder="Link Saweria/Trakteer (Opsional)"
              className="w-full p-3 bg-pink-50 border border-pink-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Status
            </label>
            <select
              name="status"
              defaultValue={novel.status}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
            >
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Hiatus">Hiatus</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
              YouTube ID
            </label>
            <input
              type="text"
              name="youtubeTrailer"
              defaultValue={novel.youtubeTrailer ?? ""}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Genre Cerita
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PREDEFINED_GENRES.map((g) => (
              <label
                key={g}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl cursor-pointer hover:bg-blue-50 transition"
              >
                <input
                  type="checkbox"
                  name="genre"
                  value={g}
                  defaultChecked={savedGenres.includes(g)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-xs font-bold">{g}</span>
              </label>
            ))}
          </div>
          <input
            type="text"
            name="customGenre"
            defaultValue={customGenresString}
            placeholder="Genre Lainnya? (Pisahkan koma)"
            className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Sinopsis
          </label>
          <textarea
            name="synopsis"
            defaultValue={novel.synopsis}
            required
            rows={5}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 resize-none"
          />
        </div>
      </div>
    </form>
  );
}

function ChapterManagement({
  novelId,
  chapters,
}: {
  novelId: string;
  chapters: any[];
}) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-gray-100 pb-4">
        <SectionHeading icon={<Layout size={18} />}>Kelola Bab Cerita</SectionHeading>
        <Link
          href={`/admin/novels/${novelId}/chapters/new`}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-md"
        >
          <Plus size={16} /> Tambah Bab
        </Link>
      </div>
      {chapters.length === 0 ? (
        <p className="text-center py-10 text-gray-500 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          Belum ada bab yang dibuat.
        </p>
      ) : (
        <div className="space-y-3">
          {chapters.map(
            ({
              id,
              orderIndex,
              title,
              isPublished,
              isLocked,
            }: any) => (
              <div
                key={id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group"
              >
                <div className="flex items-center gap-4 overflow-hidden pr-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black flex-shrink-0 text-sm">
                    {orderIndex}
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-gray-900 truncate">
                      {title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] font-bold text-gray-400">
                      {isPublished ? (
                        <span className="text-emerald-500">Publik</span>
                      ) : (
                        <span>Draf</span>
                      )}
                      {isLocked && (
                        <span className="flex items-center gap-1 text-amber-500">
                          <Lock size={10} /> Terkunci
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/novels/${novelId}/chapters/${id}`}
                    className="p-2.5 bg-white border border-gray-200 text-amber-500 hover:bg-amber-50 rounded-xl transition shadow-sm"
                  >
                    <Edit size={14} />
                  </Link>
                  <form action={deleteChapter.bind(null, id, novelId)}>
                    <DeleteButton message={`Hapus Bab ${orderIndex}?`} />
                  </form>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function CommentSection({
  comments,
  novelId,
}: {
  comments: any[];
  novelId: string;
}) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <MessageSquare className="text-pink-500" size={24} />
          Komentar Pembaca
        </h2>
      </div>
      {comments.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8 font-medium">
          Belum ada komentar.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {comment.name}
                  </h4>
                  <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    di Bab {comment.chapterIndex}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400 font-bold">
                  {comment.createdAt.toLocaleDateString("id-ID")}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed italic">
                &quot;{comment.content}&quot;
              </p>

              <details className="mt-4 group/reply">
                <summary className="text-xs font-bold text-indigo-600 cursor-pointer list-none flex items-center gap-1 hover:text-indigo-700 w-fit select-none [&::-webkit-details-marker]:hidden">
                  <Reply size={14} /> Balas sebagai Admin
                </summary>
                <form
                  action={replyCommentByAdmin.bind(
                    null,
                    comment.chapterId,
                    novelId
                  )}
                  className="mt-3 flex gap-2 items-center"
                >
                  <input
                    type="hidden"
                    name="replyTo"
                    value={comment.name}
                  />
                  <input
                    type="text"
                    name="content"
                    placeholder={`Balas @${comment.name} sebagai Admin...`}
                    required
                    className="flex-1 p-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 transition"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
                  >
                    Kirim
                  </button>
                </form>
              </details>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                <form action={deleteComment.bind(null, comment.id)}>
                  <DeleteButton message={`Hapus komentar ini?`} />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedBannerPanel({
  novel,
}: {
  novel: any;
}) {
  // move to top-level to avoid re-creation on every render
  async function handleToggleFeatured(formData: FormData) {
    "use server";
    const daysVal = formData.get("days");
    const days = daysVal ? parseInt(daysVal as string, 10) : null;
    await toggleFeaturedNovel(novel.id, days);
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-[2rem] border border-gray-800 shadow-xl text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-amber-400 font-black flex items-center gap-2">
              <Crown size={18} className="fill-amber-400" />
              Sorotan Utama
            </h3>
            <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-widest">
              Kontrol Banner Premium
            </p>
          </div>
          {novel.isFeatured ? (
            <div className="bg-amber-500/20 text-amber-400 border border-amber-500/50 px-3 py-1 rounded-lg text-xs font-black animate-pulse flex items-center gap-1">
              <Star size={12} className="fill-amber-400" /> AKTIF
            </div>
          ) : (
            <div className="bg-gray-800 text-gray-500 px-3 py-1 rounded-lg text-xs font-bold">
              NONAKTIF
            </div>
          )}
        </div>
        <form action={handleToggleFeatured} className="flex flex-col gap-3">
          {!novel.isFeatured ? (
            <>
              <select
                name="days"
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 w-full font-medium"
              >
                <option value="">Selamanya (Tanpa Batas)</option>
                <option value="7">Promosi 7 Hari</option>
                <option value="14">Promosi 14 Hari</option>
                <option value="30">Promosi 30 Hari</option>
              </select>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-black px-4 py-3 rounded-xl hover:from-amber-300 hover:to-amber-400 transition shadow-[0_0_15px_rgba(245,158,11,0.3)] flex justify-center items-center gap-2 active:scale-95"
              >
                <Crown size={16} className="fill-gray-900" /> Naikkan ke Banner
              </button>
            </>
          ) : (
            <>
              {novel.featuredUntil && (
                <p className="text-xs text-amber-200/80 mb-1 font-bold bg-amber-900/30 p-2.5 rounded-xl text-center border border-amber-500/20">
                  Berakhir:{" "}
                  {new Date(novel.featuredUntil).toLocaleDateString(
                    "id-ID"
                  )}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-red-500/10 text-red-400 border border-red-500/30 font-black px-4 py-3 rounded-xl hover:bg-red-500 hover:text-white transition active:scale-95"
              >
                Hentikan Sorotan
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

function CoverPanel({ novel }: { novel: any }) {
  return (
    <form
      action={updateNovel.bind(null, novel.id)}
      className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4"
    >
      <div className="flex items-center gap-2 mb-2 pb-4 border-b border-gray-100">
        <ImageIcon className="text-purple-600" size={18} />
        <h2 className="font-bold text-gray-800">Cover Novel</h2>
      </div>
      {novel.coverImage ? (
        <div className="aspect-[2/3] w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner relative">
          <Image
            src={novel.coverImage}
            alt={novel.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="aspect-[2/3] w-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
          <ImageIcon size={40} className="mb-2 opacity-50" />
          <span className="text-xs font-bold">Belum ada cover</span>
        </div>
      )}
      <input
        type="url"
        name="coverImage"
        defaultValue={novel.coverImage || ""}
        placeholder="Link Gambar Cover"
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 text-sm"
      />

      {/* Penting: Gunakan title yang sudah ada */}
      <input type="hidden" name="title" value={novel.title} />
      <SubmitButton
        text="Update Cover"
        icon={<Plus size={16} />}
        customClass="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-purple-700 transition shadow-sm"
      />
    </form>
  );
}

function ExternalLinksPanel({ novel }: { novel: any }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
      <SectionHeading
        icon={<LinkIcon className="text-indigo-600" size={18} />}
        className="mb-4 pb-4 border-b border-gray-100"
      >
        Link External
      </SectionHeading>
      <form
        action={addExternalLink.bind(null, novel.id, novel.slug)}
        className="space-y-3 mb-6"
      >
        <input
          type="text"
          name="title"
          placeholder="Contoh: Baca di KBM"
          required
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600"
        />
        <input
          type="url"
          name="url"
          placeholder="https://..."
          required
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600"
        />
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={16} />
          Tambah Link
        </button>
      </form>
      <div className="space-y-2">
        {novel.externalLinks.map((link: any) => (
          <div
            key={link.id}
            className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100"
          >
            <div className="overflow-hidden pr-2">
              <span className="font-bold text-indigo-900 text-xs block truncate">
                {link.title}
              </span>
            </div>
            <form
              action={deleteExternalLink.bind(
                null,
                link.id,
                novel.id,
                novel.slug
              )}
            >
              <DeleteButton message={`Hapus?`} />
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthorSocialsPanel({ novel }: { novel: any }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
      <SectionHeading
        icon={<AtSign className="text-emerald-600" size={18} />}
        className="mb-4 pb-4 border-b border-gray-100"
      >
        Sosial Media Penulis
      </SectionHeading>
      <form
        action={addAuthorSocial.bind(null, novel.id, novel.slug)}
        className="space-y-3 mb-6"
      >
        <input
          type="text"
          name="platform"
          placeholder="Contoh: Instagram"
          required
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600"
        />
        <input
          type="url"
          name="url"
          placeholder="https://..."
          required
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-600"
        />
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm"
        >
          <Plus size={16} /> Tambah Sosmed
        </button>
      </form>
      <div className="space-y-2">
        {novel.authorSocials.map((social: any) => (
          <div
            key={social.id}
            className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100"
          >
            <div className="overflow-hidden pr-2">
              <span className="font-bold text-emerald-900 text-xs block truncate">
                {social.platform}
              </span>
            </div>
            <form
              action={deleteAuthorSocial.bind(
                null,
                social.id,
                novel.id,
                novel.slug
              )}
            >
              <DeleteButton message={`Hapus?`} />
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ManageNovelPage({
  params,
}: ManageNovelPageProps) {
  const { novel } = await getCurrentUserAndNovel(params.id);

  const recentComments = getRecentComments(novel);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 pt-28 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <BookOpen className="text-blue-600" size={32} />
            Kelola <span className="text-blue-600">Novel</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">ID: {novel.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 font-bold transition shadow-sm"
          >
            <ArrowLeft size={18} /> Kembali ke Dasbor
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <main className="lg:col-span-8 space-y-8">
          <NovelInfoForm novel={novel} />
          <ChapterManagement novelId={novel.id} chapters={novel.chapters} />
          <CommentSection comments={recentComments} novelId={novel.id} />
        </main>

        {/* Right Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <FeaturedBannerPanel novel={novel} />
          <CoverPanel novel={novel} />
          <ExternalLinksPanel novel={novel} />
          <AuthorSocialsPanel novel={novel} />
        </aside>
      </div>
    </div>
  );
}