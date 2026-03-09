import { FC } from "react";

const Loading: FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
    <section
      className="flex flex-col items-center gap-4"
      aria-label="Loading state"
    >
      <div className="relative w-16 h-16 flex items-center justify-center">
        <span
          className="absolute inset-0 border-4 border-blue-100 rounded-full"
          aria-hidden="true"
        />
        <span
          className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"
          aria-hidden="true"
        />
        <span className="font-black text-blue-600 text-sm select-none">
          TF
        </span>
      </div>
      <p className="text-sm font-bold text-gray-500 animate-pulse tracking-widest">
        MEMBACA MANTRA...
      </p>
    </section>
  </div>
);

export default Loading;