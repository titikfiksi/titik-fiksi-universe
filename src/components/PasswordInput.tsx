"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  name: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  defaultValue?: string;
}

export default function PasswordInput({ name, placeholder, required, className, defaultValue }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        className={`${className} pr-12`} // Memastikan teks tidak menabrak ikon
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
        tabIndex={-1} // Agar saat di-Tab tidak terfokus ke ikon
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}