"use client";

import { useState, useEffect, useRef } from "react";
import { addComment, deleteComment } from "@/lib/actions";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, Clock, Trash2, AlertCircle, UserCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

// Sub-komponen Tombol Submit agar bisa mendeteksi status loading (pending)
function SubmitButton({ cooldown }: { cooldown: number }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || cooldown > 0;
  
  return (
    <button 
      type="submit" 
      disabled={isDisabled}
      className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all md:w-auto w-full flex-shrink-0 ${
        isDisabled 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
      }`}
    >
      {pending ? (
        "Mengirim..."
      ) : cooldown > 0 ? (
        <><Clock size={18} className="animate-pulse"/> Tunggu {cooldown}s</>
      ) : (
        <><Send size={18} /> Kirim Komentar</>
      )}
    </button>
  );
}

export default function CommentSection({ 
  chapterId, 
  comments = [], 
  isAdmin = false 
}: { 
  chapterId: string; 
  comments: any[]; 
  isAdmin?: boolean; 
}) {
  const pathname = usePathname();
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Efek untuk memuat sisa waktu Anti-Spam dari penyimpanan lokal browser
  useEffect(() => {
    const lastCommentTime = localStorage.getItem(`last_comment_${chapterId}`);
    if (lastCommentTime) {
      const timePassed = Math.floor((Date.now() - parseInt(lastCommentTime)) / 1000);
      if (timePassed < 60) {
        setCooldown(60 - timePassed);
      }
    }
  }, [chapterId]);

  // Efek untuk menghitung mundur waktu Anti-Spam secara real-time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Validasi sebelum dikirim ke Server Action
  const handleClientValidation = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const content = formData.get("content") as string;

    if (!name.trim() || !content.trim()) {
      setError("Nama dan komentar tidak boleh dibiarkan kosong!");
      return;
    }

    if (cooldown > 0) {
      setError(`Sistem Anti-Spam aktif. Silakan tunggu ${cooldown} detik lagi.`);
      return;
    }

    setError("");
    
    // Panggil fungsi Server Action
    await addComment(chapterId, formData);
    
    // Catat waktu pengiriman untuk mengaktifkan Anti-Spam
    localStorage.setItem(`last_comment_${chapterId}`, Date.now().toString());
    setCooldown(60);
    formRef.current?.reset();
  };

  // Fungsi pengubah format tanggal menjadi "Relative Time"
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="mt-12 md:mt-16 pt-8 border-t border-gray-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <MessageCircle size={20} />
        </div>
        <h3 className="text-xl md:text-2xl font-black text-gray-900">
          Ruang Diskusi <span className="text-sm font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full ml-2">{comments.length}</span>
        </h3>
      </div>

      {/* FORMULIR KOMENTAR */}
      <form ref={formRef} action={handleClientValidation} className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm mb-10">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2 animate-fade-in-up">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        
        <input type="hidden" name="path" value={pathname} />
        
        <div className="space-y-4">
          <div className="relative">
            <UserCircle size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              name="name" 
              placeholder="Nama Anda (Boleh anonim / nama pena)" 
              maxLength={40}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold text-gray-800 transition-shadow"
            />
          </div>
          
          <textarea 
            name="content" 
            rows={4} 
            placeholder="Tulis pendapat, teori, atau dukunganmu untuk bab ini..." 
            maxLength={500}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm leading-relaxed resize-none transition-shadow"
          ></textarea>
        </div>
        
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
            <AlertCircle size={14}/> Jaga kesopanan & dilarang spoiler keras!
          </p>
          <SubmitButton cooldown={cooldown} />
        </div>
      </form>

      {/* DAFTAR KOMENTAR */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
            <MessageCircle size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-500">Belum ada jejak. Jadilah yang pertama berkomentar di bab ini!</p>
          </div>
        ) : (
          [...comments].reverse().map((comment: any) => (
            <div key={comment.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-100 transition-colors group">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center font-black text-gray-500 flex-shrink-0">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{comment.name}</h4>
                    <span className="text-[10px] md:text-xs font-bold text-gray-400 flex items-center gap-1">
                      <Clock size={12}/> {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Tombol Hapus khusus Admin */}
                {isAdmin && (
                  <form action={deleteComment.bind(null, comment.id)}>
                    <button type="submit" className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition opacity-0 group-hover:opacity-100" title="Hapus Komentar">
                      <Trash2 size={16} />
                    </button>
                  </form>
                )}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed md:pl-13 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}