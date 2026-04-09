

## Plan: Stripe-Produkt für "KI als Werkzeug im Scheidungsrecht" erstellen

### Kontext
Der Kurs kostet CHF 200.00. Aktuell verwendet die Edge Function `create-course-registration` dynamische `price_data` — das erschwert die Nachverfolgung in Stripe. Stattdessen wird ein festes Stripe-Produkt mit Preis erstellt.

### Umsetzung

#### 1. Stripe-Produkt und Preis erstellen
- Produkt: "KI als Werkzeug im Scheidungsrecht"
- Preis: CHF 200.00 (einmalig, 20000 Rappen)
- Über das `create_stripe_product_and_price` Tool

#### 2. Stripe Price-ID in der Datenbank speichern
- Neues Feld `stripe_price_id` in `public_courses` hinzufügen (TEXT, nullable)
- Den Kurs mit der neuen Price-ID aktualisieren

#### 3. Edge Function `create-course-registration` anpassen
- Statt `price_data` die `stripe_price_id` aus dem Kurs verwenden
- Fallback auf `price_data` falls kein `stripe_price_id` gesetzt ist (Abwärtskompatibilität)

#### 4. Frontend-Hook aktualisieren
- `usePublicCourses` Interface um `stripe_price_id` erweitern

### Technische Details
- Migration: `ALTER TABLE public_courses ADD COLUMN stripe_price_id TEXT;`
- Edge Function Änderung: `price: course.stripe_price_id` statt `price_data: {...}` im `line_items` Array
- Keine UI-Änderungen nötig — der Checkout-Flow bleibt identisch

