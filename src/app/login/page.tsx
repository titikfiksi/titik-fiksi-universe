"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { loginAuthor } from "@/lib/actions";
import SubmitButton from "@/components/SubmitButton";
import PasswordInput from "@/components/PasswordInput";
import { ArrowLeft, LogIn, Mail, Lock, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  // Sensor untuk menangkap pesan error (sisa percobaan / blokir) dari actions.ts
  const [state, formAction] = useFormState(loginAuthor, null);

  return (
    // Ditambahkan pt-28 agar tidak tertutup header navigasi yang fixed
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 pt-28">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-blue-600 transition">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>

        <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-xl relative overflow-hidden animate-fade-in-up">
          {/* Efek Cahaya Biru di Pojok Kanan Atas */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full pointer-events-none"></div>

          {/* Ikon Utama */}
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
            <LogIn size={32} />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">Selamat Datang Kembali</h1>
          <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed">
            Masuk ke Ruang Penulis untuk mengelola karya, bab baru, dan donasi Anda.
          </p>

          {/* KOTAK PESAN ERROR (Sisa Percobaan / Terblokir) */}
          {state?.error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3 animate-fade-in-up">
              <ShieldAlert className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-black text-red-800">Akses Ditolak</h3>
                <p className="text-xs text-red-600 font-bold mt-1 leading-snug">{state.error}</p>
              </div>
            </div>
          )}

          <form action={formAction} className="space-y-5 relative z-10">
            {/* INPUT EMAIL */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Penulis</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="Email terdaftar" 
                  className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition font-medium text-gray-800" 
                />
              </div>
            </div>
            
            {/* INPUT KATA SANDI (DENGAN MATA) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Kata Sandi</label>
                <Link href="/lupa-sandi" className="text-xs font-bold text-blue-600 hover:underline">Lupa Sandi?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 z-10">
                  <Lock size={18} />
                </div>
                
                {/* Komponen Mata Sandi (PasswordInput) */}
                <PasswordInput 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  className="w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition font-medium text-gray-800 tracking-widest" 
                />
              </div>
            </div>

            {/* TOMBOL SUBMIT (Menggunakan komponen pintar yang otomatis berputar saat loading) */}
            <SubmitButton 
              text="Masuk Ruang Penulis" 
              customClass="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 mt-2 active:scale-95" 
            />
          </form>

          {/* TAUTAN DAFTAR */}
          <div className="mt-8 text-center text-sm font-medium text-gray-500 relative z-10">
            Belum punya akun? <Link href="/kirim-karya" className="text-blue-600 font-bold hover:underline">Daftar di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}