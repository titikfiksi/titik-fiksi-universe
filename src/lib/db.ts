import { PrismaClient } from '@prisma/client';

// Menggunakan globalThis agar lebih stabil di lingkungan Next.js / Vercel
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Menggunakan koneksi yang sudah ada jika ada, atau membuat baru jika belum ada
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Opsional: aktifkan log query hanya di mode development untuk melacak aktivitas
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Mencegah pembuatan koneksi baru secara berulang setiap kali file disave di mode Development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;