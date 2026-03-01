import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserCircle, Mail, KeyRound } from "lucide-react";
import SubmitButton from "@/components/SubmitButton";
import { updateAuthorProfile } from "@/lib/actions";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "TF_UNIVERSE_SECRET_KEY_2026_SAFE");

export const dynamic = "force-dynamic";

export default async function AuthorProfilePage() {
  const token = cookies().get("admin_session")?.value;
  if (!token) redirect("/login");

  let userId = "";
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    userId = verified.payload.userId as string;
  } catch (e) {
    redirect("/login");
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  // PERBAIKAN: Mengikat (bind) userId ke dalam fungsi action agar Vercel tidak error
  const updateProfileWithId = updateAuthorProfile.bind(null, userId);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <UserCircle className="text-indigo-600" size={32}/> Pengaturan <span className="text-indigo-600">Akun</span>
          </h1>
          <p className="text-gray-500 font-bold mt-1">Kelola identitas dan keamanan akun Anda.</p>
        </div>
        <Link href="/author" className="inline-flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 font-bold transition shadow-sm">
          <ArrowLeft size={18} /> Kembali
        </Link>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-200 shadow-sm relative overflow-hidden">
        {/* PERBAIKAN: Memanggil fungsi yang sudah di-bind */}
        <form action={updateProfileWithId} className="space-y-6 relative z-10">
          
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Nama Lengkap / Nama Pena</label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400" size={20} />
              <input type="text" name="name" defaultValue={user.name} required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-gray-900 transition" />
            </div>
            <p className="text-[10px] font-bold text-gray-400">*Nama ini akan otomatis terpasang sebagai penulis di setiap karya baru yang Anda buat.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Alamat Email (Untuk Login)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400" size={20} />
              <input type="email" name="email" defaultValue={user.email} required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 font-medium text-gray-900 transition" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-2">
            <label className="text-xs font-black text-amber-500 uppercase tracking-widest block mb-2">Ganti Kata Sandi (Password)</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400" size={20} />
              <input type="password" name="newPassword" placeholder="Kosongkan jika tidak ingin mengubah password" className="w-full pl-12 pr-4 py-4 bg-amber-50 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-black tracking-widest text-amber-900 transition placeholder:font-medium placeholder:tracking-normal placeholder:text-amber-300" />
            </div>
            <p className="text-[10px] font-bold text-amber-600">*Sangat disarankan untuk segera mengganti password sementara yang diberikan oleh Admin demi keamanan akun Anda.</p>
          </div>

          <div className="pt-8">
            {/* PERBAIKAN: Membersihkan properti SubmitButton yang tidak valid */}
            <SubmitButton text="Simpan Perubahan Profil" />
          </div>
        </form>
      </div>
    </div>
  );
}