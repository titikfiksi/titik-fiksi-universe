"use client";

import { useState } from "react";
import { Plus, X, Image as ImageIcon } from "lucide-react";

export default function MultiImageInput() {
  const [images, setImages] = useState<string[]>([""]);

  const addInput = () => setImages([...images, ""]);
  
  const removeInput = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  return (
    <div className="space-y-3 md:col-span-2 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
      <label className="block text-xs font-black text-indigo-800 uppercase tracking-widest">
        {/* PERBAIKAN: Menggunakan entitas HTML untuk karakter '>' agar tidak error di Vercel */}
        Galeri Gambar Produk (Bisa &gt; 1 Gambar)
      </label>
      
      <div className="space-y-2">
        {images.map((img, index) => (
          <div key={index} className="flex items-center gap-2 animate-fade-in-up">
            <div className="relative flex-1">
              <ImageIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-300" size={16} />
              <input 
                type="url" 
                name="imageUrl" 
                value={img}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder={`URL Gambar ke-${index + 1}`} 
                required={index === 0}
                className="w-full pl-10 pr-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow" 
              />
            </div>
            {images.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeInput(index)} 
                className="p-3 bg-white border border-red-200 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-300 transition shadow-sm flex-shrink-0"
                title="Hapus Kolom"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button 
        type="button" 
        onClick={addInput} 
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl text-xs font-bold transition mt-2"
      >
        <Plus size={14} /> Tambah Kolom Gambar
      </button>
    </div>
  );
}