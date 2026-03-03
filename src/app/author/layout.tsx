import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, LogOut, Settings, HelpCircle, Globe } from "lucide-react";
import { logout } from "@/lib/actions"; 

// ======================================================================
// PERBAIKAN TAHAP 1: KEAMANAN JWT (Tanpa Fallback Hardcoded)
// ======================================================================
const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error("JWT_SECRET tidak ditemukan di environment variables!");
}
const JWT_SECRET = new TextEncoder().encode(secretKey);

export default async function AuthorLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get("admin_session")?.value;
  if (!token) redirect("/login");

  let payload;
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    payload = verified.payload;
    // Cegah Admin biasa nyasar ke sini
    if (payload.role !== "AUTHOR") redirect("/admin");
  } catch (e) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER KHUSUS PENULIS (SUPER RAPI & PROFESIONAL) */}
      <header className="bg-white border-b border-gray-200 fixed top-0 w-full z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/author" className="flex items-center gap-2 text-indigo-600 font-black text-xl hover:opacity-80 transition">
            <BookOpen size={24} /> TF <span className="text-gray-800">Author</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" target="_blank" className="hidden md:flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-indigo-600 px-2 transition">
              <Globe size={14} /> Lihat Web Publik
            </Link>
            
            <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>
            
            <Link href="/author/guide" className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-xl text-xs font-bold transition">
              <HelpCircle size={14} /> <span className="hidden sm:block">Panduan</span>
            </Link>

            <Link href="/author/settings" className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-2 rounded-xl text-xs font-bold transition">
              <Settings size={14} /> <span className="hidden sm:block">Pengaturan</span>
            </Link>

            {/* PERBAIKAN: Memanggil fungsi logout */}
            <form action={logout}>
              <button type="submit" className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-xl text-xs font-bold transition">
                <LogOut size={14} /> <span className="hidden sm:block">Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="pt-24 px-4 pb-20 container mx-auto">
        {children}
      </main>
    </div>
  );

}