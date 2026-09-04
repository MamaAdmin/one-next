# Passwort zurücksetzen reparieren

## Was passiert ist

Für jule.haitz@gmail.com wurde am 4. September um 04:54 ein Reset-Link angefordert, eine Minute später entstand daraus auch eine gültige Sitzung — aber das Passwort selbst wurde nie geändert (der Datensatz zeigt keine Passwortänderung).

Das passt zu einem Timing-Problem auf der Seite „Passwort aktualisieren": Die Seite prüft sofort beim Öffnen, ob eine Anmeldung vorliegt. Der Link aus der E-Mail muss aber erst im Hintergrund eingelöst werden. Ist das noch nicht fertig, meldet die Seite „Ungültiger oder abgelaufener Reset-Link" und schickt die Person zurück auf die Anfrageseite — obwohl der Link gültig war.

Diese Ursache ist plausibel, aber noch nicht endgültig bewiesen. Deshalb ist der erste Schritt eine Nachstellung im laufenden Preview.

## Vorgehen

1. **Nachstellen und bestätigen**: Reset-Ablauf im Browser durchspielen und beobachten, ob die Seite vorzeitig wegspringt bzw. welche Fehlermeldung genau vom Server kommt.
2. **Seite „Passwort aktualisieren" robust machen**
   - Auf das Einlösen des Links warten, statt sofort zu prüfen; erst nach einer klaren Wartezeit ohne Sitzung die Fehlermeldung zeigen.
   - Enthält der Link selbst einen Fehler (z. B. abgelaufen), diesen Grund im Klartext anzeigen mit Knopf „Neuen Link anfordern".
   - Serverfehler beim Speichern (z. B. „neues Passwort gleich dem alten") verständlich auf Deutsch ausgeben.
3. **Passwortregeln vereinheitlichen**: Bei der Registrierung wird ein Sonderzeichen verlangt, beim Zurücksetzen nicht. Beide Stellen bekommen dieselbe Regel und denselben Hinweistext.
4. **Nach Erfolg**: Bestätigung anzeigen, abmelden und zur Anmeldung führen, damit das neue Passwort direkt getestet wird.
5. **Abschluss-Test**: Kompletter Durchlauf (Link anfordern, öffnen, Passwort setzen, neu anmelden) im Preview.

## Technische Details

- Betroffen: `src/pages/UpdatePassword.tsx` (Session-Erkennung über `onAuthStateChange` inkl. `PASSWORD_RECOVERY` statt einmaligem `getSession()`; Auswertung von `error`/`error_description` aus Query und Hash), `src/pages/Auth.tsx` und `src/pages/PasswordReset.tsx` nur für den einheitlichen Passwort-Schema-Text.
- Keine Änderungen an Backend, Datenbank, E-Mail-Versand oder den generierten Client-Dateien.
