"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

export default function ProductSlider({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Membersihkan array jika ada link kosong
  const validImages = images.filter(img => img.trim() !== "");

  if (validImages.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400">
        <ImageIcon size={40} />
      </div>
    );
  }

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault(); 
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full aspect-square group overflow-hidden bg-gray-100 border-b border-gray-100">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {validImages.map((img, i) => (
          <img 
            key={i} 
            src={img} 
            alt={`${title} - Foto ${i + 1}`} 
            className="w-full h-full object-cover flex-shrink-0" 
          />
        ))}
      </div>

      {/* Tombol Panah Kiri Kanan & Titik Indikator (Hanya muncul jika foto > 1) */}
      {validImages.length > 1 && (
        <>
          <button 
            onClick={prevSlide} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
          >
            <ChevronLeft size={18} />
          </button>

          <button 
            onClick={nextSlide} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
            {validImages.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${i === currentIndex ? 'bg-indigo-500 w-4' : 'bg-white/70 w-1.5'}`} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}