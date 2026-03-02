// src/lib/auth-config.ts

// Mengambil kunci rahasia dari environment variables (.env atau Vercel Settings)
const secretKey = process.env.JWT_SECRET;

// Validasi Keamanan Lapis Pertama (Mencegah Hardcoded Fallback)
if (!secretKey) {
  throw new Error("PENGAMANAN SISTEM: JWT_SECRET tidak ditemukan di environment variables! Harap atur variabel lingkungan ini sebelum menjalankan aplikasi.");
}

// Mengekspor kunci rahasia yang sudah dienkripsi agar siap digunakan oleh library 'jose'
export const JWT_SECRET = new TextEncoder().encode(secretKey);