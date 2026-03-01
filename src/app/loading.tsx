export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Lingkaran statis sebagai background */}
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          {/* Lingkaran berputar */}
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          {/* Logo inisial di tengah */}
          <span className="font-black text-blue-600 text-sm">TF</span>
        </div>
        <p className="text-sm font-bold text-gray-500 animate-pulse tracking-widest">MEMBACA MANTRA...</p>
      </div>
    </div>
  );
}