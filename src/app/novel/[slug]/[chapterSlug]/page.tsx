import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Home, BookOpen, ExternalLink, Heart, Coffee } from "lucide-react";
import dynamic from "next/dynamic";

// ==========================================
// KARANTINA KOMPONEN BROWSER (ANTI ERROR WINDOW)
// ==========================================
const ReaderInteractive = dynamic(() => import("@/components/ReaderInteractive"), { ssr: false, loading: () => <div className="h-20 w-full bg-gray-100 animate-pulse rounded-xl mb-8"></div> });
const ReaderView = dynamic(() => import("@/components/ReaderView"), { ssr: false, loading: () => <div className="min-h-[50vh] w-full bg-gray-100 animate-pulse rounded-xl"></div> });
const ScrollToTop = dynamic(() => import("@/components/ScrollToTop"), { ssr: false });
const CommentSection = dynamic(() => import("@/components/CommentSection"), { ssr: false }); 
const RatingInput = dynamic(() => import("@/components/RatingInput"), { ssr: false });

export const revalidate = 60;

export default async function ChapterReaderPage({ params }: { params: { slug: string; chapterSlug: string } }) {
  const chapter = await db.chapter.findFirst({
    where: { slug: params.chapterSlug, novel: { slug: params.slug } },
    include: { novel: { include: { chapters: { where: { isPublished: true }, orderBy: { orderIndex: 'asc' } } } }, comments: { orderBy: { createdAt: 'desc' } } }
  });

  if (!chapter || !chapter.isPublished) return notFound();

  const donationLinks = await db.donationLink.findMany();
  const sponsors = await db.sponsor.findMany();

  const prevChapter = await db.chapter.findFirst({ where: { novelId: chapter.novelId, isPublished: true, orderIndex: chapter.orderIndex - 1 } });
  const nextChapter = await db.chapter.findFirst({ where: { novelId: chapter.novelId, isPublished: true, orderIndex: chapter.orderIndex + 1 } });
  const prevUrl = prevChapter ? `/novel/${params.slug}/${prevChapter.slug}` : null;
  const nextUrl = nextChapter ? `/novel/${params.slug}/${nextChapter.slug}` : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full overflow-x-hidden">
      <div className="sticky top-[72px] md:top-20 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/60 py-3 px-2 md:px-4 shadow-sm transition-all duration-300 w-full">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <Link href={`/novel/${params.slug}`} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700 flex-shrink-0">
            <ChevronLeft size={24} />
          </Link>
          <div className="text-center overflow-hidden flex-1 px-2 md:px-4">
            <h1 className="text-sm md:text-base font-black text-gray-900 truncate">Bab {chapter.orderIndex}: {chapter.title}</h1>
            <p className="text-[10px] md:text-xs font-bold text-gray-500 truncate">{chapter.novel.title}</p>
          </div>
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700 flex-shrink-0">
            <Home size={20} />
          </Link>
        </div>
      </div>

      <div className="pt-8 px-3 sm:px-6 container mx-auto max-w-4xl w-full">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-gray-500 mb-4 font-medium px-2">
          <Link href="/" className="hover:text-blue-600 transition">Beranda</Link>
          <ChevronRight size={12} className="sm:w-[14px] sm:h-[14px]" />
          <Link href={`/novel/${params.slug}`} className="hover:text-blue-600 transition truncate max-w-[120px] sm:max-w-[200px]">{chapter.novel.title}</Link>
          <ChevronRight size={12} className="sm:w-[14px] sm:h-[14px]" />
          <span className="text-gray-900 font-bold truncate">Bab {chapter.orderIndex}</span>
        </div>

        <div className="bg-[var(--paper-bg,white)] text-[var(--paper-text,black)] rounded-2xl md:rounded-3xl shadow-xl p-5 sm:p-6 md:p-12 transition-colors duration-500 min-h-[70vh] w-full relative">
          <ReaderInteractive novelSlug={params.slug} currentChapterSlug={params.chapterSlug} chapters={chapter.novel.chapters} prevUrl={prevUrl} nextUrl={nextUrl} />
          
          {/* PERBAIKAN: Menambahkan ID story-container untuk pengaturan spasi paragraf */}
          <div id="story-container" className="w-full max-w-full overflow-x-hidden mt-4 md:mt-0 break-words">
            <ReaderView content={chapter.content} isLocked={chapter.isLocked} payLink={chapter.payLink} chapterId={chapter.id} unlockCode={chapter.unlockCode} />
          </div>
        </div>

        {/* =========================================
            KOTAK DONASI 100% UNTUK PENULIS
        ========================================= */}
        {chapter.novel.authorDonationUrl && (
          <div className="mt-10 bg-gradient-to-r from-pink-50 to-rose-50 rounded-[2rem] p-6 md:p-8 shadow-sm border border-pink-100 w-full flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="text-lg md:text-xl font-black text-pink-900 flex items-center justify-center md:justify-start gap-2 mb-2">
                <Heart className="text-pink-500 fill-pink-500" size={24}/> Apresiasi Penulis
              </h3>
              <p className="text-sm font-medium text-pink-800 max-w-xl">
                Suka dengan bab ini? Berikan dukungan langsung kepada <strong>{chapter.novel.author || "Penulis"}</strong> agar makin semangat menulis bab selanjutnya!
              </p>
            </div>
            <a href={chapter.novel.authorDonationUrl} target="_blank" rel="noreferrer" className="flex-shrink-0 flex items-center justify-center gap-2 bg-pink-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-pink-600 transition shadow-md hover:shadow-lg transform hover:-translate-y-1 w-full md:w-auto text-sm">
              <Coffee size={18}/> Berikan Uang Tip
            </a>
          </div>
        )}

        {donationLinks.length > 0 && (
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-3xl p-6 md:p-8 text-center shadow-sm w-full">
            <Coffee size={40} className="mx-auto text-amber-600 mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Suka dengan bab ini?</h3>
            <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto leading-relaxed">Dukungan dari Anda adalah energi utama agar penulis tetap semangat.</p>
            <div className="flex flex-wrap justify-center gap-4">
              {donationLinks.map((link, idx) => (
                <Link key={link.id} href={link.url} target="_blank" className={`text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto ${idx % 2 === 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-black'}`}>
                  <Heart size={18} className={idx % 2 === 0 ? 'text-pink-300' : 'text-red-500'} /> via {link.platform}
                </Link>
              ))}
            </div>
          </div>
        )}

        {!chapter.isLocked && sponsors.length > 0 && (
          <div className="mt-8 space-y-6 w-full">
            {sponsors.map(sponsor => (
              <div key={sponsor.id} className="p-1 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md w-full">
                <div className="bg-white rounded-[22px] p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 relative">
                  <div className="absolute -top-3 -right-3 bg-yellow-400 text-black text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-sm">Sponsor</div>
                  <div className="w-full sm:w-1/3 aspect-video sm:aspect-square bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={sponsor.imageUrl} alt={sponsor.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-bold text-lg text-gray-900 mb-1">{sponsor.title}</h4>
                    {sponsor.description && <p className="text-sm text-gray-600 mb-4">{sponsor.description}</p>}
                    <Link href={sponsor.linkUrl} target="_blank" className="inline-flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition w-full sm:w-auto">Lihat Produk <ExternalLink size={14} /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-200 w-full overflow-hidden">
          <RatingInput novelId={chapter.novelId} />
          <div className="mt-8 pt-8 border-t border-gray-100">
             <CommentSection chapterId={chapter.id} comments={chapter.comments} />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 w-full">
          {prevChapter ? (
            <Link href={`/novel/${params.slug}/${prevChapter.slug}`} className="flex items-center justify-center gap-2 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 transition font-bold text-gray-700 shadow-sm text-xs sm:text-base"><ChevronLeft size={16}/> Sebelumnya</Link>
          ) : <div/>}
          {nextChapter ? (
            <Link href={`/novel/${params.slug}/${nextChapter.slug}`} className="flex items-center justify-center gap-2 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition font-bold shadow-md text-xs sm:text-base">Selanjutnya <ChevronRight size={16}/></Link>
          ) : (
            <Link href={`/novel/${params.slug}`} className="flex items-center justify-center gap-2 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 transition font-bold text-gray-700 shadow-sm text-xs sm:text-base">Selesai <BookOpen size={16}/></Link>
          )}
        </div>
      </div>
      <ScrollToTop />

      {/* STYLE KHUSUS UNTUK MERAPIKAN SPASI PARAGRAF */}
      <style dangerouslySetInnerHTML={{ __html: `
        #story-container p {
          margin-bottom: 1rem !important;
          line-height: 1.8 !important;
        }
        #story-container p:last-child {
          margin-bottom: 0 !important;
        }
        #story-container br {
          display: none !important;
        }
      `}} />
    </div>
  );
}