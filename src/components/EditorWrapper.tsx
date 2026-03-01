"use client";

import { useState, useEffect, ComponentProps } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";

// PERBAIKAN: Menentukan tipe data eksplisit agar TypeScript mengenali properti ReactQuill
const ReactQuill = dynamic(async () => {
  const { default: RQ } = await import("react-quill");
  return ({ ...props }: ComponentProps<typeof RQ>) => <RQ {...props} />;
}, { 
  ssr: false, 
  loading: () => <div className="h-[400px] w-full bg-gray-50 animate-pulse rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 font-bold">Memuat Editor Teks...</div> 
});

export default function EditorWrapper({ defaultValue = "", chapterId = "new" }: { defaultValue?: string, chapterId?: string }) {
  const [content, setContent] = useState(defaultValue);
  const [saveStatus, setSaveStatus] = useState("Siap digunakan");
  
  // Kunci unik agar draft bab yang satu tidak menimpa bab yang lain
  const draftKey = `tf_draft_${chapterId}`;

  // 1. Fitur Pemulihan: Muat draft saat halaman pertama kali dibuka
  useEffect(() => {
    if (defaultValue === "") { // Hanya memulihkan jika ini adalah bab baru (bukan saat sedang mengedit bab lama)
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        setContent(savedDraft);
        setSaveStatus("Draft Dipulihkan!");
      }
    }
  }, [defaultValue, draftKey]);

  // 2. Fitur Penyimpanan Otomatis: Menyimpan setiap kali ada ketikan
  useEffect(() => {
    const timer = setTimeout(() => {
      // Hanya simpan jika ada isi dan berbeda dari teks bawaan
      if (content !== defaultValue && content !== "") {
        localStorage.setItem(draftKey, content);
        setSaveStatus("Tersimpan Otomatis");
      }
    }, 1500); // Sistem akan menyimpan 1.5 detik setelah penulis berhenti mengetik

    return () => clearTimeout(timer);
  }, [content, defaultValue, draftKey]);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote'],
      ['clean']
    ],
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent transition-all relative">
      
      {/* INDIKATOR AUTO-SAVE (MUNCUL DI POJOK KANAN ATAS EDITOR) */}
      <div className="absolute top-2.5 right-4 z-10 flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100 transition-all">
         {saveStatus === "Tersimpan Otomatis" || saveStatus === "Draft Dipulihkan!" ? (
           <CheckCircle2 size={12} className="text-emerald-500" />
         ) : saveStatus === "Mengetik..." ? (
           <Loader2 size={12} className="animate-spin text-indigo-500" />
         ) : (
           <RefreshCw size={12} className="text-indigo-400" />
         )}
         {saveStatus}
      </div>

      <input type="hidden" name="content" value={content} />
      
      <div className="editor-container pt-1">
        <ReactQuill 
          theme="snow" 
          value={content} 
          onChange={(val: string) => {
             setContent(val);
             if(val !== content) setSaveStatus("Mengetik...");
          }} 
          modules={modules}
          className="h-[400px] pb-10 custom-quill"
          placeholder="Tuliskan kisah menakjubkanmu di sini..."
        />
      </div>

      {/* Mempercantik tampilan Quill bawaan */}
      <style jsx global>{`
        .custom-quill .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          background-color: #f9fafb;
          border-radius: 0.75rem 0.75rem 0 0;
          padding: 12px !important;
          padding-right: 170px !important; /* Ruang agar teks tidak tertutup tombol indikator save */
        }
        .custom-quill .ql-container { border: none !important; font-family: inherit; font-size: 1rem; }
        .custom-quill .ql-editor { padding: 1.5rem; line-height: 1.8; color: #1f2937; }
        .custom-quill .ql-editor.ql-blank::before { font-style: normal; color: #9ca3af; font-weight: 500; }
      `}</style>
    </div>
  );
}