import Link from "next/link";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Globe, 
  PlusCircle,
  Users
} from "lucide-react";
import { logoutAdmin } from "@/lib/actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // PERBAIKAN: Menambahkan pt-24 agar konten tidak tertumpuk Navbar Publik yang Fixed
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pt-24">
      
      {/* SIDEBAR ADMIN (DESKTOP) */}
      <aside className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">TF</div>
          <span className="font-black tracking-wider uppercase text-sm">Admin Panel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition font-bold text-sm">
            <LayoutDashboard size={18} className="text-blue-400" /> Dashboard
          </Link>
          <Link href="/admin/novels/new" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition font-bold text-sm">
            <PlusCircle size={18} className="text-green-400" /> Tulis Novel Baru
          </Link>
          
          <Link href="/admin/authors" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition font-bold text-sm">
            <Users size={18} className="text-purple-400" /> Manajemen Penulis
          </Link>

          <Link href="/admin/settings" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition font-bold text-sm">
            <Settings size={18} className="text-gray-400" /> Pengaturan Web
          </Link>
          <div className="h-px bg-gray-800 my-4"></div>
          <Link href="/" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition font-bold text-sm">
            <Globe size={18} className="text-indigo-400" /> Lihat Website
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <form action={logoutAdmin}>
            <button className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition font-bold text-sm">
              <LogOut size={18} /> Keluar Sesi
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );

}