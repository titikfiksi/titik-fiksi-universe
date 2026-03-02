import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { db } from "@/lib/db";

// MEMANGGIL KEMBALI KOMPONEN HEADER & FOOTER
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

// ======================================================================
// PERBAIKAN: Sabuk Pengaman Metadata (Graceful Degradation)
// ======================================================================
export async function generateMetadata(): Promise<Metadata> {
  let siteName = "Titik Fiksi Universe"; // Nama default jika database lambat
  
  try {
    const settings = await db.settings.findFirst({ 
      select: { siteName: true } 
    });
    if (settings?.siteName) {
      siteName = settings.siteName;
    }
  } catch (error) {
    console.error("Warning: Database sibuk, menggunakan nama website default.");
  }
  
  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: "Platform membaca dan menulis novel digital terbaik.",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        
        {/* MENAMPILKAN HEADER GLOBAL */}
        <Header />
        
        {/* KONTEN HALAMAN (BERANDA, ADMIN, DLL) */}
        {children}

        {/* MENAMPILKAN FOOTER GLOBAL */}
        <Footer />

      </body>
    </html>
  );
}