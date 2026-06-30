## Ziel
Ownership für `https://one-next.com/` in der Google Search Console per Meta-Tag verifizieren.

## Ausgangslage
- Das Meta-Tag für `one-next.com` (Token `sDDWv0uUReZsEKAlTmT48vZ4FYrfFOaTr-FR51elPh8`) ist bereits in `index.html` eingefügt.
- Der Live-Check auf `https://one-next.com/` zeigt aktuell aber nur das alte Tag für `one-next.lovable.app`. Das neue Tag ist noch nicht deployed.
- Ohne live ausgeliefertes Tag schlägt die Verifizierung mit `failedToFindMetaTag` fehl.

## Schritte

1. **Projekt publishen** (durch dich per Klick auf „Update" im Publish-Dialog erforderlich, Frontend-Änderungen gehen sonst nicht live).
2. **Live-Check** nach dem Publish:
   ```
   curl -s https://one-next.com/ | grep google-site-verification
   ```
   Erwartung: beide Tags (`...lovable.app` und `one-next.com`) sind sichtbar.
3. **Google Site Verification API aufrufen** (METHOD=META) für `https://one-next.com/`. Bei Erfolg: HTTP 200.
4. **Site zur Search Console hinzufügen** via `PUT /webmasters/v3/sites/https%3A%2F%2Fone-next.com%2F`, damit die Property in der Konsole erscheint.
5. **Sitemap einreichen**: `https://one-next.com/sitemap.xml`.

## Hinweis
Schritt 1 muss von dir durchgeführt werden – ich kann im Plan-Modus nicht publishen. Sag mir Bescheid, sobald du veröffentlicht hast, dann führe ich Schritte 2–5 aus.
