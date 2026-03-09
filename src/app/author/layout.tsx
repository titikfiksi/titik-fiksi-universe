import { jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, LogOut, Settings, HelpCircle, Globe } from "lucide-react";
import { logout } from "@/lib/actions";
import type { ReactNode } from "react";

// Helper to ensure strict JWT secret loading
const getJwtSecret = (): Uint8Array => {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) throw new Error("JWT_SECRET environment variable is required");
  return new TextEncoder().encode(secretKey);
};

interface AuthorLayoutProps {
  children: ReactNode;
}

export default async function AuthorLayout({ children }: AuthorLayoutProps) {
  const token = cookies().get("admin_session")?.value;
  if (!token) return redirect("/login");

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    // Only allow users with AUTHOR role
    if (payload.role !== "AUTHOR") return redirect("/admin");
  } catch {
    return redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 fixed top-0 w-full z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/author"
            className="flex items-center gap-2 text-indigo-600 font-black text-xl hover:opacity-80 transition"
            prefetch={false}
          >
            <BookOpen size={24} /> TF <span className="text-gray-800">Author</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-indigo-600 px-2 transition"
              prefetch={false}
            >
              <Globe size={14} /> Lihat Web Publik
            </Link>

            <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block" aria-hidden />

            <Link
              href="/author/guide"
              className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-xl text-xs font-bold transition"
              prefetch={false}
            >
              <HelpCircle size={14} /> <span className="hidden sm:block">Panduan</span>
            </Link>

            <Link
              href="/author/settings"
              className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-2 rounded-xl text-xs font-bold transition"
              prefetch={false}
            >
              <Settings size={14} /> <span className="hidden sm:block">Pengaturan</span>
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-xl text-xs font-bold transition"
              >
                <LogOut size={14} /> <span className="hidden sm:block">Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="pt-24 px-4 pb-20 container mx-auto">{children}</main>
    </div>
  );
}