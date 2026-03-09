import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Book, FileText, Eye, MessageSquare, Plus, Settings, Edit } from "lucide-react";
import { deleteNovel, deleteComment } from "@/lib/actions";
import DeleteButton from "@/components/DeleteButton";
import type { FC, ReactNode } from "react";

// Data types

type Novel = {
  id: string;
  title: string;
  coverImage: string | null;
  views: number;
  status: "Ongoing" | "Completed" | string;
  slug: string;
  _count: {
    chapters: number;
  };
};

type RecentComment = {
  id: string;
  name: string;
  content: string;
  chapter: {
    orderIndex: number;
  };
};

export const dynamic = "force-dynamic";

// Dashboard data loader
const fetchDashboardData = async () => {
  try {
    const [
      totalNovels,
      totalChapters,
      totalComments,
      novelViews,
      novels,
      recentComments,
    ] = await Promise.all([
      db.novel.count(),
      db.chapter.count(),
      db.comment.count(),
      db.novel.aggregate({ _sum: { views: true } }),
      db.novel.findMany({
        select: {
          id: true,
          title: true,
          coverImage: true,
          views: true,
          status: true,
          slug: true,
          _count: { select: { chapters: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      db.comment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          content: true,
          chapter: { select: { orderIndex: true } },
        },
      }),
    ]);

    return {
      totalNovels,
      totalChapters,
      totalComments,
      totalViews: novelViews._sum?.views || 0,
      novels,
      recentComments,
    };
  } catch (err) {
    console.error("Failed to load Admin Dashboard:", err);
    return {
      totalNovels: 0,
      totalChapters: 0,
      totalComments: 0,
      totalViews: 0,
      novels: [],
      recentComments: [],
    };
  }
};

// Stat Card component
const StatCard: FC<{
  icon: ReactNode;
  label: string;
  color: "blue" | "indigo" | "emerald" | "amber";
  value: number;
}> = ({ icon, label, color, value }) => {
  const colorMap: Record<typeof color, string> = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-center gap-2">
      <div className={`w-12 h-12 ${colorMap[color]} rounded-xl flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</span>
      <span className="text-3xl font-black text-gray-900">{value}</span>
    </div>
  );
};

// Novel Card component
const NovelCard: FC<{ novel: Novel }> = ({ novel }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-blue-200 transition">
    <div className="flex items-center gap-4">
      <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
        {novel.coverImage ? (
          <Image src={novel.coverImage} alt="cover" fill className="object-cover" sizes="48px" />
        ) : (
          <Book size={20} className="m-auto h-full text-gray-400 absolute inset-0" />
        )}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition truncate max-w-[200px] md:max-w-xs">
          {novel.title}
        </h3>
        <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mt-1">
          <span className="bg-gray-100 px-2 py-0.5 rounded-md">
            {novel._count.chapters} Bab
          </span>
          <span className="flex items-center gap-1">
            <Eye size={12} /> {novel.views}
          </span>
          <span className={novel.status === "Ongoing" ? "text-green-600" : "text-amber-600"}>
            {novel.status}
          </span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2 border-t border-gray-100 sm:border-none pt-3 sm:pt-0">
      <Link
        href={`/admin/novels/${novel.id}`}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition text-sm"
      >
        Kelola <Edit size={14} />
      </Link>
      <form action={deleteNovel.bind(null, novel.id)}>
        <DeleteButton message={`Hapus novel "${novel.title}" secara permanen?`} />
      </form>
    </div>
  </div>
);

// Comment Card component
const CommentCard: FC<{ comment: RecentComment }> = ({ comment }) => (
  <div className="p-5 hover:bg-gray-50 transition group">
    <div className="flex items-start justify-between gap-2 mb-2">
      <div>
        <span className="font-bold text-gray-900 text-sm block">{comment.name}</span>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
          Bab {comment.chapter.orderIndex}
        </span>
      </div>
      <form action={deleteComment.bind(null, comment.id)}>
        <DeleteButton message="Hapus komentar ini?" />
      </form>
    </div>
    <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 bg-white p-2 rounded-lg border border-gray-100">
      {comment.content}
    </p>
  </div>
);

// Admin Dashboard Page
const AdminDashboard: FC = async () => {
  const {
    totalNovels,
    totalChapters,
    totalComments,
    totalViews,
    novels,
    recentComments,
  } = await fetchDashboardData();

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* HEADER */}
      <section
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm"
        aria-label="header"
      >
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dasbor Utama</h1>
          <p className="text-gray-500 font-medium mt-1">Selamat datang kembali, Master!</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings"
            className="p-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition shadow-sm"
            aria-label="Buka pengaturan"
          >
            <Settings size={20} />
          </Link>
          <Link
            href="/admin/novels/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
            aria-label="Tambah Novel Baru"
          >
            <Plus size={20} /> Tambah Novel
          </Link>
        </div>
      </section>

      {/* STATISTIK */}
      <section
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        aria-label="Statistik Dashboard"
      >
        <StatCard icon={<Book size={24} />} label="Total Novel" color="blue" value={totalNovels} />
        <StatCard
          icon={<FileText size={24} />}
          label="Total Bab Dirilis"
          color="indigo"
          value={totalChapters}
        />
        <StatCard
          icon={<Eye size={24} />}
          label="Total Dibaca"
          color="emerald"
          value={totalViews}
        />
        <StatCard
          icon={<MessageSquare size={24} />}
          label="Total Komentar"
          color="amber"
          value={totalComments}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* DAFTAR NOVEL */}
        <section className="lg:col-span-2 space-y-6" aria-label="Daftar Novel">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Book size={20} className="text-blue-600" /> Karya Anda
          </h2>
          {novels.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-gray-300 text-gray-500 font-medium">
              Belum ada novel yang dibuat atau gagal dimuat.
            </div>
          ) : (
            <div className="space-y-4">
              {novels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          )}
        </section>

        {/* MODERASI KOMENTAR */}
        <section className="lg:col-span-1 space-y-6" aria-label="Moderasi Komentar">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <MessageSquare size={20} className="text-amber-500" /> Komentar Terbaru
          </h2>
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            {recentComments.length === 0 ? (
              <div className="p-10 text-center text-gray-400 font-medium text-sm">
                Belum ada diskusi pembaca.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto custom-scrollbar">
                {recentComments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;