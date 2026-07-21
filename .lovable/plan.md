# Plan: Miro OAuth mit stabiler Redirect-URI

## Problem
Die Redirect-URI wird aktuell aus `window.location.origin` gebildet. In der Preview lautet die Origin `https://4edbaed1-9d00-4f59-a9a6-e1ce4afbdf79.lovableproject.com`, ist aber in der Miro App nicht registriert. Da Miro Redirect-URIs exakt vergleicht, schlägt die Autorisierung fehl.

## Lösung
Eine dedizierte Edge Function wird als einzige, stabile Redirect-URI bei Miro hinterlegt. Sie empfängt den OAuth-Callback von Miro, validiert den signierten `state`, extrahiert die ursprüngliche Origin und leitet den Browser zurück zur aufrufenden Seite. Der Token-Austausch passiert dann auf der korrekten Origin.

## Schritte

### 1. Neue Edge Function `miro-oauth-callback`
- `GET`-Handler für den Miro-Redirect.
- Validiert `state` (HMAC, Timestamp, User-ID).
- Extrahiert die ursprüngliche `origin` aus `state`.
- Leitet weiter zu `${origin}/miro/callback?code=...&state=...&redirect_uri=...`.
- `verify_jwt = false`, weil Miro ohne Bearer-Token redirected.

### 2. `miro-oauth-start` anpassen
- Redirect-URI auf die neue stabile Edge-Function-URL setzen.
- `origin` (aus `window.location.origin`) zusätzlich zu User-ID, Nonce und Timestamp in `state` encodieren.
- Die verwendete Edge-Function-URL als `redirect_uri` an das Frontend zurückgeben.

### 3. `MiroCallback.tsx` anpassen
- Liest `code`, `state` und `redirect_uri` aus der Weiterleitung.
- Ruft `miro-oauth-complete` mit der Edge-Function-URL als `redirect_uri` auf.
- `postMessage` an `window.opener` bleibt unverändert.

### 4. `miro-oauth-complete` anpassen
- Verwendet das vom Frontend übergebene `redirect_uri` für den Miro-Token-Austausch.
- Fügt eine Validierung hinzu, dass nur die registrierte Edge-Function-URL akzeptiert wird.

### 5. `supabase/config.toml` erweitern
- Block für `miro-oauth-callback` mit `verify_jwt = false` hinzufügen.

### 6. Miro App Konfiguration
- Nur noch die stabile Edge-Function-URL als Redirect-URI hinterlegen.
- Alle anderen Preview-/Production-URLs können aus der Miro App entfernt werden.
- Die exakte Callback-URL wird nach der Implementierung für das Miro-Dashboard bereitgestellt.

### 7. Test
- Verbindungsflow in der Preview starten.
- Board-Erstellung und Sticky-Note-Import prüfen.
