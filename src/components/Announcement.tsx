import { db } from "@/lib/db";

export default async function Announcement() {
  const settings = await db.settings.findFirst();

  // Jika tidak ada data atau dimatikan (isActive = false), jangan tampilkan apa-apa
  if (!settings || !settings.isActive || !settings.runningText) return null;

  return (
    <div className="bg-[var(--primary)] text-white text-xs md:text-sm py-2 px-4 text-center font-medium relative z-50">
      <p className="animate-pulse">{settings.runningText}</p>
    </div>
  );
}