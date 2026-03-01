"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ExpandableSynopsis({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = text.length > 250; // Batas karakter sebelum dilipat

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold border-b border-gray-200 pb-2 text-gray-900">Sinopsis</h2>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative">
        <div className={`text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base transition-all ${!isExpanded && isLong ? 'line-clamp-6' : ''}`}>
          {text}
        </div>
        {isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-6 flex items-center justify-center gap-1 w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm rounded-xl transition-colors shadow-sm"
          >
            {isExpanded ? "Tutup Sinopsis" : "Baca Selengkapnya"} {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
        )}
      </div>
    </div>
  );
}