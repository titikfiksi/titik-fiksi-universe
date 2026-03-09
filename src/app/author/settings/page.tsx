import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify, JWTPayload } from "jose";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  UserCircle,
  Mail,
  KeyRound,
  Save,
  ShieldCheck,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { updateAuthorProfile } from "@/lib/actions";
import PasswordInput from "@/components/PasswordInput";

export const dynamic = "force-dynamic";

const getJwtSecret = (): Uint8Array => {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error("JWT_SECRET environment variable is required.");
  }
  return new TextEncoder().encode(secretKey);
};

const getAuthenticatedUser = async () => {
  const token = cookies().get("admin_session")?.value;
  if (!token) redirect("/login");

  let userId: string | undefined = undefined;
  try {
    const verified = await jwtVerify(token, getJwtSecret());
    userId =
      typeof verified.payload.userId === "string"
        ? verified.payload.userId
        : undefined;
    if (!userId) throw new Error("Invalid userId in token");
  } catch {
    redirect("/login");
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  return user;
};

export default async function AuthorSettingsPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <UserCircle className="text-indigo-600" size={32} /> Pengaturan{" "}
            <span className="text-indigo-600">Akun</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Kelola informasi profil dan keamanan akun Anda.
          </p>
        </div>
        <Link
          href="/author"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 font-bold transition shadow-sm"
        >
          <ArrowLeft size={18} /> Kembali
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-indigo-50/50 border-b border-indigo-100 flex items-center gap-3">
          <ShieldCheck className="text-indigo-600" size={24} />
          <div>
            <h2 className="font-bold text-gray-900">Privasi Terjaga</h2>
            <p className="text-xs text-gray-500">
              Sistem menggunakan enkripsi modern Bcrypt untuk melindungi data Anda.
            </p>
          </div>
        </div>

        <form
          action={updateAuthorProfile.bind(null, user.id)}
          className="p-8 space-y-8"
        >
          <section className="space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              Profil Penulis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                  <UserCircle size={14} /> Nama Pena / Asli
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={user.name ?? ""}
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-gray-800"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
              <Lock className="text-red-500" size={18} />
              <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">
                Keamanan & Kredensial (Sensitif)
              </h3>
            </div>
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium mb-4">
              Jika Anda ingin mengubah <strong>Email Login</strong> atau <strong>Kata Sandi</strong>, Anda wajib memasukkan kata sandi saat ini untuk mencegah pembajakan akun.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                  <Mail size={14} /> Email Login
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={user.email ?? ""}
                  required
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-bold"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                  <KeyRound size={14} /> Sandi Baru (Opsional)
                </label>
                <PasswordInput
                  name="newPassword"
                  placeholder="Kosongkan jika tidak diubah"
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500 tracking-widest"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-2 md:w-1/2 pt-4 border-t border-gray-100">
              <label className="text-xs font-black text-red-600 flex items-center gap-2">
                <Lock size={14} /> Konfirmasi Sandi Saat Ini
              </label>
              <PasswordInput
                name="currentPassword"
                placeholder="Wajib diisi untuk menyimpan perubahan email/sandi"
                className="w-full p-3 bg-red-50 border border-red-200 rounded-xl outline-none focus:ring-2 focus:ring-red-600 tracking-widest placeholder:text-red-300 placeholder:tracking-normal"
                required
                autoComplete="current-password"
              />
            </div>
          </section>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black hover:bg-indigo-700 transition shadow-lg flex items-center gap-2 active:scale-95"
            >
              <Save size={18} /> Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
