import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'sepia';

interface ReaderState {
  // Pengaturan Tampilan
  theme: Theme;
  fontSize: number;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  
  // Sistem Bookmark (Fitur Novel)
  bookmarks: string[]; // Menyimpan daftar ID Novel
  toggleBookmark: (id: string) => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      // Default Settings
      theme: 'sepia',
      fontSize: 18,
      bookmarks: [],

      // Actions
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      
      toggleBookmark: (id) => set((state) => ({
        bookmarks: state.bookmarks.includes(id)
          ? state.bookmarks.filter((b) => b !== id) // Hapus jika sudah ada
          : [...state.bookmarks, id] // Tambah jika belum ada
      })),
    }),
    {
      name: 'tf-universe-storage', // Kunci penyimpanan tunggal di Browser
    }
  )
);