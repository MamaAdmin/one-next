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
