import { db } from "@/lib/db";
import { Users, UserPlus, KeyRound, Mail } from "lucide-react";
import { createAuthorAccount, deleteAuthorAccount } from "@/lib/actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function ManageAuthorsPage() {
  const authors = await db.user.findMany({
    where: { role: "AUTHOR" },
    include: { _count: { select: { novels: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3"><Users className="text-blue-600" /> Manajemen Penulis</h1>
          <p className="text-gray-500 font-medium mt-1">Buat akun untuk penulis yang sudah Anda seleksi dan setujui.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM BUAT AKUN BARU */}
        <div className="lg:col-span-1">
          <form action={createAuthorAccount} className="bg-white p-6 rounded-[2rem] border border-blue-200 shadow-sm sticky top-24">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-100 pb-4"><UserPlus className="text-blue-600" size={20}/> Buat Akun Penulis</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Nama Asli / Pena</label>
                <input type="text" name="name" required placeholder="Contoh: Tere Liye" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm font-bold" />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Email Penulis</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input type="email" name="email" required placeholder="email@domain.com" className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Password Sementara</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" name="password" required placeholder="Sandi sementara" className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm" />
                </div>
              </div>
            </div>

            {/* TOMBOL SUDAH DIGANTI MENGGUNAKAN TAG BUTTON HTML MURNI */}
            <button 
              type="submit" 
              className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-md"
            >
              Generate Akun
            </button>
          </form>
        </div>

        {/* DAFTAR PENULIS */}
        <div className="lg:col-span-2 space-y-4">
          {authors.length === 0 ? (
            <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-3xl">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-bold">Belum ada penulis yang tergabung.</p>
            </div>
          ) : (
            authors.map(author => (
              <div key={author.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-black rounded-full flex items-center justify-center text-xl shadow-inner">
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">{author.name}</h3>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1"><Mail size={12}/> {author.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center px-4 border-x border-gray-100">
                    <span className="block text-xl font-black text-blue-600">{author._count.novels}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Karya</span>
                  </div>
                  <form action={deleteAuthorAccount.bind(null, author.id)}>
                    <DeleteButton message={`Hapus akun ${author.name}? (Karya mereka akan tetap ada di database tapi tidak punya pemilik)`}/>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

}