## Ziel

Im persönlichen Profil (`/profile`) einen neuen Tab **„Meine Sprints"** ergänzen, sodass jeder eingeloggte User dort seine Sprints sieht – analog zu „Meine Kurse". Da Admin und normaler User dieselbe Profilseite nutzen, ist die Anzeige automatisch in beiden Rollen verfügbar (genau wie es heute bei „Meine Kurse" der Fall ist).

## Änderungen

**`src/pages/UserProfile.tsx`**
- `useMySprints()` aus `@/hooks/useSprint` laden.
- Tab-Leiste von 3 auf 4 Spalten erweitern: Profil · Meine Kurse · **Meine Sprints** · Käufe.
- Neuen `TabsContent value="sprints"` einfügen mit einer Card, die die Sprints des Users auflistet:
  - Titel, Status/Phase, letztes Update.
  - Button „Öffnen" → `navigate(/sprint/{id})`.
  - Leerer Zustand: Hinweistext + Button „Neuen Sprint starten" → `/sprint/new`.
- Lade-Spinner berücksichtigt zusätzlich `sprintsLoading`.

**Keine Datenbankänderungen.** Die bestehenden RLS-Policies auf `sprints` (Owner + Mitglieder) liefern bereits genau die richtigen Einträge pro User.

## Hinweis zu „Meine Kurse"
Die Kursanzeige ist bereits Teil des gemeinsamen `/profile` und damit für normale User und Admins identisch sichtbar – hier ist keine Änderung nötig.
