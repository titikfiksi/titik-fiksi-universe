import Link from "next/link";
import { AlertCircle } from "lucide-react";
import ResetSandiClient from "./ResetSandiClient";

// Mark the whole page as dynamic and not cacheable for password reset
export const dynamic = "force-dynamic";

function InvalidToken() {
  return (
    <div className="relative z-10 w-full max-w-[420px] bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl border border-gray-100 animate-fade-in-up text-center">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
        <AlertCircle size={40} />
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-4">Akses Ditolak</h1>
      <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed">
        Tautan pemulihan tidak valid atau hilang. Silakan buat permintaan lupa kata sandi yang baru.
      </p>
      <Link
        href="/lupa-sandi"
        className="inline-flex w-full items-center justify-center bg-[#0f172a] text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg active:scale-95"
      >
        Kembali ke Lupa Sandi
      </Link>
    </div>
  );
}

// Next.js recommends server components for page-level routing.
export default async function ResetSandiPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // Extract token on server, do not render form if missing
  let token: string | null = null;
  if (typeof searchParams.token === "string") {
    token = searchParams.token;
  } else if (Array.isArray(searchParams.token)) {
    token = searchParams.token[0] ?? null;
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 pt-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-gray-200/50 to-transparent z-0" />
        <InvalidToken />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 pt-28 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-gray-200/50 to-transparent z-0" />
      <ResetSandiClient token={token} />
    </div>
  );
}