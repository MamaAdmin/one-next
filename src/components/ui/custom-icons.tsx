import { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export const StarburstIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {Array.from({ length: 16 }).map((_, i) => {
      const angle = (i * 360) / 16;
      const x1 = 50 + Math.cos((angle * Math.PI) / 180) * 20;
      const y1 = 50 + Math.sin((angle * Math.PI) / 180) * 20;
      const x2 = 50 + Math.cos((angle * Math.PI) / 180) * 45;
      const y2 = 50 + Math.sin((angle * Math.PI) / 180) * 45;
      return (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      );
    })}
  </svg>
);

export const ArrowsOutIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Top arrow */}
    <line x1="50" y1="50" x2="50" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="10" x2="42" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="10" x2="58" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Right arrow */}
    <line x1="50" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="90" y1="50" x2="82" y2="42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="90" y1="50" x2="82" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Bottom arrow */}
    <line x1="50" y1="50" x2="50" y2="90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="90" x2="42" y2="82" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="90" x2="58" y2="82" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Left arrow */}
    <line x1="50" y1="50" x2="10" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="10" y1="50" x2="18" y2="42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="10" y1="50" x2="18" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const GridIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Vertical lines */}
    <line x1="25" y1="20" x2="25" y2="80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="75" y1="20" x2="75" y2="80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Horizontal lines */}
    <line x1="20" y1="35" x2="80" y2="35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="20" y1="65" x2="80" y2="65" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Corner dots */}
    <circle cx="25" cy="35" r="3" fill="currentColor" />
    <circle cx="75" cy="35" r="3" fill="currentColor" />
    <circle cx="25" cy="65" r="3" fill="currentColor" />
    <circle cx="75" cy="65" r="3" fill="currentColor" />
  </svg>
);

export const BracketsIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Left bracket */}
    <path
      d="M 35 20 L 25 20 L 25 80 L 35 80"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    
    {/* Right bracket */}
    <path
      d="M 65 20 L 75 20 L 75 80 L 65 80"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    
    {/* Center dots */}
    <line x1="42" y1="35" x2="58" y2="35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="42" y1="50" x2="58" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="42" y1="65" x2="58" y2="65" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const MessageIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Message box outline */}
    <path
      d="M 20 25 L 80 25 L 80 65 L 55 65 L 45 75 L 45 65 L 20 65 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    
    {/* Message lines */}
    <line x1="30" y1="40" x2="70" y2="40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="30" y1="52" x2="60" y2="52" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const TargetIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Outer circle */}
    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2.5" fill="none" />
    {/* Middle circle */}
    <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
    {/* Center dot */}
    <circle cx="50" cy="50" r="6" fill="currentColor" />
    {/* Crosshairs */}
    <line x1="50" y1="10" x2="50" y2="25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="75" x2="50" y2="90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="10" y1="50" x2="25" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="75" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const LightbulbIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Bulb top */}
    <path
      d="M 35 45 Q 35 25 50 20 Q 65 25 65 45 Q 70 55 65 65 L 35 65 Q 30 55 35 45 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Base lines */}
    <line x1="38" y1="68" x2="62" y2="68" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="40" y1="73" x2="60" y2="73" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="42" y1="78" x2="58" y2="78" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Light rays */}
    <line x1="50" y1="10" x2="50" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="28" y1="22" x2="33" y2="27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="72" y1="22" x2="67" y2="27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const SparklesIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Large sparkle */}
    <line x1="50" y1="20" x2="50" y2="45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="55" x2="50" y2="80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="25" y1="50" x2="45" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="55" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="33" y1="33" x2="44" y2="44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="56" y1="56" x2="67" y2="67" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="67" y1="33" x2="56" y2="44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="44" y1="56" x2="33" y2="67" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Small sparkles */}
    <circle cx="75" cy="25" r="2" fill="currentColor" />
    <circle cx="25" cy="75" r="2" fill="currentColor" />
    <circle cx="80" cy="70" r="2" fill="currentColor" />
  </svg>
);

