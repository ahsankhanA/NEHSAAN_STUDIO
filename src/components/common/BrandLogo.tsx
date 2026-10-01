import React from 'react';

/**
 * Clean, sharp vector clothing Hanger Logo
 * Specially designed for fashion & haute couture branding on Retina/High-DPI displays
 */
export const HangerIcon: React.FC<{ size?: number; className?: string; color?: string }> = ({
  size = 32,
  className = '',
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 transition-transform ${className}`}
    style={{ shapeRendering: 'geometricPrecision' }}
    aria-label="MaNHSaaN clothing Hanger Logo"
  >
    <defs>
      <linearGradient id="hangerGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FBF0B9" />
        <stop offset="25%" stopColor="#DFB76C" />
        <stop offset="50%" stopColor="#F3DC9B" />
        <stop offset="75%" stopColor="#C5A059" />
        <stop offset="100%" stopColor="#9E782F" />
      </linearGradient>
    </defs>

    {/* Elegant Hook Swirl */}
    <path
      d="M 36 14 C 36 10.5 33.5 7 29 7 C 24 7 21 11 21 16 C 21 22.5 28 25.5 32 28.5 L 32 31"
      stroke={color === 'gold' ? 'url(#hangerGoldGrad)' : color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Hook Tip Accent */}
    <circle
      cx="36"
      cy="13.5"
      r="1.25"
      fill={color === 'gold' ? 'url(#hangerGoldGrad)' : color}
    />

    {/* Swivel Ring / Apex */}
    <circle
      cx="32"
      cy="32"
      r="1.75"
      fill={color === 'gold' ? 'url(#hangerGoldGrad)' : color}
    />

    {/* Hanger Shoulder Slopes & Trouser Rail */}
    <path
      d="M 32 33 L 8 47.5 C 5.5 49 6.5 52.5 9.5 52.5 L 54.5 52.5 C 57.5 52.5 58.5 49 56 47.5 Z"
      stroke={color === 'gold' ? 'url(#hangerGoldGrad)' : color}
      strokeWidth="2.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    />

    {/* Slender Inner Crossbar Notch */}
    <line
      x1="13"
      y1="49.5"
      x2="51"
      y2="49.5"
      stroke={color === 'gold' ? 'url(#hangerGoldGrad)' : color}
      strokeWidth="1.2"
      strokeOpacity="0.8"
    />
  </svg>
);

export const NEmblem = HangerIcon;

interface BrandLogoProps {
  className?: string;
  variant?: 'dark' | 'light' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showEmblem?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
  showEmblem = true,
}) => {
  const sizeStyles = {
    sm: {
      hanger: 24,
      text: 'text-xl tracking-[0.18em]',
      subtitle: 'text-[8.5px] tracking-[0.26em]',
      line: 'w-6',
      gap: 'gap-0.5',
    },
    md: {
      hanger: 30,
      text: 'text-2xl md:text-3xl tracking-[0.2em]',
      subtitle: 'text-[9.5px] tracking-[0.28em]',
      line: 'w-10',
      gap: 'gap-1',
    },
    lg: {
      hanger: 38,
      text: 'text-3xl md:text-4xl tracking-[0.22em]',
      subtitle: 'text-[11px] tracking-[0.3em]',
      line: 'w-14',
      gap: 'gap-1.5',
    },
    xl: {
      hanger: 48,
      text: 'text-4xl md:text-5xl tracking-[0.25em]',
      subtitle: 'text-[12px] tracking-[0.35em]',
      line: 'w-18',
      gap: 'gap-2',
    },
  }[size];

  const colors = {
    dark: {
      text: 'text-stone-900',
      hanger: '#1c1917',
      star: 'text-amber-700',
      line: 'bg-gradient-to-r from-transparent via-amber-700/40 to-transparent',
      subtitle: 'text-stone-500',
    },
    light: {
      text: 'text-stone-50',
      hanger: '#FAF8F5',
      star: 'text-amber-400',
      line: 'bg-gradient-to-r from-transparent via-amber-400/50 to-transparent',
      subtitle: 'text-stone-300',
    },
    gold: {
      text: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700',
      hanger: 'gold',
      star: 'text-amber-500',
      line: 'bg-gradient-to-r from-transparent via-amber-500/60 to-transparent',
      subtitle: 'text-amber-600/90',
    },
  }[variant];

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none text-left ${sizeStyles.gap} ${className}`}>
      {/* Brand Header: [HANGER LOGO] MaNHSaaN clothing */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {showEmblem && (
          <div className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <HangerIcon size={sizeStyles.hanger} color={colors.hanger} />
          </div>
        )}
        <div className="flex flex-col">
          <span
            className={`font-serif font-bold tracking-[0.16em] transition-colors leading-tight ${sizeStyles.text} ${colors.text}`}
            style={{ fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" }}
          >
            MaNHSaaN
          </span>
          {showSubtitle && (
            <span
              className={`font-sans uppercase font-bold text-[8.5px] sm:text-[10px] tracking-[0.24em] ${colors.subtitle} -mt-0.5`}
            >
              clothing
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
