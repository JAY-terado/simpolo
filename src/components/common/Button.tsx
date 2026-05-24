import type { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      {...(props as any)}
      className={`w-full py-4 rounded-xl font-sans text-base font-semibold tracking-wide text-[#2B0C06] bg-gradient-to-r from-[#D9BA85] to-[#C59F67] hover:from-[#E3C89B] hover:to-[#D4B07D] shadow-lg shadow-[#1E0704]/40 transition-all cursor-pointer ${className}`}
    >
      {children}
    </motion.button>
  );
}