export const ClockIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Clock circle */}
    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2.5" fill="none" />
    {/* Clock hands */}
    <line x1="50" y1="50" x2="50" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="50" x2="65" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Center dot */}
    <circle cx="50" cy="50" r="3" fill="currentColor" />
    {/* Hour markers */}
    <line x1="50" y1="15" x2="50" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="85" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="85" x2="50" y2="80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="15" y1="50" x2="20" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const UsersIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Left person */}
    <circle cx="35" cy="35" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <path
      d="M 20 70 Q 20 50 35 50 Q 50 50 50 70"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Right person */}
    <circle cx="65" cy="35" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <path
      d="M 50 70 Q 50 50 65 50 Q 80 50 80 70"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const RocketIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Rocket body */}
    <path
      d="M 50 15 L 65 50 L 60 70 L 50 75 L 40 70 L 35 50 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Window */}
    <circle cx="50" cy="35" r="6" stroke="currentColor" strokeWidth="2.5" fill="none" />
    {/* Left fin */}
    <path
      d="M 35 50 L 25 55 L 30 65 L 40 60"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Right fin */}
    <path
      d="M 65 50 L 75 55 L 70 65 L 60 60"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Flames */}
    <line x1="45" y1="75" x2="42" y2="85" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="75" x2="50" y2="88" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="55" y1="75" x2="58" y2="85" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const ChartIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Axes */}
    <line x1="20" y1="80" x2="80" y2="80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="20" y1="80" x2="20" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Chart line */}
    <path
      d="M 25 70 L 35 60 L 45 50 L 55 40 L 65 30 L 75 25"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Data points */}
    <circle cx="25" cy="70" r="3" fill="currentColor" />
    <circle cx="35" cy="60" r="3" fill="currentColor" />
    <circle cx="45" cy="50" r="3" fill="currentColor" />
    <circle cx="55" cy="40" r="3" fill="currentColor" />
    <circle cx="65" cy="30" r="3" fill="currentColor" />
    <circle cx="75" cy="25" r="3" fill="currentColor" />
  </svg>
);

export const BrainIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Brain outline */}
    <path
      d="M 35 30 Q 25 30 25 40 Q 25 50 30 55 Q 25 60 25 70 Q 25 80 35 80 L 65 80 Q 75 80 75 70 Q 75 60 70 55 Q 75 50 75 40 Q 75 30 65 30"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Brain divisions */}
    <line x1="50" y1="30" x2="50" y2="80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 35 45 Q 40 50 35 55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M 65 45 Q 60 50 65 55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M 35 60 Q 40 65 35 70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M 65 60 Q 60 65 65 70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const BuildingIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Building outline */}
    <rect x="30" y="30" width="40" height="50" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {/* Windows - top row */}
    <rect x="38" y="38" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="54" y="38" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Windows - middle row */}
    <rect x="38" y="52" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="54" y="52" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Door */}
    <rect x="42" y="66" width="16" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {/* Base line */}
    <line x1="25" y1="80" x2="75" y2="80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const ShieldIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Shield outline */}
    <path
      d="M 50 20 L 75 30 L 75 50 Q 75 70 50 85 Q 25 70 25 50 L 25 30 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Check mark */}
    <path
      d="M 40 52 L 47 60 L 62 42"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const CpuIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* CPU outline */}
    <rect x="35" y="35" width="30" height="30" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {/* Inner chip */}
    <rect x="42" y="42" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Pins - top */}
    <line x1="42" y1="35" x2="42" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="35" x2="50" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="58" y1="35" x2="58" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Pins - bottom */}
    <line x1="42" y1="65" x2="42" y2="72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="50" y1="65" x2="50" y2="72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="58" y1="65" x2="58" y2="72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Pins - left */}
    <line x1="35" y1="42" x2="28" y2="42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="35" y1="50" x2="28" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="35" y1="58" x2="28" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Pins - right */}
    <line x1="65" y1="42" x2="72" y2="42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="65" y1="50" x2="72" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="65" y1="58" x2="72" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const GraduationCapIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Cap top */}
    <path
      d="M 20 45 L 50 35 L 80 45 L 50 55 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Cap base */}
    <path
      d="M 30 50 L 30 60 Q 30 70 50 75 Q 70 70 70 60 L 70 50"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Tassel */}
    <line x1="80" y1="45" x2="80" y2="60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="80" cy="63" r="3" fill="currentColor" />
  </svg>
);

export const ScaleIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Scale beam */}
    <line x1="25" y1="40" x2="75" y2="40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Center post */}
    <line x1="50" y1="40" x2="50" y2="75" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Base */}
    <line x1="35" y1="75" x2="65" y2="75" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Left pan */}
    <path
      d="M 25 40 L 22 50 L 35 50 L 32 40"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Right pan */}
    <path
      d="M 75 40 L 72 50 L 85 50 L 82 40"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const PenIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Pen body */}
    <path
      d="M 70 25 L 75 30 L 40 65 L 30 70 L 35 60 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Pen tip */}
    <line x1="35" y1="60" x2="40" y2="65" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Ink mark */}
    <circle cx="30" cy="70" r="2" fill="currentColor" />
    <circle cx="26" cy="74" r="2" fill="currentColor" />
    <circle cx="34" cy="74" r="2" fill="currentColor" />
  </svg>
);

