"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { JWT_SECRET } from "@/lib/auth-config"; 
import { generateSlug } from "@/lib/utils"; 

// ======================================================================
// FUNGSI BANTUAN: SMART PARTIAL UPDATE
// ======================================================================
// Fungsi ini mengecek apakah data dikirim oleh form.
// Jika TIDAK dikirim (missing), kembalikan undefined (agar Prisma tidak menimpa data lama).
// Jika dikirim tapi kosong, kembalikan string kosong (agar data dihapus sesuai keinginan user).
function getFormValue(formData: FormData, key: string): string | undefined {
  if (!formData.has(key)) return undefined; // Kunci tidak ada? Jangan update!
  const value = formData.get(key);
  return value === null ? undefined : (value as string);
}

// ======================================================================
// 1. SISTEM LOGIN ADMIN
// ======================================================================
export async function loginAdmin(prevState: any, formData: FormData) {
  const lockoutCookie = cookies().get("admin_lockout");
  if (lockoutCookie) {
    const lockoutTime = parseInt(lockoutCookie.value);
    if (Date.now() < lockoutTime) {
      const remainingMinutes = Math.ceil((lockoutTime - Date.now()) / 60000);
      return { error: `Terlalu banyak percobaan. Akses diblokir sementara. Coba lagi dalam ${remainingMinutes} menit.` };
    } else {
      cookies().delete("admin_lockout");
      cookies().delete("admin_attempts");
    }
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const settings = await db.settings.findFirst({ select: { adminEmail: true, email: true, adminPassword: true } });
  const validEmail = settings?.adminEmail || settings?.email;
  
  let isPasswordMatch = false;
  if (validEmail === email) {
    const validPassword = settings?.adminPassword;
    if (validPassword && (validPassword.startsWith("$2a$") || validPassword.startsWith("$2b$"))) {
      isPasswordMatch = await bcrypt.compare(password, validPassword);
    } else {
      isPasswordMatch = password === validPassword;
    }
  }

  if (!isPasswordMatch) {
    const attemptsCookie = cookies().get("admin_attempts");
    let attempts = attemptsCookie ? parseInt(attemptsCookie.value) : 0;
    attempts += 1;

    if (attempts >= 5) {
      const lockoutUntil = Date.now() + 5 * 60 * 1000; 
      cookies().set("admin_lockout", lockoutUntil.toString(), { maxAge: 5 * 60 });
      cookies().set("admin_attempts", attempts.toString(), { maxAge: 5 * 60 });
      return { error: "Batas percobaan harian tercapai. Sistem mengunci akses Anda selama 5 menit." };
    } else {
      cookies().set("admin_attempts", attempts.toString(), { maxAge: 15 * 60 });
      return { error: `Kredensial salah! Sisa percobaan Anda: ${5 - attempts} kali lagi sebelum diblokir.` };
    }
  }

  cookies().delete("admin_attempts");
  cookies().delete("admin_lockout");

  const token = await new SignJWT({ userId: "SUPER_ADMIN", role: "ADMIN" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  cookies().set("admin_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
  redirect("/admin");
}

// ======================================================================
// 2. SISTEM LOGIN PENULIS
// ======================================================================
export async function loginAuthor(prevState: any, formData: FormData) {
  const lockoutCookie = cookies().get("author_lockout");
  if (lockoutCookie) {
    const lockoutTime = parseInt(lockoutCookie.value);
    if (Date.now() < lockoutTime) {
      const remainingMinutes = Math.ceil((lockoutTime - Date.now()) / 60000);
      return { error: `Terlalu banyak percobaan. Akses diblokir sementara. Coba lagi dalam ${remainingMinutes} menit.` };
    } else {
      cookies().delete("author_lockout");
      cookies().delete("author_attempts");
    }
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const user = await db.user.findUnique({ where: { email }, select: { id: true, role: true, password: true } });
  
  let isPasswordMatch = false;
  if (user && user.role === "AUTHOR") {
    isPasswordMatch = await bcrypt.compare(password, user.password);
  }

  if (!isPasswordMatch) {
    const attemptsCookie = cookies().get("author_attempts");
    let attempts = attemptsCookie ? parseInt(attemptsCookie.value) : 0;
    attempts += 1;

    if (attempts >= 5) {
      const lockoutUntil = Date.now() + 5 * 60 * 1000; 
      cookies().set("author_lockout", lockoutUntil.toString(), { maxAge: 5 * 60 });
      cookies().set("author_attempts", attempts.toString(), { maxAge: 5 * 60 });
      return { error: "Batas percobaan harian tercapai. Sistem mengunci akses Anda selama 5 menit untuk mencegah pembajakan akun." };
    } else {
      cookies().set("author_attempts", attempts.toString(), { maxAge: 15 * 60 });
      return { error: `Kredensial salah! Sisa percobaan Anda: ${5 - attempts} kali lagi sebelum diblokir.` };
    }
  }

  if (!user) return { error: "User tidak ditemukan." };

  cookies().delete("author_attempts");
  cookies().delete("author_lockout");

  const token = await new SignJWT({ userId: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  cookies().set("admin_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  redirect("/author");
}

export async function logout() { cookies().delete("admin_session"); redirect("/login"); }
export async function logoutAdmin() { cookies().delete("admin_session"); redirect("/"); }

// ======================================================================
// 4. DATABASE ACTIONS: NOVEL (ADMIN)
// ======================================================================
export async function createNovel(formData: FormData) { 
  let success = false;
  try {
    const title = formData.get("title") as string; 
    let slug = formData.get("slug") as string; 
    
    if (!slug || slug.trim() === "") slug = generateSlug(title);
    else slug = generateSlug(slug);

    // Create tetap butuh default string karena tidak bisa undefined
    const synopsis = (formData.get("synopsis") as string) || ""; 
    const coverImage = (formData.get("coverImage") as string) || ""; 

    const status = formData.get("status") as string || "Ongoing"; 
    const youtubeTrailer = (formData.get("youtubeTrailer") as string)?.trim() || null; 
    const author = (formData.get("author") as string)?.trim() || "Lutfi Abdulloh"; 
    const authorDonationUrl = (formData.get("authorDonationUrl") as string)?.trim() || null; 
    
    const genres = formData.getAll("genre") as string[]; 
    const customGenre = formData.get("customGenre") as string; 
    let allGenres = [...genres]; 
    if (customGenre && customGenre.trim() !== "") { 
        const customList = customGenre.split(",").map(g => g.trim()).filter(g => g !== ""); 
        allGenres = [...allGenres, ...customList]; 
    } 
    const uniqueGenres = Array.from(new Set(allGenres)); 
    const genre = uniqueGenres.length > 0 ? uniqueGenres.join(", ") : "Fiksi";
    
    await db.novel.create({ data: { title, slug, synopsis, coverImage, status, genre, youtubeTrailer, author, authorDonationUrl } }); 
    revalidatePath("/"); revalidatePath("/admin");
    success = true;
  } catch (e: any) {
    console.error("Gagal membuat novel:", e.message);
    throw new Error("Gagal menyimpan data novel.");
  } 
  if (success) redirect("/admin"); 
}

// PERBAIKAN: Menggunakan getFormValue untuk Partial Update
export async function updateNovel(id: string, formData: FormData) { 
  let success = false;
  try {
    // 1. Ambil data secara aman (undefined jika tidak ada di form)
    const title = getFormValue(formData, "title");
    let slug = getFormValue(formData, "slug");
    
    // Logika Slug: Hanya generate jika slug dikirim oleh form
    if (slug !== undefined) {
       if (slug.trim() === "" && title) slug = generateSlug(title);
       else slug = generateSlug(slug);
    }

    const synopsis = getFormValue(formData, "synopsis");
    const coverImage = getFormValue(formData, "coverImage");
    const status = getFormValue(formData, "status");
    const youtubeTrailer = getFormValue(formData, "youtubeTrailer"); // Bisa string, null, atau undefined
    const author = getFormValue(formData, "author");
    const authorDonationUrl = getFormValue(formData, "authorDonationUrl");
    
    // Logika Genre: Hanya update jika ada input genre
    let genre: string | undefined = undefined;
    if (formData.has("genre") || formData.has("customGenre")) {
        const genres = formData.getAll("genre") as string[]; 
        const customGenre = formData.get("customGenre") as string; 
        let allGenres = [...genres]; 
        if (customGenre && customGenre.trim() !== "") { 
            const customList = customGenre.split(",").map(g => g.trim()).filter(g => g !== ""); 
            allGenres = [...allGenres, ...customList]; 
        } 
        const uniqueGenres = Array.from(new Set(allGenres)); 
        genre = uniqueGenres.length > 0 ? uniqueGenres.join(", ") : "Fiksi";
    }
    
    // Object data bersih dari undefined
    await db.novel.update({ 
        where: { id }, 
        data: { 
            title, 
            slug, 
            synopsis, 
            coverImage, 
            status, 
            genre, 
            youtubeTrailer, 
            author, 
            authorDonationUrl 
        } 
    }); 

    revalidatePath("/"); revalidatePath(`/admin/novels/${id}`); revalidatePath("/admin");
    // Jika slug berubah, revalidate path baru, jika tidak, path lama
    if (slug) revalidatePath(`/novel/${slug}`); 
    
    success = true;
  } catch (e: any) {
    console.error("Gagal mengupdate novel:", e.message);
    throw new Error("Gagal mengupdate data novel.");
  } 
  if (success) redirect("/admin"); 
}

export async function deleteNovel(id: string) { let success = false; try { await db.novel.delete({ where: { id } }); revalidatePath("/"); revalidatePath("/admin"); success = true; } catch (e: any) { throw new Error("Gagal menghapus novel."); } if (success) redirect("/admin"); }

// ======================================================================
// 5. DATABASE ACTIONS: CHAPTER (ADMIN)
// ======================================================================
export async function createChapter(novelId: string, novelSlug: string, formData: FormData) { 
  let success = false;
  try {
    const title = formData.get("title") as string; 
    let slug = formData.get("slug") as string; 
    
    if (!slug || slug.trim() === "") slug = generateSlug(title);
    else slug = generateSlug(slug);

    const content = formData.get("content") as string; const orderIndex = parseInt(formData.get("orderIndex") as string) || 1; 
    const isLocked = formData.get("isLocked") === "on"; const isPublished = formData.get("isPublished") === "on"; const payLink = (formData.get("payLink") as string)?.trim() || null; const unlockCode = (formData.get("unlockCode") as string)?.trim() || null; 
    const publishAtString = formData.get("publishAt") as string; const publishAt = publishAtString ? new Date(publishAtString) : new Date();

    const existingSlug = await db.chapter.findFirst({ where: { slug }, select: { id: true } }); 
    if (existingSlug) { slug = `${slug}-${Date.now().toString().slice(-4)}`; }
    
    await db.chapter.create({ data: { title, slug, orderIndex, novelId, content: content || "<p>Teks tidak terbaca.</p>", isLocked, isPublished, payLink, unlockCode, publishAt } }); 
    revalidatePath(`/novel/${novelSlug}`); revalidatePath(`/admin/novels/${novelId}`); 
    success = true;
  } catch (e: any) { throw new Error("Gagal menyimpan bab."); }
  if (success) redirect(`/admin/novels/${novelId}`);
}

export async function updateChapter(chapterId: string, novelId: string, novelSlug: string, formData: FormData) { 
  let success = false;
  try {
    const title = getFormValue(formData, "title");
    let slug = getFormValue(formData, "slug");
    
    if (slug !== undefined) {
        if (slug.trim() === "" && title) slug = generateSlug(title);
        else slug = generateSlug(slug);
    }

    // Handle Content specifically
    let content = undefined;
    if (formData.has("content")) {
        content = (formData.get("content") as string) || "<p>Teks tidak terbaca.</p>";
    }

    const orderIndex = formData.has("orderIndex") ? parseInt(formData.get("orderIndex") as string) : undefined;
    const isLocked = formData.has("isLocked") ? formData.get("isLocked") === "on" : undefined;
    const isPublished = formData.has("isPublished") ? formData.get("isPublished") === "on" : undefined;
    
    const payLink = getFormValue(formData, "payLink");
    const unlockCode = getFormValue(formData, "unlockCode");
    
    let publishAt = undefined;
    if (formData.has("publishAt")) {
        const publishAtString = formData.get("publishAt") as string;
        publishAt = publishAtString ? new Date(publishAtString) : new Date();
    }

    if (slug) {
        const existingSlug = await db.chapter.findFirst({ where: { slug, NOT: { id: chapterId } }, select: { id: true } }); 
        if (existingSlug) { slug = `${slug}-${Date.now().toString().slice(-4)}`; }
    }
    
    await db.chapter.update({ 
        where: { id: chapterId }, 
        data: { title, slug, orderIndex, content, isLocked, isPublished, payLink, unlockCode, publishAt } 
    }); 

    revalidatePath(`/novel/${novelSlug}`); // Revalidate parent novel page
    if (slug) revalidatePath(`/novel/${novelSlug}/${slug}`); 
    revalidatePath(`/admin/novels/${novelId}`); 
    success = true;
  } catch (e: any) { throw new Error("Gagal mengedit bab."); }
  if (success) redirect(`/admin/novels/${novelId}`);
}

export async function deleteChapter(chapterId: string, novelId: string) { try { await db.chapter.delete({ where: { id: chapterId }}); revalidatePath(`/admin/novels/${novelId}`); } catch (e: any) { throw new Error("Gagal menghapus bab."); } }

// ======================================================================
// 6. DATABASE ACTIONS: LINKS & SOCIALS (ADMIN)
// ======================================================================
export async function addExternalLink(novelId: string, novelSlug: string, formData: FormData) { try { const title = formData.get("title") as string; const url = formData.get("url") as string; if (title && url) { await db.externalLink.create({ data: { title, url, novelId }}); revalidatePath(`/admin/novels/${novelId}`); revalidatePath(`/novel/${novelSlug}`); } } catch (e) { throw new Error("Gagal memproses."); } }
export async function deleteExternalLink(id: string, novelId: string, novelSlug: string) { try { await db.externalLink.delete({ where: { id } }); revalidatePath(`/admin/novels/${novelId}`); revalidatePath(`/novel/${novelSlug}`); } catch (e) { throw new Error("Gagal memproses."); } }
export async function addAuthorSocial(novelId: string, novelSlug: string, formData: FormData) { try { const platform = formData.get("platform") as string; const url = formData.get("url") as string; if (platform && url) { await db.authorSocial.create({ data: { platform, url, novelId }}); revalidatePath(`/admin/novels/${novelId}`); revalidatePath(`/novel/${novelSlug}`); } } catch (e) { throw new Error("Gagal memproses."); } }
export async function deleteAuthorSocial(id: string, novelId: string, novelSlug: string) { try { await db.authorSocial.delete({ where: { id } }); revalidatePath(`/admin/novels/${novelId}`); revalidatePath(`/novel/${novelSlug}`); } catch (e) { throw new Error("Gagal memproses."); } }

// ======================================================================
// 7. DATABASE ACTIONS: PENGATURAN ADMIN & PUBLIK
// ======================================================================
export async function updateSettings(formData: FormData) { 
  const activeTab = formData.get("activeTab") as string || "beranda";
  let success = false;
  try { 
    const current = await db.settings.findFirst({ select: { id: true, adminEmail: true, email: true, adminPassword: true } });
    let dataToUpdate: any = {};

    if (activeTab === "beranda") {
      dataToUpdate = { siteName: formData.get("siteName") as string, runningText: formData.get("runningText") as string || null, isActive: formData.get("isActive") === "on", copyrightText: formData.get("copyrightText") as string || null };
    } else if (activeTab === "akun") {
      const newAdminEmail = formData.get("adminEmail") as string; const newAdminPassword = formData.get("newAdminPassword") as string; const oldAdminPassword = formData.get("oldAdminPassword") as string;
      const currentEmail = current?.adminEmail || current?.email;
      const isEmailChanged = newAdminEmail && newAdminEmail !== currentEmail;
      const isPasswordChanging = newAdminPassword && newAdminPassword.trim() !== "";

      if (isEmailChanged || isPasswordChanging) { 
        if (!oldAdminPassword) throw new Error("Sandi lama wajib diisi untuk keamanan!");
        const isMatch = await bcrypt.compare(oldAdminPassword, current?.adminPassword || "");
        if (!isMatch) throw new Error("Sandi lama salah!");
        if (isPasswordChanging) dataToUpdate.adminPassword = await bcrypt.hash(newAdminPassword, 10); 
      }
      if (newAdminEmail) dataToUpdate.adminEmail = newAdminEmail;
    } else if (activeTab === "tentang") { dataToUpdate = { visiPenulis: formData.get("visiPenulis") as string || null, kekuatanPembaca: formData.get("kekuatanPembaca") as string || null };
    } else if (activeTab === "kontak") { dataToUpdate = { email: formData.get("email") as string || null, whatsappNumber: formData.get("whatsappNumber") as string || null };
    } else if (activeTab === "penulis") { dataToUpdate = { isOpenForWriters: formData.get("isOpenForWriters") === "on", writerHeroTitle: formData.get("writerHeroTitle") as string || null, writerHeroDesc: formData.get("writerHeroDesc") as string || null, writerTerms: formData.get("writerTerms") as string || null, writerBenefit1Title: formData.get("writerBenefit1Title") as string || null, writerBenefit1Desc: formData.get("writerBenefit1Desc") as string || null, writerBenefit2Title: formData.get("writerBenefit2Title") as string || null, writerBenefit2Desc: formData.get("writerBenefit2Desc") as string || null, writerBenefit3Title: formData.get("writerBenefit3Title") as string || null, writerBenefit3Desc: formData.get("writerBenefit3Desc") as string || null, writerBenefit4Title: formData.get("writerBenefit4Title") as string || null, writerBenefit4Desc: formData.get("writerBenefit4Desc") as string || null };
    } else if (activeTab === "dasbor_kreator") { dataToUpdate = { authorAnnounce1Title: formData.get("authorAnnounce1Title") as string || null, authorAnnounce1Desc: formData.get("authorAnnounce1Desc") as string || null, authorAnnounce2Title: formData.get("authorAnnounce2Title") as string || null, authorAnnounce2Desc: formData.get("authorAnnounce2Desc") as string || null, promoPremiumTitle: formData.get("promoPremiumTitle") as string || null, promoPremiumDesc: formData.get("promoPremiumDesc") as string || null }; }

    if (current) { await db.settings.update({ where: { id: current.id }, data: dataToUpdate }); } 
    else { await db.settings.create({ data: { siteName: "Titik Fiksi Universe", ...dataToUpdate } }); }
    
    revalidatePath("/", "layout"); 
    success = true;
  } catch (e: any) { throw new Error(e.message || "Gagal update pengaturan"); } 
  if (success) redirect(`/admin/settings?tab=${activeTab}`); 
}

export async function addSocialLink(formData: FormData) { let success = false; try { const platform = formData.get("platform") as string; const url = formData.get("url") as string; if (platform && url) { await db.socialLink.create({ data: { platform, url } }); revalidatePath("/", "layout"); success = true; } } catch (e) { throw new Error("Gagal memproses."); } if(success) redirect("/admin/settings?tab=kontak"); }
export async function deleteSocialLink(id: string) { try { await db.socialLink.delete({ where: { id } }); revalidatePath("/", "layout"); } catch (e) { throw new Error("Gagal memproses."); } }
export async function addDonationLink(formData: FormData) { let success = false; try { const platform = formData.get("platform") as string; const url = formData.get("url") as string; if (platform && url) { await db.donationLink.create({ data: { platform, url } }); revalidatePath("/", "layout"); success = true; } } catch (e) { throw new Error("Gagal memproses."); } if(success) redirect("/admin/settings?tab=toko"); }
export async function deleteDonationLink(id: string) { try { await db.donationLink.delete({ where: { id } }); revalidatePath("/", "layout"); } catch (e) { throw new Error("Gagal memproses."); } }
export async function addSponsor(formData: FormData) { let success = false; try { const title = formData.get("title") as string; const imageUrls = formData.getAll("imageUrl") as string[]; const imageUrl = imageUrls.filter(url => url.trim() !== "").join(","); const linkUrl = formData.get("linkUrl") as string; const description = formData.get("description") as string; if (title && imageUrl && linkUrl) { await db.sponsor.create({ data: { title, imageUrl, linkUrl, description } }); revalidatePath("/", "layout"); success = true;} } catch (e) { throw new Error("Gagal memproses."); } if(success) redirect("/admin/settings?tab=toko"); }
export async function deleteSponsor(id: string) { try { await db.sponsor.delete({ where: { id } }); revalidatePath("/", "layout"); } catch (e) { throw new Error("Gagal memproses."); } }

export async function incrementNovelViews(novelId: string) { try { await db.novel.update({ where: { id: novelId }, data: { views: { increment: 1 } } }); } catch (error) { console.error("Gagal tracking view:", error); } }
export async function addRating(novelId: string, formData: FormData) { try { const value = parseInt(formData.get("value") as string); const path = formData.get("path") as string; if (value) { await db.rating.create({ data: { value, novelId } }); revalidatePath(path); } } catch (e) { throw new Error("Gagal memproses."); } }
export async function addComment(chapterId: string, formData: FormData) { try { const name = formData.get("name") as string; const content = formData.get("content") as string; const path = formData.get("path") as string; if (name && content) { await db.comment.create({ data: { name, content, chapterId } }); revalidatePath(path); } } catch (e) { throw new Error("Gagal memproses."); } }
export async function deleteComment(id: string) { try { await db.comment.delete({ where: { id } }); revalidatePath("/admin"); } catch (e) { throw new Error("Gagal memproses."); } }

// ======================================================================
// 8. DATABASE ACTIONS: MANAJEMEN PENULIS
// ======================================================================
export async function createAuthorAccount(formData: FormData) {
  let success = false;
  try {
    const name = formData.get("name") as string; const email = formData.get("email") as string; const password = formData.get("password") as string;
    if (!name || !email || !password) throw new Error("Semua kolom harus diisi!");
    const existingUser = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (existingUser) throw new Error("Email ini sudah digunakan oleh akun lain.");
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.create({ data: { name, email, password: hashedPassword, role: "AUTHOR" } });
    revalidatePath("/admin/authors");
    success = true;
  } catch (error: any) { throw new Error(error.message); }
  if (success) redirect("/admin/authors");
}

export async function deleteAuthorAccount(id: string) { try { await db.novel.updateMany({ where: { userId: id }, data: { userId: null } }); await db.user.delete({ where: { id } }); revalidatePath("/admin/authors"); } catch (error: any) { throw new Error("Gagal memproses."); } }

// ======================================================================
// 9. DATABASE ACTIONS: FITUR SOROTAN / FEATURED
// ======================================================================
export async function toggleFeaturedNovel(id: string, days: number | null) { try { const novel = await db.novel.findUnique({ where: { id }, select: { isFeatured: true } }); if (!novel) return { error: "Novel tidak ditemukan" }; const featuredUntil = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null; await db.novel.update({ where: { id }, data: { isFeatured: !novel.isFeatured, featuredUntil: novel.isFeatured ? null : featuredUntil } }); revalidatePath("/"); revalidatePath("/admin"); return { success: true }; } catch (error: any) { return { error: "Gagal memperbarui status sorotan" }; } }

// ======================================================================
// 10. DATABASE ACTIONS: KHUSUS RUANG PENULIS (AUTHOR)
// ======================================================================
export async function createNovelByAuthor(formData: FormData) { 
  const token = cookies().get("admin_session")?.value;
  if (!token) throw new Error("Unauthorized");
  const verified = await jwtVerify(token, JWT_SECRET);
  const userId = verified.payload.userId as string;

  let success = false;
  try {
    const title = formData.get("title") as string; 
    let slug = formData.get("slug") as string; 
    
    // PERBAIKAN TAHAP 3: Validasi Slug
    if (!slug || slug.trim() === "") slug = generateSlug(title);
    else slug = generateSlug(slug);

    // Create tetap harus default string jika kosong
    const synopsis = (formData.get("synopsis") as string) || ""; 
    const coverImage = (formData.get("coverImage") as string) || ""; 
    
    const status = formData.get("status") as string || "Ongoing"; 
    const youtubeTrailer = (formData.get("youtubeTrailer") as string)?.trim() || null; 
    const authorDonationUrl = (formData.get("authorDonationUrl") as string)?.trim() || null; 
    
    const user = await db.user.findUnique({ where: { id: userId }, select: { name: true } });
    const authorName = user?.name || "Penulis Tanpa Nama";
    
    const genres = formData.getAll("genre") as string[]; 
    const customGenre = formData.get("customGenre") as string; 
    let allGenres = [...genres]; 
    if (customGenre && customGenre.trim() !== "") { 
        const customList = customGenre.split(",").map(g => g.trim()).filter(g => g !== ""); 
        allGenres = [...allGenres, ...customList]; 
    } 
    const uniqueGenres = Array.from(new Set(allGenres)); 
    const genre = uniqueGenres.length > 0 ? uniqueGenres.join(", ") : "Fiksi";
    
    await db.novel.create({ data: { title, slug, synopsis, coverImage, status, genre, youtubeTrailer, author: authorName, authorDonationUrl, userId } }); 
    revalidatePath("/"); revalidatePath("/author");
    success = true;
  } catch (e: any) { throw new Error("Gagal membuat novel."); } 
  if (success) redirect("/author"); 
}

// PERBAIKAN: Update Novel Author dengan Partial Update (Aman dari Penimpaan)
export async function updateNovelByAuthor(id: string, formData: FormData) { 
  const token = cookies().get("admin_session")?.value;
  if (!token) throw new Error("Unauthorized");
  const verified = await jwtVerify(token, JWT_SECRET);
  const userId = verified.payload.userId as string;

  let success = false;
  try {
    const novel = await db.novel.findUnique({ where: { id }, select: { userId: true } });
    if (!novel || novel.userId !== userId) throw new Error("Unauthorized");

    // Gunakan getFormValue agar undefined jika field tidak dikirim (mencegah overwrite)
    const title = getFormValue(formData, "title");
    let slug = getFormValue(formData, "slug");
    
    if (slug !== undefined) {
        if (slug.trim() === "" && title) slug = generateSlug(title);
        else slug = generateSlug(slug);
    }

    const synopsis = getFormValue(formData, "synopsis");
    const coverImage = getFormValue(formData, "coverImage");
    const status = getFormValue(formData, "status");
    const youtubeTrailer = getFormValue(formData, "youtubeTrailer");
    const authorDonationUrl = getFormValue(formData, "authorDonationUrl");
    
    // Genre Logic: Hanya update jika ada input
    let genre: string | undefined = undefined;
    if (formData.has("genre") || formData.has("customGenre")) {
        const genres = formData.getAll("genre") as string[]; 
        const customGenre = formData.get("customGenre") as string; 
        let allGenres = [...genres]; 
        if (customGenre && customGenre.trim() !== "") { 
            const customList = customGenre.split(",").map(g => g.trim()).filter(g => g !== ""); 
            allGenres = [...allGenres, ...customList]; 
        } 
        const uniqueGenres = Array.from(new Set(allGenres)); 
        genre = uniqueGenres.length > 0 ? uniqueGenres.join(", ") : "Fiksi";
    }
    
    await db.novel.update({ 
        where: { id }, 
        data: { 
            title, 
            slug, 
            synopsis, 
            coverImage, 
            status, 
            genre, 
            youtubeTrailer, 
            authorDonationUrl 
        } 
    }); 

    revalidatePath("/"); revalidatePath(`/author/novel/${slug}`);
    if (slug) revalidatePath(`/novel/${slug}`);
    
    success = true;
  } catch (e: any) { throw new Error("Gagal update novel."); } 
  if (success) redirect("/author"); 
}

export async function createChapterByAuthor(novelId: string, novelSlug: string, formData: FormData) { 
  const token = cookies().get("admin_session")?.value;
  if (!token) throw new Error("Unauthorized");
  const verified = await jwtVerify(token, JWT_SECRET);
  const userId = verified.payload.userId as string;

  let success = false;
  try {
    const novel = await db.novel.findUnique({ where: { id: novelId }, select: { userId: true } });
    if (!novel || novel.userId !== userId) throw new Error("Unauthorized");

    const title = formData.get("title") as string; 
    let slug = formData.get("slug") as string; 
    
    if (!slug || slug.trim() === "") slug = generateSlug(title);
    else slug = generateSlug(slug);

    const content = formData.get("content") as string; const orderIndex = parseInt(formData.get("orderIndex") as string) || 1; 
    const isLocked = formData.get("isLocked") === "on"; const isPublished = formData.get("isPublished") === "on"; const payLink = (formData.get("payLink") as string)?.trim() || null; const unlockCode = (formData.get("unlockCode") as string)?.trim() || null; 
    const publishAtString = formData.get("publishAt") as string; const publishAt = publishAtString ? new Date(publishAtString) : new Date();

    const existingSlug = await db.chapter.findFirst({ where: { slug }, select: { id: true } }); 
    if (existingSlug) { slug = `${slug}-${Date.now().toString().slice(-4)}`; }
    
    await db.chapter.create({ data: { title, slug, orderIndex, novelId, content: content || "<p>Teks tidak terbaca.</p>", isLocked, isPublished, payLink, unlockCode, publishAt } }); 
    revalidatePath(`/novel/${novelSlug}`); revalidatePath(`/author/novel/${novelSlug}`); 
    success = true;
  } catch (e: any) { throw new Error("Gagal menyimpan: " + e.message); }
  if(success) redirect(`/author/novel/${novelSlug}`);
}

export async function updateChapterByAuthor(chapterId: string, novelId: string, novelSlug: string, formData: FormData) { 
  const token = cookies().get("admin_session")?.value;
  if (!token) throw new Error("Unauthorized");
  const verified = await jwtVerify(token, JWT_SECRET);
  const userId = verified.payload.userId as string;

  let success = false;
  try {
    const novel = await db.novel.findUnique({ where: { id: novelId }, select: { userId: true } });
    if (!novel || novel.userId !== userId) throw new Error("Unauthorized");

    const title = getFormValue(formData, "title");
    let slug = getFormValue(formData, "slug");
    
    if (slug !== undefined) {
        if (slug.trim() === "" && title) slug = generateSlug(title);
        else slug = generateSlug(slug);
    }

    let content = undefined;
    if (formData.has("content")) {
        content = (formData.get("content") as string) || "<p>Teks tidak terbaca.</p>";
    }

    const orderIndex = formData.has("orderIndex") ? parseInt(formData.get("orderIndex") as string) : undefined;
    const isLocked = formData.has("isLocked") ? formData.get("isLocked") === "on" : undefined;
    const isPublished = formData.has("isPublished") ? formData.get("isPublished") === "on" : undefined;
    const payLink = getFormValue(formData, "payLink");
    const unlockCode = getFormValue(formData, "unlockCode");
    
    let publishAt = undefined;
    if (formData.has("publishAt")) {
        const publishAtString = formData.get("publishAt") as string;
        publishAt = publishAtString ? new Date(publishAtString) : new Date();
    }

    if (slug) {
        const existingSlug = await db.chapter.findFirst({ where: { slug, NOT: { id: chapterId } }, select: { id: true } }); 
        if (existingSlug) { slug = `${slug}-${Date.now().toString().slice(-4)}`; }
    }
    
    await db.chapter.update({ 
        where: { id: chapterId }, 
        data: { title, slug, orderIndex, content, isLocked, isPublished, payLink, unlockCode, publishAt } 
    }); 

    revalidatePath(`/novel/${novelSlug}`); // Revalidate novel page
    if (slug) revalidatePath(`/novel/${novelSlug}/${slug}`);
    revalidatePath(`/author/novel/${novelSlug}`); 
    success = true;
  } catch (e: any) { throw new Error("Gagal mengedit: " + e.message); }
  if(success) redirect(`/author/novel/${novelSlug}`);
}

export async function deleteChapterByAuthor(chapterId: string, novelId: string, novelSlug: string) { try { await db.chapter.delete({ where: { id: chapterId } }); revalidatePath(`/author/novel/${novelSlug}`); } catch (error: any) { throw new Error("Gagal memproses."); } }
export async function replyCommentByAuthor(chapterId: string, novelSlug: string, formData: FormData) { try { const content = formData.get("content") as string; const replyTo = formData.get("replyTo") as string; if (content) { await db.comment.create({ data: { name: "👑 Penulis", content: replyTo ? `Membalas @${replyTo}: ${content}` : content, chapterId: chapterId } }); revalidatePath(`/author/novel/${novelSlug}`); } } catch (error: any) { throw new Error("Gagal memproses."); } }
export async function addExternalLinkByAuthor(novelId: string, novelSlug: string, formData: FormData) { try { const title = formData.get("title") as string; const url = formData.get("url") as string; if (title && url) { await db.externalLink.create({ data: { title, url, novelId }}); revalidatePath(`/author/novel/${novelSlug}`); } } catch (e: any) { throw new Error("Gagal memproses."); } }
export async function deleteExternalLinkByAuthor(id: string, novelId: string, novelSlug: string) { try { await db.externalLink.delete({ where: { id } }); revalidatePath(`/author/novel/${novelSlug}`); } catch (e: any) { throw new Error("Gagal memproses."); } }
export async function addAuthorSocialByAuthor(novelId: string, novelSlug: string, formData: FormData) { try { const platform = formData.get("platform") as string; const url = formData.get("url") as string; if (platform && url) { await db.authorSocial.create({ data: { platform, url, novelId }}); revalidatePath(`/author/novel/${novelSlug}`); } } catch (e: any) { throw new Error("Gagal memproses."); } }
export async function deleteAuthorSocialByAuthor(id: string, novelId: string, novelSlug: string) { try { await db.authorSocial.delete({ where: { id } }); revalidatePath(`/author/novel/${novelSlug}`); } catch (e: any) { throw new Error("Gagal memproses."); } }

// ======================================================================
// 11. PENGATURAN AKUN PENULIS (AUTHOR PROFILE)
// ======================================================================
export async function updateAuthorProfile(userId: string, formData: FormData) {
  let success = false;
  try {
    const name = getFormValue(formData, "name");
    const email = getFormValue(formData, "email");
    const currentPassword = formData.get("currentPassword") as string; 
    const newPassword = formData.get("newPassword") as string;
    
    const user = await db.user.findUnique({ where: { id: userId }, select: { password: true } });
    if (!user) throw new Error("Akun tidak ditemukan");

    let dataToUpdate: any = { name, email };
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) throw new Error("Kata sandi saat ini salah!");
      dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }
    await db.user.update({ where: { id: userId }, data: dataToUpdate });
    revalidatePath("/author/settings"); revalidatePath("/author");
    success = true;
  } catch (error: any) { throw new Error(error.message || "Gagal update profil"); }
  if (success) redirect("/author/settings");
}


export async function replyCommentByAdmin(chapterId: string, novelId: string, formData: FormData) { try { const content = formData.get("content") as string; const replyTo = formData.get("replyTo") as string; if (content) { await db.comment.create({ data: { name: "🛡️ Admin", content: replyTo ? `Membalas @${replyTo}: ${content}` : content, chapterId: chapterId } }); revalidatePath(`/admin/novels/${novelId}`); } } catch (error: any) { throw new Error("Gagal memproses."); } }