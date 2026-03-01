"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check, Twitter, Facebook, MessageCircle } from "lucide-react";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  // Ambil URL halaman saat ini ketika komponen dimuat
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  // Fungsi Salin Link
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Kembali normal setelah 2 detik
    } catch (err) {
      console.error("Gagal menyalin link", err);
    }
  };

  // Fungsi Bagikan Pintar (Native Web Share API)
  const handleShare = async () => {
    // Jika dibuka di HP (Android/iOS) yang mendukung fitur Share bawaan
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Baca novel keren "${title}" di Titik Fiksi Universe!`,
          url: currentUrl,
        });
      } catch (err) {
        console.log("Share dibatalkan atau error", err);
      }
    } else {
      // Jika di PC/Laptop, buka menu dropdown manual
      setIsOpen(!isOpen);
    }
  };

  // Link Sosmed Otomatis
  const waLink = `https://api.whatsapp.com/send?text=Baca novel keren ini: ${encodeURIComponent(title)} %0A%0A${encodeURIComponent(currentUrl)}`;
  const fbLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
  const twLink = `https://twitter.com/intent/tweet?text=Baca ${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold transition shadow-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg w-full md:w-auto"
      >
        <Share2 size={20} />
        Bagikan
      </button>

      {/* Dropdown Menu (Muncul di PC jika tombol diklik) */}
      {isOpen && (
        <>
          {/* Overlay transparan untuk menutup dropdown jika diklik di luar */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute top-full mt-3 right-0 md:left-0 bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 w-64 z-50 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Bagikan ke</div>
            
            <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 hover:bg-green-50 hover:text-green-600 rounded-xl transition font-medium text-gray-700">
              <MessageCircle size={18} /> WhatsApp
            </a>
            
            <a href={twLink} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 hover:bg-blue-50 hover:text-blue-400 rounded-xl transition font-medium text-gray-700">
              <Twitter size={18} /> Twitter / X
            </a>
            
            <a href={fbLink} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition font-medium text-gray-700">
              <Facebook size={18} /> Facebook
            </a>
            
            <div className="h-px bg-gray-100 my-2"></div>
            
            <button onClick={handleCopy} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition font-medium text-gray-700 w-full text-left">
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              {copied ? "Link Disalin!" : "Salin Tautan"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}