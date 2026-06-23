# Plan: `strict: true` aktivieren + TS-Fehler beheben

## Ausgangslage

- `tsconfig.json` und `tsconfig.app.json` setzen aktuell `strict: false`, `strictNullChecks: false`, `noImplicitAny: false`, `noUnusedLocals/Parameters: false`.
- 229 `any`-Vorkommen, davon ein großer Teil `(supabase as any)` — obwohl die Tabellen (`bmad_*`, `lms_*`, …) in `src/integrations/supabase/types.ts` **bereits korrekt typisiert** sind. Die Casts sind also überflüssig und maskieren echte Typen.
- `catch (error: any)`-Pattern in vielen Hooks.
- Viele Felder mit `any` (`content`, `metadata`, `options`, `correct_answer`) in Hook-Interfaces.
- Auto-generierte Datei `src/integrations/supabase/types.ts` darf nicht editiert werden.

Mit `strict: true` werden vor allem zwei Fehlerklassen aktiv:
1. **`strictNullChecks`** – jedes `T | null | undefined` muss vor Zugriff geprüft werden. Das betrifft praktisch jeden Supabase-`data`-Zugriff (`data` ist `T | null`) sowie Optional-Props.
2. **`noImplicitAny`** – jeder impliziert untypisierte Parameter (`.map((x) => …)`, `catch (e)` ohne Annotation in `useUnknownInCatchVariables`) bekommt einen Fehler.

Realistische Größenordnung: einige hundert bis ~1000 neue Fehler bei vollem `strict`. Ein "Big-Bang"-Fix in einem einzigen Schritt ist riskant und sehr groß. Ich schlage eine **phasenweise Aktivierung** vor, sodass nach jeder Phase das Projekt grün baut, bevor die nächste Strictness-Stufe angeschaltet wird.

## Vorgehen (Phasen)

```text
Phase 0 → tsconfig konsolidieren
Phase 1 → noImplicitAny  + as any aus Supabase-Hooks entfernen
Phase 2 → catch (error: unknown) + error-Helper
Phase 3 → strictNullChecks (Null/Undefined Guards)
Phase 4 → restliche strict-Flags (strictFunctionTypes, strictBindCallApply,
          strictPropertyInitialization, alwaysStrict, useUnknownInCatchVariables,
          noImplicitThis)
Phase 5 → tsconfig.json + tsconfig.app.json: strict: true (Schalter umlegen,
          letzte Restfehler beheben)
```

### Phase 0 — `tsconfig` aufräumen
- `tsconfig.json`: Override-Block (`noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`, `allowJs`) entfernen, sodass Root und App-Config nicht gegeneinander arbeiten.
- `tsconfig.app.json`: `strict: false` bleibt zunächst stehen; einzelne strict-Flags werden ab Phase 1 schrittweise aktiviert.
- Keine Codeänderung. Sicherstellen, dass Build weiterhin grün ist.

### Phase 1 — `noImplicitAny: true` + Supabase-Casts entfernen
- `noImplicitAny: true` in `tsconfig.app.json`.
- Alle 16 Dateien mit `(supabase as any)` durchgehen (z. B. `useVoting.tsx`, `useCustomer.tsx`, `useBMADConversations.tsx`, `useBMADArtifacts.tsx`, `useArtifacts.tsx`, `useLMSModules.tsx`, `useLMSEnrollment.tsx`, `useCoursePurchase.tsx`, `useGDPRConsent.tsx`, `useModuleProgress.tsx`, `useParticipants.tsx`, `useLMSCourse.tsx`, `pages/admin/LMSAnalytics.tsx`, `LMSEnrollmentDashboard.tsx`, `pages/lms/AcceptEnrollmentInvitation.tsx`, `LMSDashboard.tsx`, `components/lms/DeleteAccount.tsx`, `CollaborationCanvas.tsx`):
  - Cast entfernen.
  - Falls TS dann eine fehlende Tabelle meldet → `src/integrations/supabase/types.ts` neu generieren (über das System, nicht händisch editieren) und Cast endgültig löschen.
- Lokale Felder `any` in Hook-Interfaces (`useDynamicPage`, `useVersionHistory`, `useBMADArtifacts`, `useQuizzes`, `useNavigation`) durch konkrete Typen ersetzen — bevorzugt durch `Database["public"]["Tables"][…]["Row"]` oder `Json` aus den generierten Types.
- Implizite `any`-Parameter in `.map`/`.filter`/`.reduce` mit konkretem Typ versehen.
- Komponenten in `src/pages/UserProfile.tsx:81,91` (`enrollments.map((enrollment: any) …`) typisieren.

