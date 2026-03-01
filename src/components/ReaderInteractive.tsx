"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, Coffee, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { useReaderStore } from "@/lib/store";

export default function ReaderInteractive({ novelSlug, currentChapterSlug, chapters = [], prevUrl, nextUrl }: any) {
  const router = useRouter();
  const { theme, fontSize, setTheme, setFontSize } = useReaderStore();

  useEffect(() => {
    if (novelSlug && currentChapterSlug) {
      localStorage.setItem(`last_read_${novelSlug}`, currentChapterSlug);
    }
  }, [novelSlug, currentChapterSlug]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.style.setProperty("--paper-bg", "#0f172a"); 
      root.style.setProperty("--paper-text", "#ffffff"); 
    } else if (theme === "sepia") {
      root.style.setProperty("--paper-bg", "#fdf6e3"); 
      root.style.setProperty("--paper-text", "#3e2723"); 
    } else {
      root.style.setProperty("--paper-bg", "#ffffff"); 
      root.style.setProperty("--paper-text", "#0f172a"); 
    }
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" && prevUrl) router.push(prevUrl);
      if (e.key === "ArrowRight" && nextUrl) router.push(nextUrl);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevUrl, nextUrl, router]);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--paper-text)]/10 pb-6 mb-8 transition-colors duration-300 relative z-10">
      
      <div className="flex items-center gap-3 justify-between md:justify-start w-full md:w-auto">
        <div className="flex items-center bg-[var(--paper-text)]/5 rounded-full px-1 py-1">
          <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="px-4 py-2 md:px-3 md:py-1 font-serif font-bold text-[var(--paper-text)] opacity-60 hover:opacity-100 transition min-w-[44px] min-h-[44px] flex items-center justify-center">T-</button>
          <span className="font-bold w-6 text-center text-[var(--paper-text)]">{fontSize}</span>
          <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="px-4 py-2 md:px-3 md:py-1 font-serif font-bold text-[var(--paper-text)] opacity-60 hover:opacity-100 transition min-w-[44px] min-h-[44px] flex items-center justify-center">T+</button>
        </div>
        
        <div className="flex items-center bg-[var(--paper-text)]/5 rounded-full px-1 py-1 gap-1">
          <button onClick={() => setTheme("light")} className={`p-2.5 md:p-1.5 rounded-full transition min-w-[44px] min-h-[44px] flex items-center justify-center ${theme === 'light' ? 'bg-white shadow text-black' : 'text-[var(--paper-text)] opacity-50 hover:opacity-100'}`}><Sun size={18}/></button>
          <button onClick={() => setTheme("sepia")} className={`p-2.5 md:p-1.5 rounded-full transition min-w-[44px] min-h-[44px] flex items-center justify-center ${theme === 'sepia' ? 'bg-[#d7ccc8] shadow text-[#451a03]' : 'text-[var(--paper-text)] opacity-50 hover:opacity-100'}`}><Coffee size={18}/></button>
          <button onClick={() => setTheme("dark")} className={`p-2.5 md:p-1.5 rounded-full transition min-w-[44px] min-h-[44px] flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700 shadow text-white' : 'text-[var(--paper-text)] opacity-50 hover:opacity-100'}`}><Moon size={18}/></button>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <button onClick={() => prevUrl && router.push(prevUrl)} disabled={!prevUrl} className={`p-3 md:p-2 bg-[var(--paper-text)]/5 rounded-xl transition flex items-center justify-center flex-shrink-0 min-h-[48px] min-w-[48px] md:min-h-[40px] md:min-w-[40px] ${prevUrl ? 'text-[var(--paper-text)] opacity-60 hover:opacity-100 cursor-pointer' : 'text-[var(--paper-text)] opacity-20 cursor-not-allowed'}`} title="Bab Sebelumnya">
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center bg-[var(--paper-text)]/5 rounded-xl px-4 py-3 md:px-3 md:py-2 w-full md:w-auto md:max-w-xs overflow-hidden min-h-[48px] md:min-h-[40px] flex-1">
          <Menu size={18} className="text-[var(--paper-text)] opacity-60 mr-3 flex-shrink-0" />
          <select className="bg-transparent text-sm md:text-base font-bold text-[var(--paper-text)] outline-none cursor-pointer w-full" value={currentChapterSlug} onChange={(e) => router.push(`/novel/${novelSlug}/${e.target.value}`)}>
            {chapters?.map((ch: any) => (
              <option key={ch.id} value={ch.slug} className="text-gray-900 bg-white">
                Bab {ch.orderIndex} - {ch.title.length > 50 ? ch.title.substring(0, 50) + '...' : ch.title}
              </option>
            ))}
          </select>
        </div>

        <button onClick={() => nextUrl && router.push(nextUrl)} disabled={!nextUrl} className={`p-3 md:p-2 bg-[var(--paper-text)]/5 rounded-xl transition flex items-center justify-center flex-shrink-0 min-h-[48px] min-w-[48px] md:min-h-[40px] md:min-w-[40px] ${nextUrl ? 'text-[var(--paper-text)] opacity-60 hover:opacity-100 cursor-pointer' : 'text-[var(--paper-text)] opacity-20 cursor-not-allowed'}`} title="Bab Selanjutnya">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}