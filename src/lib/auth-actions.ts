"use server";

import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

// 1. FUNGSI UNTUK MEMINTA TAUTAN RESET (LUPA SANDI)
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;
  
  if (!email) return { error: "Email wajib diisi!" };

  const settings = await db.settings.findFirst();
  const user = await db.user.findUnique({ where: { email } });

  const isAdmin = settings?.email === email;
  const isAuthor = !!user;

  if (!isAdmin && !isAuthor) return { error: "Alamat email tidak terdaftar di sistem kami." };

  const token = randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000); // Aktif 1 Jam

  await db.verificationToken.deleteMany({ where: { email } });
  await db.verificationToken.create({ data: { email, token, expires } });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_APP_URL tidak ditemukan di environment variables!");
  
  const resetLink = `${baseUrl}/reset-sandi?token=${token}`;
  
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #2563eb;">Pemulihan Kata Sandi</h2>
      <p>Klik tombol di bawah untuk melanjutkan proses reset kata sandi Anda di <strong>Titik Fiksi Universe</strong>.</p>
      <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Atur Ulang Kata Sandi</a>
      <p style="font-size: 12px; color: #64748b;">Abaikan email ini jika Anda tidak merasa melakukan permintaan.</p>
    </div>
  `;

  const result = await sendMail({ to: email, subject: "Atur Ulang Kata Sandi - Titik Fiksi Universe", html: htmlContent });
  return result.success ? { success: "Tautan pemulihan telah dikirim!" } : { error: "Gagal mengirim email." };
}

// 2. FUNGSI RESET SANDI (EKSEKUSI)
export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) return { error: "Token hilang." };
  if (password.length < 6) return { error: "Kata sandi minimal 6 karakter!" };
  if (password !== confirmPassword) return { error: "Kata sandi dan konfirmasi tidak cocok!" };

  const verificationToken = await db.verificationToken.findUnique({ where: { token } });
  
  if (!verificationToken || verificationToken.expires < new Date()) {
    if (verificationToken) await db.verificationToken.delete({ where: { token } });
    return { error: "Tautan tidak valid atau sudah kedaluwarsa." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const email = verificationToken.email;

  // Update Admin jika email cocok
  const settings = await db.settings.findFirst();
  if (settings?.email === email) {
    await db.settings.update({ where: { id: settings.id }, data: { adminPassword: hashedPassword } });
  }

  // Update User/Author jika email cocok
  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    await db.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
  }

  await db.verificationToken.delete({ where: { token } });
  return { success: "Kata sandi berhasil diperbarui!" };
}
