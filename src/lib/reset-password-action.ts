"use server";

import { redirect } from "next/navigation";
import { resetPassword } from "@/lib/auth-actions";

export type MessageType = { type: "success" | "error"; text: string } | null;

export async function resetSandiAction(
  prevState: { message: MessageType },
  formData: FormData
): Promise<{ message: MessageType }> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const urlToken = formData.get("token") as string | null;

  if (!urlToken) {
    return {
      message: { type: "error", text: "Token pemulihan tidak ditemukan." },
    };
  }

  if (password !== confirmPassword) {
    return {
      message: { type: "error", text: "Kata sandi dan konfirmasi tidak cocok!" },
    };
  }

  // Menggunakan fungsi asli Anda dari auth-actions
  const result = await resetPassword(formData);

  if (result.error) {
    return {
      message: { type: "error", text: result.error },
    };
  }
  
  if (result.success) {
    redirect(`/login?resetSuccess=1`);
  }
  
  return {
    message: { type: "error", text: "Terjadi kesalahan sistem." },
  };
}
