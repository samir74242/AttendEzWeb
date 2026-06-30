import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  showBg?: boolean;
  textClassName?: string;
}

export default function Logo({
  className = '',
  size = 40,
  showText = false,
  showBg = false,
  textClassName = ''
}: LogoProps) {
  const scale = size / 512;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="select-none filter drop-shadow-md"
      >
        <defs>
          {/* Background Gradient */}
          <linearGradient id="logo-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#080e22" />
            <stop offset="50%" stopColor="#0a1a45" />
            <stop offset="100%" stopColor="#061233" />
          </linearGradient>

          {/* Stylized 'A' Gradient */}
          <linearGradient id="logo-a-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          {/* Stylized Bottom Swoosh Gradient */}
          <linearGradient id="logo-swoosh-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>

          {/* Clock Glow Filter */}
          <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Drop Shadow for the big checkmark */}
          <filter id="logo-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="6" stdDeviation="4" floodColor="#020617" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* 1. ROUNDED BACKGROUND (App-Icon style) */}
        {showBg && (
          <rect width="512" height="512" rx="112" fill="url(#logo-bg-grad)" />
        )}

        {/* GROUP CONTAINING THE ENTIRE GRAPHIC (Allows easy centering & scaling) */}
        <g id="logo-graphic">
          
          {/* 2. ANALOG CLOCK FACE (Upper Right Background) */}
          <g opacity="0.85">
            {/* Outer Clock Circle */}
            <circle
              cx="360"
              cy="180"
              r="110"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeOpacity="0.12"
            />
            <circle
              cx="360"
              cy="180"
              r="110"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeOpacity="0.18"
              strokeDasharray="4 8"
            />
            {/* Clock Ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x1 = 360 + 100 * Math.cos(rad);
              const y1 = 180 + 100 * Math.sin(rad);
              const x2 = 360 + 106 * Math.cos(rad);
              const y2 = 180 + 106 * Math.sin(rad);
              const isMajor = deg % 90 === 0;
              return (
                <line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMajor ? "#38bdf8" : "#ffffff"}
                  strokeWidth={isMajor ? "3" : "1.5"}
                  strokeOpacity={isMajor ? "0.6" : "0.3"}
                />
              );
            })}
            {/* Clock Hands */}
            <line
              x1="360"
              y1="180"
              x2="360"
              y2="120"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinecap="round"
              strokeOpacity="0.75"
            />
            <line
              x1="360"
              y1="180"
              x2="415"
              y2="180"
              stroke="#38bdf8"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeOpacity="0.85"
            />
            {/* Clock Center Pin */}
            <circle cx="360" cy="180" r="7" fill="#ffffff" />
            <circle cx="360" cy="180" r="3.5" fill="#1e293b" />
          </g>

          {/* 3. STYLIZED LETTER 'A' (Main Structure) */}
          {/* Outer Left & Right Legs of the apex */}
          <path
            d="M 256,70 L 102,390 C 88,418 116,432 138,414 L 256,175 L 374,414 C 396,432 424,418 410,390 L 256,70 Z"
            fill="url(#logo-a-grad)"
          />
          {/* Curved overlap swoop for 'A' crossbar aesthetic */}
          <path
            d="M 125,402 C 180,360 220,355 256,380 C 292,405 340,410 387,402"
            fill="none"
            stroke="url(#logo-swoosh-grad)"
            strokeWidth="32"
            strokeLinecap="round"
            opacity="0.95"
          />

          {/* 4. OVERLAID WHITE CLIPBOARD */}
          {/* Clipboard shadow */}
          <rect
            x="176"
            y="156"
            width="160"
            height="198"
            rx="20"
            fill="#020617"
            opacity="0.25"
          />
          {/* Clipboard Board Body */}
          <rect
            x="180"
            y="150"
            width="152"
            height="190"
            rx="18"
            fill="#ffffff"
          />
          {/* Clipboard Clip Header */}
          <rect
            x="226"
            y="134"
            width="60"
            height="26"
            rx="7"
            fill="#334155"
          />
          <circle
            cx="256"
            y="134"
            r="12"
            fill="none"
            stroke="#334155"
            strokeWidth="5.5"
          />
          <circle
            cx="256"
            y="134"
            r="4"
            fill="#0f172a"
          />

          {/* Checklist Rows */}
          {/* Row 1 (y = 195) */}
          <g>
            {/* User Icon Accent */}
            <circle cx="210" cy="195" r="9" fill="#94a3b8" />
            <circle cx="210" cy="191" r="4.5" fill="#ffffff" />
            <path d="M 203,201 C 203,198 217,198 217,201" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            {/* Text lines */}
            <rect x="228" y="190" width="35" height="4.5" rx="2" fill="#cbd5e1" />
            <rect x="228" y="198" width="22" height="4" rx="2" fill="#e2e8f0" />
            {/* Check icon (green) */}
            <circle cx="288" cy="195" r="11" fill="#10b981" />
            <path
              d="M 283,195 L 286.5,198 L 293,191.5"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Row 2 (y = 238) */}
          <g>
            {/* User Icon Accent */}
            <circle cx="210" cy="238" r="9" fill="#94a3b8" />
            <circle cx="210" cy="234" r="4.5" fill="#ffffff" />
            <path d="M 203,244 C 203,241 217,241 217,244" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            {/* Text lines */}
            <rect x="228" y="233" width="35" height="4.5" rx="2" fill="#cbd5e1" />
            <rect x="228" y="241" width="22" height="4" rx="2" fill="#e2e8f0" />
            {/* Check icon (green) */}
            <circle cx="288" cy="238" r="11" fill="#10b981" />
            <path
              d="M 283,238 L 286.5,241 L 293,234.5"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Row 3 (y = 281) */}
          <g>
            {/* User Icon Accent */}
            <circle cx="210" cy="281" r="9" fill="#94a3b8" />
            <circle cx="210" cy="277" r="4.5" fill="#ffffff" />
            <path d="M 203,287 C 203,284 217,284 217,287" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            {/* Text lines */}
            <rect x="228" y="276" width="35" height="4.5" rx="2" fill="#cbd5e1" />
            <rect x="228" y="284" width="22" height="4" rx="2" fill="#e2e8f0" />
            {/* Cross icon (red) */}
            <circle cx="288" cy="281" r="11" fill="#ef4444" />
            <path
              d="M 284,277 L 292,285 M 292,277 L 284,285"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* 5. DYNAMIC GIANT ACCENT CHECKMARK */}
          <path
            d="M 206,306 L 254,354 L 350,224"
            fill="none"
            stroke="#ffffff"
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#logo-shadow)"
          />
          <path
            d="M 206,306 L 254,354 L 350,224"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

        </g>
      </svg>

      {/* 6. LOGO TEXT */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-black tracking-tight text-brand-primary-text leading-none ${textClassName || 'text-2xl'}`}>
            Attend<span className="text-brand-primary">Ez</span>
          </span>
          <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-brand-secondary uppercase mt-0.5">
            STUDENT UTILITY
          </span>
        </div>
      )}
    </div>
  );
}