### Phase 2 — Error-Handling
- Neuen Helper `getErrorMessage(error: unknown): string` in `src/lib/utils.ts` ergänzen.
- Alle `catch (error: any)` (ca. 15 Stellen, u. a. `useVoting`, `useCustomer`, `useCustomerDetail`, `useUserProfile`, `useCompanyProfile`) auf `catch (error)` (implizit `unknown`) umstellen und `getErrorMessage(error)` bzw. Type-Guards verwenden.
- `useUnknownInCatchVariables: true` separat in `tsconfig.app.json` aktivieren (kommt mit `strict: true` ohnehin).

### Phase 3 — `strictNullChecks: true`
Größter Brocken. Erwartete Hotspots:
- Supabase-Reads: `const { data, error } = await supabase.from(...).select().single()` → `data` ist nun `Row | null`. Vor jedem Property-Zugriff `if (error) throw error; if (!data) return null;` oder Optional-Chaining ergänzen.
- React-Refs (`useRef<HTMLDivElement>(null)`) — `.current` Zugriffe absichern.
- `useState<T>()` ohne Initialwert → ggf. `useState<T | null>(null)` typisieren.
- Optional-Props in Komponenten-Interfaces (`prop?: string`) — Defaults oder Guards ergänzen.
- React-Query-Hooks: `data` ist im Loading-State `undefined`.
- Vorgehen: Pfadweise abarbeiten, beginnend mit Blattmodulen (`src/lib`, dann Hooks, dann Components, dann Pages). Nach jeder Datei lokal typecheck-grün ziehen.

### Phase 4 — Verbleibende strict-Flags
- `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `alwaysStrict` einzeln aktivieren. Dadurch verbleibende Fehler beheben (in dieser Codebasis erfahrungsgemäß wenige, weil keine Klassen / kein `this`-Gebrauch).

### Phase 5 — Schalter umlegen
- In `tsconfig.json` und `tsconfig.app.json` `"strict": true` setzen, die Einzel-Flags wieder rausnehmen (redundant), Override-Felder löschen.
- Letzten Build grün ziehen.
- Memory-Notiz "TypeScript strict mode aktiv" in `mem://` ergänzen, damit künftige Änderungen es respektieren.

## Bewusst NICHT Teil dieses Plans (separate Tickets)

- Umstellung `export default` → named exports (83 Dateien).
- Server-State auf React Query migrieren.
- Zustand für Client-State einführen.
- Inline-Styles → Tailwind-Tokens.
- Deutsche Übersetzung englischer Kommentare.
- Test-Setup (Vitest).
- Datei-Umbenennung in kebab-case.

## Akzeptanzkriterien

- `tsconfig.json` und `tsconfig.app.json` enthalten `"strict": true`.
- Kein `(supabase as any)` mehr im Code (außer dokumentierte Ausnahmen mit Begründung).
- Kein `catch (error: any)` mehr.
- Build (`tsc --noEmit` via Lovable-Build) ist grün.
- App startet, Hauptflows (Auth, Admin-Dashboard, LMS-Kurs öffnen, BMAD-Session anlegen, Public-Course-Checkout) funktionieren wie zuvor.

## Risiken / Hinweise

- **Umfang**: Erfahrungsgemäß 600–1000 neue TS-Fehler. Phase 3 ist der größte Brocken und kann sich über mehrere Iterationen ziehen.
- **Regressionsrisiko**: Null-Guards ändern Laufzeitverhalten (z. B. früher Return statt späterer Crash). Nach Phase 3 sind manuelle Smoke-Tests der Hauptflows nötig.
- **Generierte Supabase-Types**: Falls Tabellen tatsächlich fehlen sollten, müssen die Types neu generiert werden — wir dürfen die Datei nicht händisch editieren.
- **Reihenfolge wichtig**: Wenn du lieber alles auf einmal willst (`strict: true` direkt in Phase 0), kann ich das machen — der Diff wird aber sehr groß und schwerer review-bar.

## Frage an dich vor dem Start

Soll ich
**(A)** strikt phasenweise vorgehen wie oben (mehrere Commits, jeder grün) — empfohlen,
**(B)** direkt `strict: true` setzen und in einem einzigen großen Pass alle Fehler beheben,
oder **(C)** nur Phase 0–2 jetzt umsetzen und Phase 3–5 in einem Folgeticket?
