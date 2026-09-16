export function Logo({ size = 88 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9adcac" />
          <stop offset="100%" stopColor="#296e43" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#logo-gradient)" />
      <path
        d="M20 34 L28 42 L44 24"
        stroke="white"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
