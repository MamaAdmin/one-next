
## Strahlen-Rad im Hero animieren

Das SVG-Strahlen-Rad existiert bereits in `src/components/Hero.tsx` (Zeilen 30–50). Es bekommt eine langsame, endlose Rotation.

### Änderungen
- **`tailwind.config.ts`**: neue Keyframe `spin-slow` (0° → 360°) und Animation `spin-slow: spin-slow 20s linear infinite` ergänzen.
- **`src/components/Hero.tsx`**: `className="w-full h-full animate-spin-slow"` auf das `<svg>` setzen; `transform-origin: center` durch `origin-center` sicherstellen (SVG-Standard, aber explizit zur Sicherheit).

### Details
- 20 Sekunden pro Umdrehung, linear, unendlich — ruhig und elegant, wie gewählt.
- Keine weiteren Änderungen an Layout, Farbe oder Struktur.
- Respektiert `prefers-reduced-motion` nicht explizit — falls gewünscht, kann eine Media-Query ergänzt werden (bitte melden).
