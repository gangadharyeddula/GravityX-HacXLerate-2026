const sizeMap = {
  xs: 20,
  sm: 28,
  md: 42,
  lg: 60,
  xl: 84,
};

export default function CreatorTwinLogo({ size = 'md', variant = 'auto', showText = true, className = '' }) {
  const width = sizeMap[size] || sizeMap.md;
  const textSizeMap = {
    xs: 'text-[1rem]',
    sm: 'text-[1.25rem]',
    md: 'text-[1.5rem]',
    lg: 'text-[1.9rem]',
    xl: 'text-[2.2rem]',
  };

  const palette = variant === 'light'
    ? { primary: '#F5F5F4', accent: '#2DD4BF', secondary: '#A8A8A3' }
    : variant === 'dark'
      ? { primary: '#111111', accent: '#0F766E', secondary: '#0F766E' }
      : { primary: 'var(--ct-ink)', accent: 'var(--ct-teal)', secondary: 'var(--ct-teal)' };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`} aria-label="CreatorTwin AI logo">
      <svg width={width} height={Math.round(width * 0.58)} viewBox="0 0 180 110" role="img" aria-hidden="true">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M40 22c-17.7 0-32 14.3-32 32s14.3 32 32 32c10.4 0 19.8-4 26.7-10.7"
            stroke={palette.primary}
            strokeWidth="8.5"
          />
          <path
            d="M106 22c17.7 0 32 14.3 32 32S123.7 86 106 86c-10.4 0-19.8-4-26.7-10.7"
            stroke={palette.primary}
            strokeWidth="8.5"
          />
          <path d="M54 54h28" stroke={palette.accent} strokeWidth="8.5" />
          <path d="M85 22v64" stroke={palette.primary} strokeWidth="8.5" />
          <path d="M98 54h30" stroke={palette.secondary} strokeWidth="8.5" />
          <circle cx="85" cy="54" r="7" fill={palette.accent} />
        </g>
      </svg>

      {showText && (
        <span
          className={`font-display font-semibold tracking-[-0.08em] ${textSizeMap[size] || textSizeMap.md}`}
          style={{ color: palette.primary }}
        >
          CreatorTwin
        </span>
      )}
    </div>
  );
}
