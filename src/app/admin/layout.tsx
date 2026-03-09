import { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Globe,
  PlusCircle,
  Users,
} from "lucide-react";
import { logoutAdmin } from "@/lib/actions";

interface SidebarLink {
  href: string;
  icon: ReactNode;
  label: string;
}

const SIDEBAR_LINKS: SidebarLink[] = [
  {
    href: "/admin",
    icon: <LayoutDashboard size={18} className="text-blue-400" aria-hidden="true" />,
    label: "Dashboard",
  },
  {
    href: "/admin/novels/new",
    icon: <PlusCircle size={18} className="text-green-400" aria-hidden="true" />,
    label: "Tulis Novel Baru",
  },
  {
    href: "/admin/authors",
    icon: <Users size={18} className="text-purple-400" aria-hidden="true" />,
    label: "Manajemen Penulis",
  },
  {
    href: "/admin/settings",
    icon: <Settings size={18} className="text-gray-400" aria-hidden="true" />,
    label: "Pengaturan Web",
  },
];

const EXTERNAL_LINKS: SidebarLink[] = [
  {
    href: "/",
    icon: <Globe size={18} className="text-indigo-400" aria-hidden="true" />,
    label: "Lihat Website",
  },
];

function Sidebar() {
  return (
    <aside className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col">
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <div
          className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold"
          aria-label="TF Universe Logo"
        >
          TF
        </div>
        <span className="font-black tracking-wider uppercase text-sm">Admin Panel</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {SIDEBAR_LINKS.map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition font-bold text-sm"
            prefetch={false}
            aria-label={label}
          >
            {icon}
            <span>{label}</span>
          </Link>
        ))}
        <div className="h-px bg-gray-800 my-4" aria-hidden="true" />
        {EXTERNAL_LINKS.map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition font-bold text-sm"
            prefetch={false}
            aria-label={label}
          >
            {icon}
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition font-bold text-sm"
            aria-label="Keluar Sesi"
          >
            <LogOut size={18} aria-hidden="true" /> <span>Keluar Sesi</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    // Added pt-24 to prevent overlap with fixed Navbar Publik
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pt-24">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}