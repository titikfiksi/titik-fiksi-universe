"use client";

import { useFormStatus } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteButton({ message = "Hapus item ini?" }: { message?: string }) {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) {
          e.preventDefault();
        }
      }}
      className={`p-2 text-red-500 hover:bg-red-50 rounded-lg transition ${pending ? 'opacity-50 cursor-not-allowed' : ''}`}
      title="Hapus"
    >
      {pending ? <Loader2 size={18} className="animate-spin text-red-500" /> : <Trash2 size={18} />}
    </button>
  );
}