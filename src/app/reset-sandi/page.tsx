"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, AlertCircle, CheckCircle2, Loader2, KeyRound } from "lucide-react";
import { resetPassword } from "@/lib/auth-actions"; // <-- LOGIKA ASLI ANDA
import PasswordInput from "@/components/PasswordInput"; // <-- FITUR MATA

function ResetSandiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // MENGGUNAKAN STATE LOADING ASLI ANDA AGAR VISUALNYA PASTI MUNCUL
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    // 1. Validasi Kecocokan Sandi secara Real-time
    const p1 = formData.get("password") as string;
    const p2 = formData.get("confirmPassword") as string;

    if (p1 !== p2) {
      setMessage({ type: "error", text: "Kata sandi dan konfirmasi tidak cocok!" });
      return;
    }

    // 2. Logika Asli Anda (dengan trigger visual loading)
    setLoading(true);
    setMessage(null);
    
    if (token) {
      formData.append("token", token);
    }
    
    try {
      const result = await resetPassword(formData);
      
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result.success) {
        setMessage({ type: "success", text: result.success });
        // Arahkan ke halaman login setelah 3 detik
        setTimeout(() => {
          router.push("/login"); 
        }, 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan sistem." });
    } finally {
      setLoading(false); 
    }
  }

  // TAMPILAN JIKA TOKEN HILANG / TIDAK VALID
  if (!token) {
    return (
      <div className="relative z-10 w-full max-w-[420px] bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl border border-gray-100 animate-fade-in-up text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-4">Akses Ditolak</h1>
        <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed">
          Tautan pemulihan tidak valid atau hilang. Silakan buat permintaan lupa kata sandi yang baru.
        </p>
        <Link href="/lupa-sandi" className="inline-flex w-full items-center justify-center bg-[#0f172a] text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg active:scale-95">
          Kembali ke Lupa Sandi
        </Link>
      </div>
    );
  }

  // PERBAIKAN PRESISI: Mengonversi status ke boolean eksplisit untuk menghindari "unintentional comparison" di Vercel
  const isSuccess = message?.type === "success";
  const isButtonDisabled = loading || isSuccess;

  // TAMPILAN FORM NORMAL
  return (
    <div className="relative z-10 w-full max-w-[420px] bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl border border-gray-100 animate-fade-in-up">
      <div className="w-16 h-16 bg-[#e0e7ff] text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
        <KeyRound size={32} />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-3">Buat Sandi Baru</h1>
        <p className="text-sm font-medium text-gray-500 leading-relaxed">
          Silakan masukkan kata sandi baru Anda. Pastikan menggunakan kombinasi yang kuat dan mudah diingat.
        </p>
      </div>

      {/* KOTAK PESAN ERROR / SUKSES */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 animate-fade-in-up border ${isSuccess ? "bg-[#ecfdf5] border-emerald-100" : "bg-red-50 border-red-200"}`}>
          {isSuccess ? (
            <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
          ) : (
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          )}
          <div>
            <p className={`text-sm font-bold ${isSuccess ? "text-emerald-700" : "text-red-800"}`}>
              {message.text}
            </p>
            {isSuccess && (
              <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-widest animate-pulse">
                Mengarahkan ke halaman login...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sembunyikan form jika sudah sukses */}
      {!isSuccess && (
        <form action={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Kata Sandi Baru</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} />
              <PasswordInput 
                name="password" 
                placeholder="••••••••••••" 
                required 
                className="w-full pl-12 pr-12 py-4 bg-[#f1f5f9] border border-transparent rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white tracking-widest transition-all text-gray-800 font-bold" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Konfirmasi Sandi Baru</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} />
              <PasswordInput 
                name="confirmPassword" 
                placeholder="••••••••••••" 
                required 
                className="w-full pl-12 pr-12 py-4 bg-[#f1f5f9] border border-transparent rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white tracking-widest transition-all text-gray-800 font-bold" 
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isButtonDisabled}
              className="w-full bg-[#0f172a] text-white font-black py-4 rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-wait disabled:transform-none"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Simpan Kata Sandi"}
            </button>
          </div>
        </form>
      )}

      {/* TAUTAN KEMBALI */}
      {!isSuccess && (
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <Link href="/login" className="inline-flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={14} /> Kembali ke Halaman Login
          </Link>
        </div>
      )}
    </div>
  );
}

// Komponen Utama
export default function ResetSandiPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 pt-28 relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-gray-200/50 to-transparent z-0"></div>
      
      <Suspense fallback={<div className="text-gray-500 font-bold animate-pulse z-10 relative"><Loader2 className="animate-spin" /></div>}>
        <ResetSandiContent />
      </Suspense>
    </div>
  );
}