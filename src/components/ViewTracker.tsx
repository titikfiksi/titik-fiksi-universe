"use client";

import { useEffect, useRef } from "react";
import { incrementNovelViews } from "@/lib/actions";

export default function ViewTracker({ novelId }: { novelId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    // Pastikan view hanya dihitung 1 kali setiap halamannya dimuat
    if (!tracked.current) {
      incrementNovelViews(novelId);
      tracked.current = true;
    }
  }, [novelId]);

  return null; // Komponen ini tidak terlihat di layar (Invisible)
}