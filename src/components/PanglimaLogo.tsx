import React from 'react';

interface PanglimaLogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  badge?: string;
}

export const PanglimaLogo: React.FC<PanglimaLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  badge,
}) => {
  // Sizing definitions
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-base', subtext: 'text-[8px]', container: 'gap-2' },
    md: { icon: 'w-10 h-10', text: 'text-xl', subtext: 'text-[9px]', container: 'gap-2.5' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', subtext: 'text-[10px]', container: 'gap-3' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', subtext: 'text-[11px]', container: 'gap-3.5' },
  };

  const currentSize = sizeMap[size];

  // Cute & Premium Round Olympic Weight Plate Logo (25 KG Gold Calibrated Plate)
  const IconSvg = () => (
    <div className={`${currentSize.icon} shrink-0 relative flex items-center justify-center group-hover:rotate-12 group-hover:scale-105 transition-transform duration-500 ease-out`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_4px_16px_rgba(245,158,11,0.3)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="plateGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          <linearGradient id="plateDarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#27272A" />
            <stop offset="100%" stopColor="#09090B" />
          </linearGradient>

          <linearGradient id="chromeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#E4E4E7" />
            <stop offset="100%" stopColor="#71717A" />
          </linearGradient>

          {/* Curved path for plate top text */}
          <path id="topArcPath" d="M 22,50 A 28,28 0 1,1 78,50" />
        </defs>

        {/* Outer Rubber/Metal Plate Rim */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="url(#plateDarkGradient)"
          stroke="url(#plateGoldGradient)"
          strokeWidth="3.5"
        />

        {/* Inner Beveled Ring */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#3F3F46"
          strokeWidth="2"
        />

        {/* Gold Accent Ring */}
        <circle
          cx="50"
          cy="50"
          r="33"
          fill="none"
          stroke="url(#plateGoldGradient)"
          strokeWidth="1.5"
          opacity="0.85"
        />

        {/* Ergonomic Plate Hand-Hold Cutouts (Left & Right) */}
        <path
          d="M 22 40 A 18 18 0 0 0 22 60 L 26 57 A 13 13 0 0 1 26 43 Z"
          fill="url(#plateGoldGradient)"
        />
        <path
          d="M 78 40 A 18 18 0 0 1 78 60 L 74 57 A 13 13 0 0 0 74 43 Z"
          fill="url(#plateGoldGradient)"
        />

        {/* Center Chrome Sleeve Hub */}
        <circle
          cx="50"
          cy="50"
          r="14"
          fill="url(#chromeGradient)"
          stroke="#3F3F46"
          strokeWidth="1"
        />

        {/* Center Barbell Hole */}
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="#09090B"
        />

        {/* Embossed Text - PANGLIMA & 25 KG */}
        <text
          x="50"
          y="28"
          textAnchor="middle"
          fill="#FDE047"
          fontSize="7.5"
          fontWeight="900"
          fontFamily="sans-serif"
          letterSpacing="1.2"
        >
          PANGLIMA
        </text>

        <text
          x="50"
          y="77"
          textAnchor="middle"
          fill="#F59E0B"
          fontSize="7"
          fontWeight="800"
          fontFamily="sans-serif"
          letterSpacing="1"
        >
          25 KG
        </text>

        {/* Small Decorative Stars / Rivets */}
        <circle cx="34" cy="50" r="1.5" fill="#FDE047" />
        <circle cx="66" cy="50" r="1.5" fill="#FDE047" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center text-zinc-100 ${className}`}>
        <IconSvg />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`inline-flex items-center gap-1.5 font-black tracking-tight text-zinc-100 ${currentSize.text} ${className}`}>
        <span className="font-extrabold tracking-wider bg-gradient-to-r from-zinc-100 via-zinc-200 to-amber-400 bg-clip-text text-transparent">
          PANGLIMA
        </span>
        {badge && (
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-500 text-zinc-950 uppercase tracking-widest">
            {badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${currentSize.container} text-zinc-100 group ${className}`}>
      <IconSvg />

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-wider text-zinc-100 ${currentSize.text} uppercase font-sans group-hover:text-amber-400 transition-colors`}>
            PANGLIMA
          </span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase tracking-widest">
              {badge}
            </span>
          )}
        </div>
        <p className={`text-zinc-400 font-semibold tracking-widest uppercase mt-1 ${currentSize.subtext}`}>
          POWERLIFTING & GYM
        </p>
      </div>
    </div>
  );
};
