"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { addRating } from "@/lib/actions";

export default function RatingInput({ novelId }: { novelId: string }) {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (selected === 0) return;
    await addRating(novelId, formData);
    setSubmitted(true);
  }

  if (submitted) {
    return <div className="text-green-600 font-bold text-center p-4 bg-green-50 rounded-lg">Terima kasih atas penilaian Anda! ⭐</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 text-center shadow-sm">
      <h3 className="font-bold text-gray-700 mb-3">Suka novel ini? Beri Rating!</h3>
      
      <form action={handleSubmit} className="flex flex-col items-center gap-4">
        <input type="hidden" name="value" value={selected} />
        <input type="hidden" name="path" value={window.location.pathname} />
        
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="transition-transform hover:scale-110"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setSelected(star)}
            >
              <Star 
                size={32} 
                fill={star <= (hover || selected) ? "#F59E0B" : "transparent"} 
                className={star <= (hover || selected) ? "text-yellow-500" : "text-gray-300"}
              />
            </button>
          ))}
        </div>

        <button 
          disabled={selected === 0}
          className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition"
        >
          Kirim Rating
        </button>
      </form>
    </div>
  );
}