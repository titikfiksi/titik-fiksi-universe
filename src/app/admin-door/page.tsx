"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { loginAdmin } from "@/lib/actions";
import { ShieldCheck, Mail, Lock, ShieldAlert } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import SubmitButton from "@/components/SubmitButton";

export default function AdminDoorPage() {
  // Sensor untuk menangkap pesan error "Sisa percobaan" dari actions.ts
  const [state, formAction] = useFormState(loginAdmin, null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 pt-28 relative overflow-hidden">
       <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-gray-200/50 to-transparent z-0"></div>

       <div className="relative z-10 w-full max-w-[420px] bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl border border-gray-100 mt-12 animate-fade-in-up">
         
         {/* IKON SHIELD MENGAMBANG SEPERTI DESAIN ASLI */}
         <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-[#0f172a] text-white rounded-[1.5rem] flex items-center justify-center shadow-xl border-[6px] border-white">
           <ShieldCheck size={40} />
         </div>

         <div className="text-center mt-8 mb-8">
           <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Pusat Komando</h1>
           <p className="text-sm font-medium text-gray-500">Akses eksklusif Master Admin.</p>
         </div>

         {/* KOTAK ERROR JIKA KATA SANDI SALAH / DIBLOKIR */}
         {state?.error && (
           <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3 animate-fade-in-up">
             <ShieldAlert className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
             <div>
               <h3 className="text-sm font-black text-red-800">Akses Ditolak</h3>
               <p className="text-xs text-red-600 font-bold mt-1 leading-snug">{state.error}</p>
             </div>
           </div>
         )}

         <form action={formAction} className="space-y-6">
           <div className="space-y-2">
             <label className="text-xs font-black text-gray-500 uppercase tracking-widest block">Email Admin</label>
             <div className="relative">
               <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
               <input 
                 type="email" 
                 name="email" 
                 required 
                 placeholder="admin@contoh.com" 
                 className="w-full pl-12 pr-4 py-4 bg-[#f1f5f9] border border-transparent rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-bold transition-all text-gray-800" 
               />
             </div>
           </div>

           <div className="space-y-2">
             <div className="flex items-center justify-between">
               <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Kata Sandi</label>
               <Link href="/lupa-sandi" className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                 Lupa Sandi?
               </Link>
             </div>
             
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

           <div className="pt-4">
             <SubmitButton 
                text="Buka Akses" 
                customClass="w-full bg-[#0f172a] text-white font-black py-4 rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 text-base active:scale-95" 
             />
           </div>
         </form>

         <div className="mt-8 text-center">
           <Link href="/" className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">
             Kembali ke Beranda
           </Link>
         </div>
       </div>
    </div>
  )
}