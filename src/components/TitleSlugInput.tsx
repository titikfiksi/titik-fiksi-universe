"use client";

import { useState, useEffect } from "react";

interface TitleSlugProps {
  defaultTitle?: string;
  defaultSlug?: string;
  titleLabel?: string;
  titlePlaceholder?: string;
  slugLabel?: string;
}

export default function TitleSlugInput({
  defaultTitle = "",
  defaultSlug = "",
  titleLabel = "Judul",
  titlePlaceholder = "Masukkan Judul...",
  slugLabel = "Slug URL"
}: TitleSlugProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [slug, setSlug] = useState(defaultSlug);

  // Efek samping: Jika defaultTitle berubah (misal data baru dimuat), update state
  useEffect(() => {
    setTitle(defaultTitle);
    setSlug(defaultSlug);
  }, [defaultTitle, defaultSlug]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Generator Slug Otomatis (Hanya huruf kecil, angka, dan strip)
    const generatedSlug = newTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter aneh
      .replace(/\s+/g, '-')         // Spasi jadi strip
      .replace(/-+/g, '-');         // Hapus strip berlebih
      
    setSlug(generatedSlug);
  };

  return (
    <>
      <div className="md:col-span-2">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">{titleLabel}</label>
        <input 
          type="text" 
          name="title" 
          required 
          value={title}
          onChange={handleTitleChange}
          placeholder={titlePlaceholder} 
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-800 focus:ring-2 focus:ring-blue-600 transition" 
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">{slugLabel}</label>
        <input 
          type="text" 
          name="slug" 
          required 
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="otomatis-terisi" 
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono text-sm text-gray-600 focus:ring-2 focus:ring-blue-600 transition" 
        />
        <p className="text-[10px] text-gray-400 mt-1 font-medium">Link ini akan dibuat otomatis dari judul.</p>
      </div>
    </>
  );
}