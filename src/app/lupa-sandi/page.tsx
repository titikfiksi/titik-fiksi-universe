"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { requestPasswordReset } from "@/lib/auth-actions"; // <-- MENGGUNAKAN MESIN ASLI ANDA
import SubmitButton from "@/components/SubmitButton"; // <-- TOMBOL LOADING KEMBALI!

export default function LupaSandiPage() {
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  // Fungsi yang dipanggil oleh form. Next.js otomatis memicu 'pending' untuk animasi loading
  async function clientAction(formData: FormData) {
    setMessage(null);
    
    // Menjalankan fungsi backend milik Anda
    const result = await requestPasswordReset(formData);
    
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: result.success });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 pt-28 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-gray-200/50 to-transparent z-0"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-xl relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
            <ShieldCheck size={32} />
          </div>
          
          <h1 className="text-2xl font-black text-gray-900 mb-2">Lupa Kata Sandi?</h1>
          <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed">
            Jangan panik. Masukkan alamat email yang terdaftar pada akun Anda, dan kami akan mengirimkan tautan pemulihan.
          </p>

          {/* KOTAK PESAN SUKSES / ERROR */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 animate-fade-in-up border ${message.type === "success" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
              {message.type === "success" ? (
                <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm font-bold leading-snug ${message.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Sembunyikan form jika sudah berhasil dikirim */}
          {!message || message.type === "error" ? (
            <form action={clientAction} className="space-y-5 relative z-10">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Alamat Email Terdaftar</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    placeholder="admin@titikfiksi.com"
                    className="w-full pl-11 pr-5 py-4 bg-[#f1f5f9] border border-transparent rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all font-bold text-gray-800" 
                  />
                </div>
              </div>
              
              <div className="pt-2">
                {/* TOMBOL PINTAR: Animasi loading akan otomatis berjalan saat clientAction diproses! */}
                <SubmitButton 
                  text="Kirim Tautan Pemulihan" 
                  customClass="w-full bg-[#0f172a] text-white font-black py-4 rounded-xl hover:bg-black transition-all shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2 text-sm active:scale-95" 
                />
              </div>
            </form>
          ) : null}
        </div>

        <div className="mt-8 text-center flex flex-col gap-4">
          <Link href="/admin-door" className="inline-flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}