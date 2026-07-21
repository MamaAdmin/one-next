import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TokenGroup {
  title: string;
  items: {
    name: string;
    bgVar: string;
    fgVar: string;
    description?: string;
  }[];
}

const groups: TokenGroup[] = [
  {
    title: "Brand",
    items: [
      { name: "brand-primary", bgVar: "--brand-primary", fgVar: "--brand-primary-foreground", description: "Hauptmarke, CTA, Schlüsselelemente" },
      { name: "brand-secondary", bgVar: "--brand-secondary", fgVar: "--brand-secondary-foreground", description: "Warmes Taupe, sekundäre Flächen" },
      { name: "brand-accent", bgVar: "--brand-accent", fgVar: "--brand-accent-foreground", description: "Interaktive Akzente, Links, Fokus" },
      { name: "brand-background", bgVar: "--brand-background", fgVar: "--brand-background-foreground", description: "Seitenhintergrund" },
    ],
  },
  {
    title: "Neutral",
    items: [
      { name: "neutral-50", bgVar: "--neutral-50", fgVar: "--neutral-900" },
      { name: "neutral-100", bgVar: "--neutral-100", fgVar: "--neutral-900" },
      { name: "neutral-200", bgVar: "--neutral-200", fgVar: "--neutral-900" },
      { name: "neutral-300", bgVar: "--neutral-300", fgVar: "--neutral-900" },
      { name: "neutral-400", bgVar: "--neutral-400", fgVar: "--neutral-900" },
      { name: "neutral-500", bgVar: "--neutral-500", fgVar: "--neutral-50" },
      { name: "neutral-600", bgVar: "--neutral-600", fgVar: "--neutral-50" },
      { name: "neutral-700", bgVar: "--neutral-700", fgVar: "--neutral-50" },
      { name: "neutral-800", bgVar: "--neutral-800", fgVar: "--neutral-50" },
      { name: "neutral-900", bgVar: "--neutral-900", fgVar: "--neutral-50" },
      { name: "neutral-950", bgVar: "--neutral-950", fgVar: "--neutral-50" },
    ],
  },
  {
    title: "Surface",
    items: [
      { name: "surface-default", bgVar: "--surface-default", fgVar: "--surface-default-foreground", description: "Karten, Dialoge, Popover" },
      { name: "surface-elevated", bgVar: "--surface-elevated", fgVar: "--surface-elevated-foreground", description: "Hover, Dropdowns, erhöhte Ebenen" },
      { name: "surface-overlay", bgVar: "--surface-overlay", fgVar: "--surface-overlay-foreground", description: "Modale, Toasts, Top-Layer" },
      { name: "surface-sunken", bgVar: "--surface-sunken", fgVar: "--surface-sunken-foreground", description: "Eingebettete Bereiche, Code-Blöcke" },
    ],
  },
  {
    title: "Text",
    items: [
      { name: "text-default", bgVar: "--text-default", fgVar: "--brand-background", description: "Haupttext" },
      { name: "text-muted", bgVar: "--text-muted", fgVar: "--brand-background", description: "Beschreibungen, Meta-Text" },
      { name: "text-placeholder", bgVar: "--text-placeholder", fgVar: "--brand-background", description: "Placeholder, disabled" },
      { name: "text-on-dark", bgVar: "--text-on-dark", fgVar: "--neutral-950", description: "Text auf dunklen Hintergründen" },
      { name: "text-on-primary", bgVar: "--text-on-primary", fgVar: "--brand-primary", description: "Text auf Primary-Flächen" },
      { name: "text-on-accent", bgVar: "--text-on-accent", fgVar: "--brand-accent", description: "Text auf Accent-Flächen" },
    ],
  },
  {
    title: "Semantic",
    items: [
      { name: "success", bgVar: "--success", fgVar: "--success-foreground", description: "Erfolg, Bestätigung" },
      { name: "success-soft", bgVar: "--success-soft", fgVar: "--success-soft-foreground", description: "Subtile Erfolgsflächen" },
      { name: "warning", bgVar: "--warning", fgVar: "--warning-foreground", description: "Warnung, Hinweis" },
      { name: "warning-soft", bgVar: "--warning-soft", fgVar: "--warning-soft-foreground", description: "Subtile Warnflächen" },
      { name: "error", bgVar: "--error", fgVar: "--error-foreground", description: "Fehler, Destruktiv" },
      { name: "error-soft", bgVar: "--error-soft", fgVar: "--error-soft-foreground", description: "Subtile Fehlerflächen" },
      { name: "info", bgVar: "--info", fgVar: "--info-foreground", description: "Information, Hinweis" },
      { name: "info-soft", bgVar: "--info-soft", fgVar: "--info-soft-foreground", description: "Subtile Info-Flächen" },
    ],
  },
];

function getCssValue(varName: string): string {
  if (typeof window === "undefined") return "";
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value ? `hsl(${value})` : "";
}

function hslToHex(hslString: string): string {
  const match = hslString.match(/hsl\((\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%\)/);
  if (!match) return "—";
  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function contrastRatio(hex1: string, hex2: string): number {
  const luminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const [lr, lg, lb] = [r, g, b].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  };
  const l1 = luminance(hex1) + 0.05;
  const l2 = luminance(hex2) + 0.05;
  return l1 > l2 ? l1 / l2 : l2 / l1;
}

export const ColorTokens = () => {
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {group.items.map((item) => {
                const bgHsl = getCssValue(item.bgVar);
                const fgHsl = getCssValue(item.fgVar);
                const bgHex = hslToHex(bgHsl);
                const fgHex = hslToHex(fgHsl);
                const ratio = bgHex !== "—" && fgHex !== "—" ? contrastRatio(bgHex, fgHex).toFixed(2) : "—";
                const passesAA = ratio !== "—" && parseFloat(ratio) >= 4.5;

                return (
                  <div
                    key={item.name}
                    className="rounded-lg border border-border p-4 space-y-2"
                    style={{
                      backgroundColor: bgHsl || "transparent",
                      color: fgHsl || "inherit",
                    }}
                  >
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs opacity-80 font-mono">{bgHex}</div>
                    {item.description && (
                      <div className="text-xs opacity-75 leading-tight">{item.description}</div>
                    )}
                    <div className="text-xs font-mono pt-1 border-t border-current/20">
                      Kontrast: {ratio} {passesAA ? "(AA)" : "(⚠️)"}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
