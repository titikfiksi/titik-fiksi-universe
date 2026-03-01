// Fungsi untuk mengubah teks menjadi URL yang aman (Slug)
export function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Hapus simbol aneh
    .replace(/[\s_-]+/g, "-") // Ganti spasi dengan tanda strip
    .replace(/^-+|-+$/g, ""); // Hapus strip di awal/akhir

  // Tambahkan 5 digit angka acak di belakangnya agar PASTI unik
  const randomString = Math.random().toString(36).substring(2, 7);
  return `${baseSlug}-${randomString}`;
}