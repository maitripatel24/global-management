export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden>
      <rect width="512" height="512" rx="96" fill="#0f172a" />
      <text
        x="256"
        y="228"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="300"
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
      >
        A
      </text>
      <rect x="176" y="336" width="160" height="16" rx="8" fill="#fbbf24" />
    </svg>
  );
}
