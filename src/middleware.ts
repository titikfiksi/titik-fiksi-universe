import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Pastikan Secret Key ini SAMA PERSIS dengan yang ada di actions.ts
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "TF_UNIVERSE_SECRET_KEY_2026_SAFE");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_session')?.value;

  // Tentukan rute mana yang butuh penjagaan
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthorRoute = pathname.startsWith('/author');

  // Jika pengunjung mencoba masuk ke rute terlarang
  if (isAdminRoute || isAuthorRoute) {
    // 1. Jika tidak punya kunci masuk (token), lempar ke halaman login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // 2. Verifikasi keaslian kunci (token)
      const verified = await jwtVerify(token, JWT_SECRET);
      const role = verified.payload.role as string;

      // 3. Pengecekan Role (RBAC - Role Based Access Control)
      // Jika mencoba masuk /admin tapi dia bukan ADMIN (misal: AUTHOR), usir ke dashboard author
      if (isAdminRoute && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/author', request.url));
      }

      // Jika mencoba masuk /author tapi dia bukan AUTHOR atau ADMIN, usir ke login
      if (isAuthorRoute && role !== 'AUTHOR' && role !== 'ADMIN') {
         return NextResponse.redirect(new URL('/login', request.url));
      }

      // Jika lolos semua ujian, silakan lewat
      return NextResponse.next();
      
    } catch (error) {
      // Jika token dipalsukan atau sudah kedaluwarsa, bersihkan sisa cookie dan lempar ke login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('admin_session');
      return response;
    }
  }

  // Biarkan halaman publik (/beranda, /search, dll) diakses bebas
  return NextResponse.next();
}

// Optimasi performa: Middleware HANYA berjalan saat rute ini diakses
export const config = {
  matcher: ['/admin/:path*', '/author/:path*'],
};