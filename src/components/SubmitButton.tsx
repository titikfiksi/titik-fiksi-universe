"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  text: string;
  icon?: React.ReactNode;
  customClass?: string;
  isEdit?: boolean; // Untuk kompabilitas dengan kode Anda sebelumnya
}

export default function SubmitButton({ text, icon, customClass, isEdit }: SubmitButtonProps) {
  // Hook ini mendeteksi apakah form sedang memproses data ke server
  const { pending } = useFormStatus();

  // Jika tidak ada customClass yang dikirim, gunakan style bawaan ini
  const defaultClass = "bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-md";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${customClass || defaultClass} ${pending ? "opacity-70 cursor-not-allowed" : "active:scale-95"}`}
    >
      {pending ? <Loader2 className="animate-spin" size={16} /> : icon}
      {pending ? "Menyimpan..." : text}
    </button>
  );
}