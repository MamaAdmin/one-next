## Ziel

`https://one-next.com` zusätzlich zur bereits verifizierten `https://one-next.lovable.app/` als eigene Property in Google Search Console einrichten — beide laufen parallel, keine Änderungen an Canonicals/OG-Tags.

## Schritte

1. **Verifizierungs-Token anfordern** für `https://one-next.com/` über die Search Console Site Verification API (METHOD=META).
2. **Meta-Tag in `index.html`** ergänzen — zusätzlich zum bestehenden Tag für lovable.app. Google erkennt mehrere `google-site-verification`-Tags parallel; das bestehende Tag bleibt unverändert.
3. **Publish** des Projekts, damit das neue Meta-Tag live auf `one-next.com` ausgeliefert wird (Custom Domain serviert denselben Build).
4. **Verify-Call** an Google: bestätigt Ownership.
5. **Site hinzufügen** zur Property-Liste via `PUT /webmasters/v3/sites/https%3A%2F%2Fone-next.com%2F`.
6. **Sitemap einreichen**: `https://one-next.com/sitemap.xml`.

## Hinweise

- `public/sitemap.xml` und alle Canonicals bleiben auf `https://one-next.lovable.app` (wie aktuell). Falls .com später die primäre Domain werden soll, ist das ein separater Schritt.
- Verifizierung schlägt fehl, falls one-next.com nicht auf das aktuelle Lovable-Deployment zeigt — DNS muss aktiv sein.
