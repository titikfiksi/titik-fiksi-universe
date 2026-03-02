import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, BookOpen, Link as LinkIcon, Layout, Lock, AtSign, Heart, MessageSquare, Reply } from "lucide-react";
import { deleteChapterByAuthor, addExternalLinkByAuthor, deleteExternalLinkByAuthor, addAuthorSocialByAuthor, deleteAuthorSocialByAuthor, replyCommentByAuthor } from "@/lib/actions";
import DeleteButton from "@/components/DeleteButton";

// ======================================================================
// PERBAIKAN TAHAP 1: KEAMANAN JWT (Tanpa Fallback Hardcoded)
// ======================================================================
const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error("JWT_SECRET tidak ditemukan di environment variables!");
}
const JWT_SECRET = new TextEncoder().encode(secretKey);

export const dynamic = "force-dynamic";

export default async function AuthorManageNovelPage({ params }: { params: { slug: string } }) {
  const token = cookies().get("admin_session")?.value;
  if (!token) redirect("/login");
  
  let userId = "";
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    userId = verified.payload.userId as string;
  } catch (e) {
    redirect("/login");
  }

  const novel = await db.novel.findUnique({
    where: { slug: params.slug },
    include: { 
      chapters: { 
        orderBy: { orderIndex: 'desc' },
        include: { comments: { orderBy: { createdAt: "desc" } } } 
      }, 
      externalLinks: true, 
      authorSocials: true 
    }
  });

  if (!novel || novel.userId !== userId) return notFound();

  const allComments = novel.chapters.flatMap(ch => 
    ch.comments.map(c => ({ ...c, chapterTitle: ch.title, chapterIndex: ch.orderIndex, chapterId: ch.id }))
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 15);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3"><BookOpen className="text-indigo-600" size={32}/> Ruang <span className="text-indigo-600">Karya</span></h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Novel: {novel.title}</p>
        </div>
        <Link href="/author" className="inline-flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 font-bold transition shadow-sm"><ArrowLeft size={18} /> Beranda</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-gray-100 pb-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><Layout size={18}/> Kelola Bab Cerita</h2>
              <Link href={`/author/novel/${novel.slug}/new`} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-md">
                <Plus size={16} /> Tulis Bab Baru
              </Link>
            </div>
            {novel.chapters.length === 0 ? (
              <p className="text-center py-10 text-gray-500 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">Belum ada bab yang ditulis. Ayo mulai berkarya!</p>
            ) : (
              <div className="space-y-3">
                {novel.chapters.map(chapter => (
                  <div key={chapter.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-indigo-200 transition">
                    <div className="flex items-center gap-4 overflow-hidden pr-4">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-black flex-shrink-0 text-sm">{chapter.orderIndex}</div>
                      <div className="truncate">
                        <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition">{chapter.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] font-bold text-gray-400">
                          {chapter.isPublished ? <span className="text-emerald-500">Telah Tayang</span> : <span className="text-amber-500">Jadwal / Draf</span>}
                          {chapter.isLocked && <span className="flex items-center gap-1 text-amber-500"><Lock size={10}/> Eksklusif (Premium)</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={`/author/novel/${novel.slug}/edit/${chapter.id}`} className="p-2.5 bg-white border border-gray-200 text-amber-500 hover:bg-amber-50 rounded-xl transition shadow-sm"><Edit size={14} /></Link>
                      <form action={deleteChapterByAuthor.bind(null, chapter.id, novel.id, novel.slug)}><DeleteButton message={`Hapus Bab ${chapter.orderIndex} permanen?`}/></form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-2"><MessageSquare className="text-pink-500" size={24}/> Sapaan Pembaca</h2>
            </div>
            
            {allComments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8 font-medium">Belum ada komentar dari pembaca.</p>
            ) : (
              <div className="space-y-4">
                {allComments.map(comment => (
                  <div key={comment.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{comment.name}</h4>
                        <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">di Bab {comment.chapterIndex}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold">{comment.createdAt.toLocaleDateString("id-ID")}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed italic">"{comment.content}"</p>
                    
                    <details className="mt-4 group/reply">
                      <summary className="text-xs font-bold text-indigo-600 cursor-pointer list-none flex items-center gap-1 hover:text-indigo-700 w-fit select-none [&::-webkit-details-marker]:hidden">
                        <Reply size={14}/> Balas Pembaca Ini
                      </summary>
                      <form action={replyCommentByAuthor.bind(null, comment.chapterId, novel.slug)} className="mt-3 flex gap-2 items-center">
                        <input type="hidden" name="replyTo" value={comment.name} />
                        <input type="text" name="content" placeholder={`Sapa @${comment.name} sebagai Penulis...`} required className="flex-1 p-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 transition" />
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm">
                          Kirim Balasan
                        </button>
                      </form>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
             <div className="absolute -right-4 -top-4 opacity-5"><Heart size={100} /></div>
             <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2 relative z-10"><Heart className="text-pink-500" size={18}/> Donasi Utama Cerita</h2>
             <p className="text-xs text-gray-500 mb-4 relative z-10">Link Trakteer/Saweria ini akan muncul di luar bab premium agar pembaca bisa memberi tip sukarela.</p>
             <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl relative z-10">
               {novel.authorDonationUrl ? (
                 <a href={novel.authorDonationUrl} target="_blank" className="text-sm font-bold text-pink-700 break-all hover:underline">{novel.authorDonationUrl}</a>
               ) : (
                 <p className="text-xs font-bold text-pink-400">Belum ada link donasi diatur.</p>
               )}
             </div>
             <p className="text-[10px] font-bold text-gray-400 mt-3 text-center">*Ubah link donasi utama melalui menu Edit Novel</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
             <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 pb-4 border-b border-gray-100"><LinkIcon className="text-blue-600" size={18}/> Promosi Platform Lain</h2>
             <form action={addExternalLinkByAuthor.bind(null, novel.id, novel.slug)} className="space-y-3 mb-6">
                  <input type="text" name="title" placeholder="Contoh: Baca juga di KBM" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600" />
                  <input type="url" name="url" placeholder="https://..." required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600" />
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm">
                    <Plus size={16}/> Tambah Link
                  </button>
              </form>
              <div className="space-y-2">
                 {novel.externalLinks.map(link => (
                    <div key={link.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                       <div className="overflow-hidden pr-2"><span className="font-bold text-blue-900 text-xs block truncate">{link.title}</span></div>
                       <form action={deleteExternalLinkByAuthor.bind(null, link.id, novel.id, novel.slug)}><DeleteButton message={`Hapus?`}/></form>
                    </div>
                 ))}
              </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
             <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 pb-4 border-b border-gray-100"><AtSign className="text-emerald-600" size={18}/> Hubungkan Sosial Media</h2>
             <form action={addAuthorSocialByAuthor.bind(null, novel.id, novel.slug)} className="space-y-3 mb-6">
                  <input type="text" name="platform" placeholder="Contoh: Instagram / TikTok" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600" />
                  <input type="url" name="url" placeholder="https://..." required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-600" />
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm">
                    <Plus size={16}/> Tambah Sosmed
                  </button>
              </form>
              <div className="space-y-2">
                 {novel.authorSocials.map(social => (
                    <div key={social.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                       <div className="overflow-hidden pr-2"><span className="font-bold text-emerald-900 text-xs block truncate">{social.platform}</span></div>
                       <form action={deleteAuthorSocialByAuthor.bind(null, social.id, novel.id, novel.slug)}><DeleteButton message={`Hapus?`}/></form>
                    </div>
                 ))}
              </div>
          </div>

        </div>
      </div>
    </div>
  );
}