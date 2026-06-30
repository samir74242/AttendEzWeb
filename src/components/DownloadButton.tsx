import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import { useDownload } from '../context/DownloadContext';

interface Ripple {
  x: number;
  y: number;
  id: number;
}

interface DownloadButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function DownloadButton({
  children,
  className = '',
  ariaLabel = 'Download AttendEz APK',
  onClick,
  ...props
}: DownloadButtonProps) {
  const { isDownloading, triggerDownload } = useDownload();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 1. Calculate coordinate for ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    // Cleanup ripple
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    // Call custom onClick if provided by parent
    if (onClick) {
      onClick(e);
    }

    // 2. Trigger global download
    triggerDownload();
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={isDownloading}
      className={`relative overflow-hidden cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${className}`}
      aria-label={ariaLabel}
      role="button"
      {...props}
    >
      {/* Ripple render */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/25 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 100,
            height: 100,
          }}
        />
      ))}

      {/* Button content based on loading state */}
      <div className="flex items-center justify-center gap-2.5 w-full h-full">
        {isDownloading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-current"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Downloading...</span>
          </>
        ) : (
          children || (
            <>
              <Download className="w-5 h-5" />
              <span>Download APK (20MB)</span>
            </>
          )
        )}
      </div>
    </motion.button>
  );
}
