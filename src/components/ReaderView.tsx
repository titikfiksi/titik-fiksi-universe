"use client";
import { Lock, Unlock, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useReaderStore } from "@/lib/store";

export default function ReaderView({ content, isLocked, payLink, chapterId, unlockCode }: { content: string, isLocked: boolean, payLink: string | null, chapterId?: string, unlockCode?: string | null }) {
  const [unlocked, setUnlocked] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState(false);
  const { fontSize } = useReaderStore();

  useEffect(() => {
    if (!chapterId && !unlockCode) return;
    const unlockedById = chapterId ? localStorage.getItem(`unlocked_${chapterId}`) : null;
    const unlockedByCode = unlockCode ? localStorage.getItem(`unlocked_code_${unlockCode}`) : null;
    
    if (unlockedById || unlockedByCode) {
      setUnlocked(true);
    }
  }, [chapterId, unlockCode]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockCode && inputCode.trim() === unlockCode) {
      setUnlocked(true);
      setError(false);
      localStorage.setItem(`unlocked_code_${unlockCode}`, "true");
      if (chapterId) localStorage.setItem(`unlocked_${chapterId}`, "true");
    } else {
      setError(true);
      // Reset input jika salah
      setInputCode("");
    }
  };

  const effectivelyLocked = isLocked && !unlocked;
  const safeContent = content || "";
  // Ambil hanya sedikit teks untuk ditampilkan di belakang buram
  const displayContent = effectivelyLocked ? safeContent.substring(0, 300) + '...' : safeContent;

  return (
    // SOLUSI INDUK: Jika dikunci, beri min-h-800px secara paksa agar kertas tidak kependekan
    // relative isolate agar gembok tidak keluar jalur
    <div className={`relative isolate w-full ${effectivelyLocked ? 'min-h-[800px]' : ''}`}>
      
      {/* KONTEN TEKS BAB */}
      <div 
        id="reader-content"
        className={`prose max-w-none whitespace-pre-wrap break-words transition-all duration-300 ease-in-out leading-relaxed md:leading-loose font-medium ${effectivelyLocked ? 'select-none blur-[6px] opacity-20 pointer-events-none' : ''}`} 
        style={{ fontSize: `${fontSize}px`, color: 'var(--paper-text)' }}
        dangerouslySetInnerHTML={{ __html: displayContent }} 
      />

      {/* OVERLAY & KOTAK GEMBOK "BAB EKSKLUSIF" */}
      {effectivelyLocked && (
        // flex-col justify-start pt-10 agar menempel atas dan turun sedikit, 
        // tidak lagi di tengah agar aman untuk konten pendek
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-10 p-4 z-20">
          
          {/* Efek Buram Tambahan di Area Gembok */}
          <div className="absolute inset-0 bg-[var(--paper-bg)]/60 backdrop-blur-[2px] -z-10 rounded-2xl"></div>

          {/* KOTAK HITAM UTAMA - Sekarang DIJAMIN UTUH Sempurna */}
          <div className="w-full max-w-xl p-8 md:p-10 bg-gradient-to-br from-gray-950 via-gray-900 to-black rounded-[2rem] border-2 border-amber-900/30 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] relative animate-fade-in-up">
             
             {/* Efek Cahaya di Belakang Ikon */}
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -z-0"></div>

             <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative border border-amber-500/20 shadow-inner z-10">
                <Lock size={32} className="text-amber-500" />
                <div className="absolute inset-0 border border-amber-500 rounded-full animate-ping opacity-20"></div>
             </div>
             
             <h3 className="text-xl md:text-2xl font-black text-white mb-2 relative z-10 uppercase tracking-wide">Bab Eksklusif</h3>
             <p className="text-gray-300 text-sm md:text-base mb-8 leading-relaxed max-w-md mx-auto relative z-10">
               Dukung penulis melalui tautan donasi di bawah untuk mendapatkan <b>Kode Akses</b> khusus dan membuka lembaran cerita berharga ini.
             </p>
             
             {payLink ? (
               <a href={payLink} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-gray-950 px-8 py-4 rounded-xl font-black hover:scale-105 transition shadow-[0_8px_20px_-5px_rgba(245,158,11,0.5)] mb-6 w-full text-base">
                 <Zap size={20} className="text-gray-900" /> Donasi & Dapatkan Kode
               </a>
             ) : (
               <button disabled className="relative z-10 bg-gray-800 text-gray-500 px-8 py-4 rounded-xl font-bold mb-6 w-full cursor-not-allowed">
                 Link Belum Tersedia
               </button>
             )}

             {unlockCode && (
               <div className="relative z-10 bg-white/5 p-1 rounded-2xl border border-white/10 hover:border-amber-500/30 transition shadow-inner">
                  <form onSubmit={handleUnlock} className="flex gap-2">
                    <input 
                      type="text" 
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Masukkan Kode Buka Kunci..." 
                      className={`flex-1 w-full min-w-0 p-3 bg-transparent outline-none font-black text-white text-center uppercase tracking-widest text-lg placeholder:text-gray-600 placeholder:font-bold placeholder:tracking-normal placeholder:text-sm ${error ? 'text-red-400 placeholder:text-red-900' : ''}`}
                    />
                    <button type="submit" className="bg-amber-500 text-gray-950 font-black px-5 rounded-xl hover:bg-white transition flex items-center justify-center gap-2 whitespace-nowrap text-sm">
                      Buka <Unlock size={16}/>
                    </button>
                  </form>
               </div>
             )}
             
             {error && <p className="text-xs text-red-400 font-bold mt-4 animate-bounce relative z-10">Kode yang Anda masukkan salah, silakan coba lagi.</p>}
          </div>

          {/* Area Kosong di Bawah Gembok agar kertas tetap terasa panjang */}
          <div className="h-40 w-full"></div>
        </div>
      )}
    </div>
  );
}