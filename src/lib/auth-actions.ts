"use server";

import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

// ==============================================================
// 1. FUNGSI UNTUK MEMINTA TAUTAN RESET (LUPA SANDI)
// ==============================================================
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;
  
  if (!email) {
    return { error: "Email wajib diisi!" };
  }

  const settings = await db.settings.findFirst();
  const user = await db.user.findUnique({ where: { email } });

  const isAdmin = settings?.email === email;
  const isAuthor = !!user;

  if (!isAdmin && !isAuthor) {
    return { error: "Alamat email tidak terdaftar di sistem kami." };
  }

  const token = randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 Jam

  await db.verificationToken.deleteMany({ where: { email } });
  await db.verificationToken.create({
    data: { email, token, expires },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-sandi?token=${token}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #111827; margin: 0; font-size: 24px; font-weight: 900;">Titik Fiksi <span style="color: #2563eb;">Universe</span></h2>
      </div>
      <div style="background-color: #f9fafb; padding: 24px; border-radius: 12px; text-align: center;">
        <h3 style="color: #1f2937; margin-top: 0;">Permintaan Reset Kata Sandi</h3>
        <p style="color: #4b5563; line-height: 1.6;">Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Jika ini memang Anda, silakan klik tombol di bawah ini. Tautan ini hanya berlaku selama <b>1 Jam</b>.</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 16px;">Atur Ulang Sandi Saya</a>
        <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini. Akun Anda tetap aman.</p>
      </div>
    </div>
  `;

  const mailResult = await sendMail({
    to: email,
    subject: "Reset Kata Sandi - Titik Fiksi Universe",
    html: htmlContent,
  });

  if (!mailResult.success) {
    return { error: "Gagal mengirim email. Pastikan pengaturan email admin sudah benar." };
  }

  return { success: "Tautan pemulihan telah dikirim ke email Anda!" };
}

// ==============================================================
// 2. FUNGSI UNTUK MENGUBAH KATA SANDI (RESET SANDI)
// ==============================================================
export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) return { error: "Token tidak valid atau hilang." };
  if (password.length < 6) return { error: "Kata sandi minimal 6 karakter!" };
  if (password !== confirmPassword) return { error: "Kata sandi dan konfirmasi tidak cocok!" };

  // Cari token di database
  const verificationToken = await db.verificationToken.findUnique({ where: { token } });
  
  if (!verificationToken) {
    return { error: "Tautan pemulihan tidak valid." };
  }

  // Cek apakah token sudah kedaluwarsa (lebih dari 1 jam)
  if (verificationToken.expires < new Date()) {
    await db.verificationToken.delete({ where: { token } });
    return { error: "Tautan pemulihan sudah kedaluwarsa. Silakan minta ulang." };
  }

  // Enkripsi password baru
  const hashedPassword = await bcrypt.hash(password, 10);
  const email = verificationToken.email;

  // Update Sandi Admin (Jika email cocok)
  const settings = await db.settings.findFirst();
  if (settings?.email === email) {
    await db.settings.update({
      where: { id: settings.id },
      data: { adminPassword: hashedPassword }
    });
  }

  // Update Sandi Penulis (Jika email cocok)
  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    await db.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
  }

  // Hapus token agar tidak bisa dipakai 2 kali
  await db.verificationToken.delete({ where: { token } });

  return { success: "Kata sandi berhasil diubah! Silakan masuk dengan sandi baru Anda." };
}