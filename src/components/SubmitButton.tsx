"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  text: string;
  icon?: React.ReactNode;
  customClass?: string;
}

export default function SubmitButton({ text, icon, customClass }: SubmitButtonProps) {
  // Sensor ini akan otomatis mendeteksi apakah form sedang memproses data
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending} 
      className={`${customClass} ${pending ? 'opacity-80 cursor-wait pointer-events-none scale-95' : ''}`}
    >
      {/* Jika loading, tampilkan spinner. Jika tidak, tampilkan ikon bawaan */}
      {pending ? <Loader2 size={18} className="animate-spin text-current" /> : icon}
      <span>{pending ? 'Memproses...' : text}</span>
    </button>
  );
}