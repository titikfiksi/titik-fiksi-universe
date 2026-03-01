"use client";
import { useState } from "react";
import { Youtube, X } from "lucide-react";

export default function TrailerModal({ youtubeId }: { youtubeId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-red-700 transition shadow-md w-full md:w-auto text-sm hover:-translate-y-1"
      >
        <Youtube size={20} /> Tonton Trailer
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="bg-gray-900 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative border border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
              <h3 className="text-white font-bold flex items-center gap-2"><Youtube className="text-red-500"/> Trailer Resmi</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-white transition p-1.5 bg-gray-800 rounded-lg hover:bg-red-600"
              >
                <X size={20}/>
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe 
                className="w-full h-full" 
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} 
                title="Trailer" 
                frameBorder="0" 
                allowFullScreen>
              </iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}