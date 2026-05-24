import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[#D3C3B9] font-sans text-sm font-medium tracking-wide">
        {label}
      </label>
      <input
        {...props}
        className={`w-full px-5 py-4 rounded-xl text-base bg-white text-[#1a0f0d] placeholder-gray-400 font-normal shadow-lg transition-all focus:outline-none focus:ring-3 focus:ring-[#C5A073]/40 border ${
          error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-transparent'
        }`}
      />
      {error && (
        <span className="text-red-400 text-xs font-medium mt-1">
          {error}
        </span>
      )}
    </div>
  );
}
