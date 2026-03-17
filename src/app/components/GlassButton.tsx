import { ButtonHTMLAttributes } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function GlassButton({ children, className = '', ...props }: GlassButtonProps) {
  return (
    <button
      className={`
        relative
        px-8 py-4
        bg-white/20
        backdrop-blur-md
        border border-white/30
        rounded-2xl
        text-white
        transition-all
        duration-200
        ease-out
        
        /* Depth shadow - multiple layers for realistic depth */
        shadow-[0_8px_0_0_rgba(0,0,0,0.2),0_12px_24px_-4px_rgba(0,0,0,0.3)]
        
        /* Hover state - slight lift */
        hover:shadow-[0_10px_0_0_rgba(0,0,0,0.2),0_16px_32px_-4px_rgba(0,0,0,0.35)]
        hover:-translate-y-0.5
        
        /* Active state - compression effect */
        active:shadow-[0_2px_0_0_rgba(0,0,0,0.2),0_4px_12px_-2px_rgba(0,0,0,0.25)]
        active:translate-y-2
        
        /* Inner highlight for glass effect */
        before:content-['']
        before:absolute
        before:inset-0
        before:rounded-2xl
        before:bg-gradient-to-b
        before:from-white/20
        before:to-transparent
        before:pointer-events-none
        
        ${className}
      `}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
