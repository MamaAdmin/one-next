/**
 * One-Next styled Smart Sailboat illustration.
 * Monochrome, semantic-token driven SVG — matches the warm cream / graphite
 * primary palette defined in index.css. No hardcoded colors.
 */
export function SailboatIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 420"
      role="img"
      aria-label="Smart Sailboat: Wind, Hafen, Anker, Eisberg"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sky */}
      <rect x="0" y="0" width="640" height="230" className="fill-muted" />
      {/* Sea */}
      <rect x="0" y="230" width="640" height="190" className="fill-secondary" />

      {/* Waterline */}
      <path
        d="M0,230 Q40,222 80,230 T160,230 T240,230 T320,230 T400,230 T480,230 T560,230 T640,230 V240 H0 Z"
        className="fill-background/70"
      />

      {/* Hafen / Island (left) */}
      <g className="fill-primary">
        <ellipse cx="70" cy="232" rx="80" ry="10" className="fill-primary/70" />
        <path d="M30,232 Q50,200 90,205 Q130,210 140,232 Z" />
      </g>
      {/* Palm trunks */}
      <g className="stroke-primary" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M70,232 Q66,200 62,170" />
        <path d="M95,232 Q100,205 108,180" />
      </g>
      {/* Palm leaves */}
      <g className="fill-primary">
        <path d="M62,170 Q40,158 30,168 Q48,168 60,178 Z" />
        <path d="M62,170 Q84,158 96,168 Q76,168 64,178 Z" />
        <path d="M62,170 Q60,152 72,146 Q68,160 68,174 Z" />
        <path d="M108,180 Q86,168 76,178 Q94,180 106,188 Z" />
        <path d="M108,180 Q130,168 142,180 Q122,180 110,188 Z" />
        <path d="M108,180 Q108,160 120,154 Q114,168 114,182 Z" />
      </g>
      <text
        x="30"
        y="120"
        className="fill-primary"
        style={{ font: "600 13px ui-sans-serif, system-ui", letterSpacing: "0.14em" }}
      >
        HAFEN
      </text>

      {/* Wind clouds (top right) */}
      <g className="fill-background">
        <ellipse cx="470" cy="80" rx="42" ry="20" />
        <ellipse cx="500" cy="70" rx="30" ry="16" />
        <ellipse cx="540" cy="95" rx="38" ry="18" />
      </g>
      {/* Wind lines */}
      <g className="stroke-primary/60" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M430,120 Q400,130 380,150" />
        <path d="M470,130 Q450,145 435,165" />
        <path d="M520,130 Q510,150 500,170" />
      </g>
      <text
        x="546"
        y="70"
        className="fill-primary"
        style={{ font: "600 13px ui-sans-serif, system-ui", letterSpacing: "0.14em" }}
      >
        WIND
      </text>

      {/* Boat */}
      <g>
        {/* Mast */}
        <line x1="300" y1="230" x2="300" y2="110" className="stroke-primary" strokeWidth="2.5" />
        {/* Main sail */}
        <path d="M300,115 L300,215 L360,215 Z" className="fill-primary" />
        {/* Front sail */}
        <path d="M300,120 L300,210 L252,210 Z" className="fill-primary/80" />
        {/* Sail seams */}
        <g className="stroke-background/60" strokeWidth="1.2" fill="none">
          <path d="M305,140 L352,213" />
          <path d="M305,165 L348,213" />
          <path d="M305,190 L342,213" />
        </g>
        {/* Hull */}
        <path
          d="M235,220 L370,220 L345,252 L260,252 Z"
          className="fill-primary"
        />
        <line x1="240" y1="228" x2="365" y2="228" className="stroke-background/40" strokeWidth="1" />
      </g>

      {/* Anchor line */}
      <path
        d="M320,252 Q328,300 340,350"
        className="stroke-primary/70"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="3 3"
      />
      {/* Anchor */}
      <g className="fill-primary" transform="translate(328 348)">
        <circle cx="12" cy="0" r="3.5" />
        <rect x="10.5" y="3" width="3" height="22" rx="1.5" />
        <rect x="2" y="12" width="20" height="3" rx="1.5" />
        <path d="M2,20 Q2,32 12,32 Q22,32 22,20 L18,20 Q18,28 12,28 Q6,28 6,20 Z" />
      </g>
      <text
        x="355"
        y="365"
        className="fill-primary-foreground"
        style={{ font: "600 12px ui-sans-serif, system-ui", letterSpacing: "0.14em" }}
      >
        ANKER
      </text>

      {/* Eisberg (submerged rocks bottom-left) */}
      <g className="fill-primary">
        <path d="M40,420 L40,340 L110,270 L165,320 L200,300 L235,360 L235,420 Z" />
        <path d="M110,270 L140,310 L165,320 Z" className="fill-primary/70" />
        <path d="M40,340 L80,370 L110,340 Z" className="fill-primary/70" />
      </g>
      <text
        x="70"
        y="390"
        className="fill-primary-foreground"
        style={{ font: "600 12px ui-sans-serif, system-ui", letterSpacing: "0.14em" }}
      >
        EISBERG
      </text>

      {/* subtle underwater texture */}
      <g className="stroke-background/30" strokeWidth="1" fill="none">
        <path d="M260,290 Q290,285 320,290" />
        <path d="M420,320 Q450,315 480,320" />
        <path d="M120,380 Q160,375 200,380" />
      </g>
    </svg>
  );
}

export default SailboatIllustration;
