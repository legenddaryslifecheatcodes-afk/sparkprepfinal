// Circular "seal" badge for the hero, styled like a wax-stamp guarantee mark.
// Deliberately NOT worded as a cash refund -- and deliberately NOT worded as
// "free reupload" either, since that's already standard on every order
// regardless of this guarantee (you catch an issue via SparkPrep's own
// checks, fix it, reupload free -- that's just how the product works). The
// guarantee is narrower and specifically about SparkPrep's OWN failure: if
// its checks miss a real compliance issue and a distributor rejects the
// book for it, SparkPrep fixes that issue itself and re-exports -- free.
export default function GuaranteeSeal({ size = 168, className = "" }) {
  const cx = 100, cy = 100, topR = 76, bottomR = 76;
  const topPath = `M 24,${cy} A ${topR},${topR} 0 0 1 176,${cy}`;
  const bottomPath = `M 176,${cy} A ${bottomR},${bottomR} 0 0 1 24,${cy}`;
  const uid = "seal";

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="SparkPrep Guarantee: if we miss a real compliance issue, we fix it and re-export free"
      data-testid="guarantee-seal"
    >
      <defs>
        <path id={`${uid}-top`} d={topPath} fill="none" />
        <path id={`${uid}-bottom`} d={bottomPath} fill="none" />
        <radialGradient id={`${uid}-bg`} cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#161207" />
          <stop offset="100%" stopColor="#0A0A0A" />
        </radialGradient>
        <linearGradient id={`${uid}-gold`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5E6B0" />
          <stop offset="55%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#A47A1E" />
        </linearGradient>
      </defs>

      {/* Scalloped outer edge, like a wax seal */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={cx + Math.cos(a) * 94}
            cy={cy + Math.sin(a) * 94}
            r="7"
            fill={`url(#${uid}-gold)`}
          />
        );
      })}

      <circle cx={cx} cy={cy} r="86" fill={`url(#${uid}-bg)`} stroke={`url(#${uid}-gold)`} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="78" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />

      <text fill="#D4AF37" fontSize="11.5" fontWeight="700" letterSpacing="2.2" fontFamily="'JetBrains Mono', monospace">
        <textPath href={`#${uid}-top`} startOffset="50%" textAnchor="middle">
          SPARKPREP GUARANTEE
        </textPath>
      </text>
      <text fill="#D4AF37" fontSize="10" fontWeight="700" letterSpacing="1.6" fontFamily="'JetBrains Mono', monospace" opacity="0.9">
        <textPath href={`#${uid}-bottom`} startOffset="50%" textAnchor="middle">
          FIXED & RE-EXPORTED FREE
        </textPath>
      </text>

      {/* Shield + check, center */}
      <g transform="translate(100, 84)">
        <path
          d="M0,-24 L20,-16 V4 C20,20 10,30 0,34 C-10,30 -20,20 -20,4 V-16 Z"
          fill="none"
          stroke={`url(#${uid}-gold)`}
          strokeWidth="2.5"
        />
        <path d="M-9,0 L-2,8 L11,-10" fill="none" stroke={`url(#${uid}-gold)`} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <text x="100" y="142" textAnchor="middle" fill="#F5E6B0" fontSize="11.5" fontWeight="800" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.5">
        OUR MISS.
      </text>
      <text x="100" y="156" textAnchor="middle" fill="#F5E6B0" fontSize="11.5" fontWeight="800" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.5">
        OUR FIX.
      </text>
    </svg>
  );
}
