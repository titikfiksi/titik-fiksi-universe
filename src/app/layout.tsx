import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/lib/db";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  // Default site name if db is not available
  const defaultSiteName = "Titik Fiksi Universe";
  let siteName = defaultSiteName;

  try {
    const settings = await db.settings.findFirst({
      select: { siteName: true },
    });
    if (settings?.siteName && typeof settings.siteName === "string") {
      siteName = settings.siteName.trim() || defaultSiteName;
    }
  } catch {
    // Graceful fallback - no need for noisy logging
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}