import type { Metadata, Viewport } from "next"; 
import { Inter } from "next/font/google";
import "./globals.css";

// PERHATIKAN BARIS INI: Kita memanggil Header dan Footer
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/lib/db"; // Tambahan: Import DB untuk menarik data Setting

const inter = Inter({ subsets: ["latin"] });

// SINKRONISASI: Menarik Site Name dari Database untuk Tab Browser
export async function generateMetadata(): Promise<Metadata> {
  const settings = await db.settings.findFirst();
  const siteName = settings?.siteName || "Titik Fiksi Universe";

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: "Platform baca novel modern, ringan, dan elegan.",
    manifest: "/manifest.webmanifest", 
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff", 
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, 
  userScalable: false, 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="overflow-x-hidden">
      <body className={`${inter.className} bg-gray-50 text-gray-900 w-full overflow-x-hidden antialiased flex flex-col min-h-screen`}>
        
        <Header />
        
        <main className="flex-grow w-full">{children}</main>
        
        <Footer />
      </body>
    </html>
  );
}