export const DocumentIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Document outline */}
    <path
      d="M 30 20 L 60 20 L 75 35 L 75 80 L 30 80 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Folded corner */}
    <path
      d="M 60 20 L 60 35 L 75 35"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Lines */}
    <line x1="40" y1="50" x2="65" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="60" x2="65" y2="60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="70" x2="55" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CompassIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Compass circle */}
    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2.5" fill="none" />
    {/* Compass needle */}
    <path
      d="M 50 25 L 60 50 L 50 75 L 40 50 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Center dot */}
    <circle cx="50" cy="50" r="3" fill="currentColor" />
    {/* North marker */}
    <line x1="50" y1="15" x2="50" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const LayersIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Top layer */}
    <path d="M 25 35 L 50 25 L 75 35 L 50 45 Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Middle layer */}
    <path d="M 25 50 L 50 40 L 75 50 L 50 60 Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Bottom layer */}
    <path d="M 25 65 L 50 55 L 75 65 L 50 75 Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const SettingsIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    {/* Gear circle */}
    <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="2.5" fill="none" />
    {/* Gear teeth */}
    <rect x="47" y="20" width="6" height="10" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="70" y="33" width="10" height="6" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="70" y="61" width="10" height="6" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="47" y="70" width="6" height="10" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="20" y="61" width="10" height="6" stroke="currentColor" strokeWidth="2" fill="none" />
    <rect x="20" y="33" width="10" height="6" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Center hole */}
    <circle cx="50" cy="50" r="5" stroke="currentColor" strokeWidth="2.5" fill="none" />
  </svg>
);

// LMS-specific Icons
export const BookIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect x="25" y="20" width="50" height="60" rx="2" 
      stroke="currentColor" strokeWidth="2.5" fill="none" />
    <line x1="35" y1="35" x2="65" y2="35" stroke="currentColor" strokeWidth="2" />
    <line x1="35" y1="45" x2="65" y2="45" stroke="currentColor" strokeWidth="2" />
    <line x1="35" y1="55" x2="55" y2="55" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const LessonIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect x="20" y="30" width="60" height="40" rx="2" 
      stroke="currentColor" strokeWidth="2.5" fill="none" />
    <line x1="30" y1="45" x2="70" y2="45" stroke="currentColor" strokeWidth="2" />
    <line x1="30" y1="55" x2="70" y2="55" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const QuizIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <line x1="50" y1="35" x2="50" y2="50" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="50" cy="60" r="2.5" fill="currentColor" />
  </svg>
);

export const TaskIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <rect x="25" y="20" width="50" height="60" rx="2" 
      stroke="currentColor" strokeWidth="2.5" fill="none" />
    <polyline points="35,40 42,47 55,34" stroke="currentColor" 
      strokeWidth="2.5" fill="none" />
    <line x1="35" y1="55" x2="65" y2="55" stroke="currentColor" strokeWidth="2" />
    <line x1="35" y1="65" x2="65" y2="65" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const PlusIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <line x1="50" y1="25" x2="50" y2="75" stroke="currentColor" strokeWidth="2.5" />
    <line x1="25" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

export const SearchIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <circle cx="40" cy="40" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <line x1="55" y1="55" x2="75" y2="75" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

export const FilterIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <line x1="20" y1="30" x2="80" y2="30" stroke="currentColor" strokeWidth="2.5" />
    <line x1="30" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="2.5" />
    <line x1="40" y1="70" x2="60" y2="70" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="35" cy="30" r="4" fill="currentColor" />
    <circle cx="55" cy="50" r="4" fill="currentColor" />
    <circle cx="50" cy="70" r="4" fill="currentColor" />
  </svg>
);

export const DownloadIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <line x1="50" y1="20" x2="50" y2="60" stroke="currentColor" strokeWidth="2.5" />
    <polyline points="35,45 50,60 65,45" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <line x1="25" y1="75" x2="75" y2="75" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

export const DotsIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <circle cx="50" cy="30" r="4" fill="currentColor" />
    <circle cx="50" cy="50" r="4" fill="currentColor" />
    <circle cx="50" cy="70" r="4" fill="currentColor" />
  </svg>
);

export const SortIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <polyline points="35,30 50,15 65,30" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <polyline points="35,70 50,85 65,70" stroke="currentColor" strokeWidth="2.5" fill="none" />
  </svg>
);

export const TrendingUpIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 100 100" className={className} {...props}>
    <polyline points="20,70 40,50 60,55 80,30" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="65,30 80,30 80,45" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
