import Link from 'next/link';
import { BookX, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm animate-bounce">
        <BookX size={48} />
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">404</h1>
      <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-4">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
        Maaf, lembaran cerita yang Anda cari sepertinya telah hilang tertiup angin atau memang belum pernah ditulis di semesta Titik Fiksi ini.
      </p>
      <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl hover:-translate-y-1">
        <Home size={20} /> Kembali ke Beranda
      </Link>
    </div>
  );
}