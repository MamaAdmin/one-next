import { useEffect } from "react";
import "./werkstatt.css";
import { initWerkstatt } from "./engine";

/**
 * one-next KI-Werkstatt
 * Die Struktur unten ist das HTML-Gerüst (HUD, Scroll-Strecke, Inhaltssektionen).
 * Die 3D-Szene, Schrittkarte, Rail und Beschriftungen werden in ./engine.ts erzeugt und gesteuert.
 * Wichtig: IDs (z. B. #scene, #card, #rail, #track) werden von der Engine verwendet, nicht umbenennen.
 */
export default function Werkstatt() {
  useEffect(() => initWerkstatt(), []);

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <symbol id="on-icon" viewBox="0 0 80 80">
          <rect x="8" y="0" width="26" height="20" fill="currentColor"/>
          <path d="M0 80C0 50 14 22 44 22H80V80H56V42H44C30 42 24 58 24 80Z" fill="currentColor"/>
        </symbol>
        <symbol id="bot" viewBox="0 0 40 46">
          <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M15 29 C15 35 14.5 38 13.5 41"/><path d="M25 29 C25 35 26 38 27 41"/>
            <path d="M6.5 18 C3 21 2 25 2.8 28.5"/><path d="M33.5 15 C37 12.5 38 9 37.4 5.5"/>
          </g>
          <ellipse cx="11.6" cy="42.4" rx="3.6" ry="2.1" fill="currentColor"/><ellipse cx="28.9" cy="42.4" rx="3.6" ry="2.1" fill="currentColor"/>
          <circle cx="2.9" cy="29.5" r="2.2" fill="currentColor"/><circle cx="37.3" cy="4.4" r="2.2" fill="currentColor"/>
          <rect x="6" y="2" width="28" height="28" rx="8.5" fill="currentColor"/>
          <g transform="translate(12 8) scale(0.2)" style={{ fill: "var(--bot-emblem,#F8F5F2)" }}>
            <rect x="8" y="0" width="26" height="20"/>
            <path d="M0 80C0 50 14 22 44 22H80V80H56V42H44C30 42 24 58 24 80Z"/>
          </g>
        </symbol>
      </svg>

      <canvas id="scene" aria-hidden="true"></canvas>

      <div id="labels" aria-hidden="true">
        <div className="bubble" id="bubble"><span className="b-name"></span><span className="b-text"></span></div>
      </div>

      <div className="hud">
        <header className="topbar">
          <a className="logo ui" href="https://one-next.com/" aria-label="one-next Startseite"><svg viewBox="0 0 80 80" aria-hidden="true"><use href="#on-icon"/></svg>one-next</a>
          <nav className="top-actions ui" aria-label="Hauptnavigation">
            <a className="pill pill-ghost" href="#leistungen">Leistungen</a>
            <a className="pill pill-primary" href="#kontakt">Erstgespräch vereinbaren</a>
          </nav>
        </header>

        <div className="hero" id="hero">
          <p className="hero-eyebrow"><svg className="bot" viewBox="0 0 40 46" aria-hidden="true"><use href="#bot"/></svg>KI-Entwicklung &amp; KI Design Sprints</p>
          <h1>Vom echten Geschäfts&shy;problem zur <em>belegten Wirkung.</em></h1>
          <p className="hero-sub">In der one-next Werkstatt wird aus Ihrem Geschäftsproblem in fünf Schritten ein sicherer KI-Arbeitsablauf, der messbar wirkt. Menschen prüfen und geben jeden Schritt frei.</p>
          <div className="hero-meta"><span className="go">Scrollen Sie durch die Werkstatt <span className="arrow">↓</span></span><span>Beispielprojekt: Rechnungseingang mit KI</span></div>
        </div>

        <nav className="rail ui" id="rail" aria-label="Schritte" style={{ opacity: 0 }}></nav>

        <aside className="card ui" id="card" aria-live="polite" style={{ opacity: 0 }}>
          <div className="card-top"><span id="cardNo">SCHRITT 01 / 05</span><span className="card-dur" id="cardDur"></span></div>
          <div className="card-body" id="cardBody">
            <h2 className="card-title" id="cardTitle"></h2>
            <p className="card-text" id="cardText"></p>
            <ul className="arts" id="cardArts"></ul>
          </div>
          <div className="term" aria-hidden="true">
            <div className="term-line"><span className="term-prompt">❯</span><span id="termCmd"></span><span className="caret"></span></div>
            <div className="term-out" id="termOut"></div>
          </div>
          <a className="pill pill-primary card-cta" id="cardCta" href="#kontakt" hidden>Erstgespräch vereinbaren</a>
          <div className="segs" id="segs"></div>
        </aside>

        <div className="controls ui" id="controls" role="group" aria-label="Tempo der Werkstatt">
          <span className="ctl-label">TEMPO</span>
          <button type="button" data-speed="0" aria-label="Pause">❚❚</button>
          <button type="button" data-speed="1" className="on">1×</button>
          <button type="button" data-speed="2">2×</button>
          <button type="button" data-speed="4">4×</button>
          <span className="ctl-hint">Klicken Sie auf einen Bot</span>
        </div>
      </div>

      <main>
        <div id="track">
          <section id="top"><h2 className="sr">Vom echten Geschäftsproblem zur belegten Wirkung</h2></section>
          <section><h2 className="sr">Schritt 1: Problem Framing</h2></section>
          <section><h2 className="sr">Schritt 2: KI Design Sprint</h2></section>
          <section><h2 className="sr">Schritt 3: KI-Arbeitsablauf entwickeln</h2></section>
          <section><h2 className="sr">Schritt 4: Prüfen &amp; Freigeben</h2></section>
          <section><h2 className="sr">Schritt 5: Wirkung &amp; Skalierung</h2></section>
        </div>

        <div className="content">
          <section className="sec" id="leistungen">
            <div className="wrap">
              <p className="eyebrow">LEISTUNGEN</p>
              <h2 className="sec-title">Ihr Weg zu KI, die wirkt</h2>
              <p className="lede">Wir starten beim echten Geschäftsproblem, nicht bei der Technologie. Jede Leistung ist ein Baustein auf dem Weg zur belegten Wirkung, einzeln buchbar oder als durchgängiger Prozess.</p>
              <div className="products">
                <a className="product" href="https://one-next.com/problem-framing-workshop">
                  <svg viewBox="0 0 52 52" aria-hidden="true"><rect x="5" y="5" width="42" height="42" rx="10" fill="#304255"/><path d="M14 19v-5h5M33 14h5v5M38 33v5h-5M19 38h-5v-5" fill="none" stroke="#F8F5F2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="26" cy="26" r="6" fill="#D09125"/></svg>
                  <h3>Problem Framing Workshop</h3>
                  <p>Wir definieren gemeinsam das geschäftliche Problem, bevor eine KI-Initiative startet: klar, messbar und von allen Beteiligten getragen.</p>
                  <dl className="meta"><div><dt>Format</dt><dd>Workshop</dd></div><div><dt>Schritt</dt><dd>01</dd></div></dl>
                  <span className="more">Mehr erfahren →</span>
                </a>
                <a className="product" href="https://one-next.com/sprint-uebersicht">
                  <svg viewBox="0 0 52 52" aria-hidden="true"><rect x="4" y="9" width="44" height="36" rx="10" fill="#304255"/><rect x="9" y="17" width="16" height="23" rx="4" fill="#FAF8F5"/><rect x="27" y="17" width="16" height="23" rx="4" fill="#FAF8F5"/><rect x="13" y="5" width="3" height="8" rx="1.5" fill="#5B7D9A"/><rect x="36" y="5" width="3" height="8" rx="1.5" fill="#5B7D9A"/><rect x="12" y="21" width="10" height="6" rx="2" fill="#D09125"/><rect x="30" y="21" width="10" height="6" rx="2" fill="#5E8F6E"/><rect x="12" y="30" width="7" height="3" rx="1.5" fill="#D8D1CB"/><rect x="30" y="30" width="7" height="3" rx="1.5" fill="#D8D1CB"/></svg>
                  <h3>KI Design Sprint</h3>
                  <p>Zwei Tage, ein validierter Use Case: Ideen entwickeln, entscheiden, einen Prototyp bauen und mit echten Nutzerinnen und Nutzern testen.</p>
                  <dl className="meta"><div><dt>Format</dt><dd>2 Tage, moderiert</dd></div><div><dt>Schritt</dt><dd>02</dd></div></dl>
                  <span className="more">Mehr erfahren →</span>
                </a>
                <a className="product" href="https://one-next.com/sprint-uebersicht/online">
                  <svg viewBox="0 0 52 52" aria-hidden="true"><rect x="3" y="7" width="46" height="38" rx="9" fill="#304255"/><rect x="7" y="16" width="38" height="25" rx="5" fill="#FAF8F5"/><circle cx="10" cy="11.5" r="1.8" fill="#77A1C5"/><circle cx="15" cy="11.5" r="1.8" fill="#D09125"/><rect x="11" y="20" width="9" height="9" rx="2" fill="#D09125"/><rect x="22" y="20" width="9" height="9" rx="2" fill="#A9B3CF"/><rect x="33" y="20" width="8" height="9" rx="2" fill="#A9CDB8"/><rect x="11" y="32" width="20" height="3" rx="1.5" fill="#D8D1CB"/></svg>
                  <h3>Online KI-Sprint-Tool</h3>
                  <p>Selbstgeführte Web-Applikation für Problem Framing und Design Sprint, ganz ohne externe Moderation.</p>
                  <dl className="meta"><div><dt>Format</dt><dd>Online, selbstgeführt</dd></div><div><dt>Schritt</dt><dd>01–02</dd></div></dl>
                  <span className="more">Mehr erfahren →</span>
                </a>
                <a className="product" href="https://one-next.com/custom-ai-development">
                  <svg viewBox="0 0 52 52" aria-hidden="true"><rect x="3" y="7" width="46" height="38" rx="9" fill="#304255"/><path d="M18 24l5-5M18 28l5 5M29 19l5 5M29 33l5-5" stroke="#F8F5F2" strokeWidth="2" strokeLinecap="round"/><circle cx="14" cy="26" r="5" fill="#D09125"/><circle cx="26" cy="17" r="4" fill="#77A1C5"/><circle cx="26" cy="35" r="4" fill="#77A1C5"/><circle cx="38" cy="26" r="5" fill="#8FC4A2"/></svg>
                  <h3>KI-Arbeitsablauf entwickeln</h3>
                  <p>Vom validierten Lösungsansatz zum sicheren KI-Arbeitsablauf mit Rollen, Daten, Prüfungen und menschlicher Freigabe.</p>
                  <dl className="meta"><div><dt>Format</dt><dd>Entwicklung nach BMAD</dd></div><div><dt>Schritt</dt><dd>03–04</dd></div></dl>
                  <span className="more">Mehr erfahren →</span>
                </a>
                <a className="product" href="https://one-next.com/ai-consulting-services">
                  <svg viewBox="0 0 52 52" aria-hidden="true"><rect x="3" y="7" width="46" height="38" rx="9" fill="#304255"/><path d="M11 36C19 36 17 19 26 19S33 31 41 17" fill="none" stroke="#F8F5F2" strokeWidth="2.5" strokeLinecap="round"/><circle cx="11" cy="36" r="3.5" fill="#D09125"/><circle cx="26" cy="19" r="3.5" fill="#77A1C5"/><circle cx="41" cy="17" r="3.5" fill="#8FC4A2"/></svg>
                  <h3>KI Consulting</h3>
                  <p>Beratung zu KI-Strategie, zur Auswahl der richtigen Use Cases und zu einer Roadmap, die zu Ihrem Unternehmen passt.</p>
                  <dl className="meta"><div><dt>Format</dt><dd>Beratung</dd></div><div><dt>Schritt</dt><dd>begleitend</dd></div></dl>
                  <span className="more">Mehr erfahren →</span>
                </a>
                <a className="product" href="https://one-next.com/data-quality-audit">
                  <svg viewBox="0 0 52 52" aria-hidden="true"><ellipse cx="22" cy="12" rx="14" ry="5" fill="#5B7D9A"/><path d="M8 12v24c0 2.8 6.3 5 14 5s14-2.2 14-5V12c0 2.8-6.3 5-14 5S8 14.8 8 12z" fill="#304255"/><path d="M8 24c0 2.8 6.3 5 14 5s14-2.2 14-5" fill="none" stroke="#5B7D9A" strokeWidth="2"/><circle cx="38" cy="37" r="9" fill="#367851"/><path d="M34 37l3 3 5-6" fill="none" stroke="#F8F5F2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <h3>Data Quality Audit</h3>
                  <p>Analyse Ihrer Datenbasis als Grundlage für KI-Projekte: Quellen, Qualität, Lücken und konkrete Massnahmen.</p>
                  <dl className="meta"><div><dt>Format</dt><dd>Audit</dd></div><div><dt>Schritt</dt><dd>bei Bedarf</dd></div></dl>
                  <span className="more">Mehr erfahren →</span>
                </a>
              </div>
              <p className="also">Ausserdem: <a href="https://one-next.com/design-sprint-workshop">Design Sprint Workshop</a> · <a href="https://one-next.com/kurse">Kurse</a> · <a href="https://one-next.com/faq">FAQ</a></p>
            </div>
          </section>

          <section className="sec">
            <div className="wrap">
              <p className="eyebrow">ARBEITSWEISE</p>
              <h2 className="sec-title">KI mit Methode, Menschen am Steuer</h2>
              <div className="principles">
                <div><h3>Problem vor Lösung</h3><p>Wir starten beim echten Geschäftsproblem, nicht bei der Technologie. Erst wenn klar ist, was sich verbessern soll, sprechen wir über KI.</p></div>
                <div><h3>Validieren statt vermuten</h3><p>Im KI Design Sprint testen wir Ideen mit echten Nutzerinnen und Nutzern, bevor Budget in die Entwicklung fliesst.</p></div>
                <div><h3>Sicher von Anfang an</h3><p>Rollen, Datenzugriffe, Prüfungen und menschliche Freigabe sind fester Teil jedes KI-Arbeitsablaufs, nicht ein Nachtrag.</p></div>
                <div><h3>Wirkung belegen</h3><p>Wir messen gegen die Erfolgskriterien vom ersten Tag. Skaliert wird, was nachweislich wirkt.</p></div>
              </div>
            </div>
          </section>

          <section className="sec">
            <div className="wrap">
              <p className="eyebrow">ZUSAMMENARBEIT</p>
              <h2 className="sec-title">So starten wir</h2>
              <ol className="formats">
                <li><span className="f-no">01</span><span className="f-name">Problem Framing</span><span className="f-dur">Workshop oder Online-Tool<span>Schritt 01</span></span><p>Wir schärfen das Geschäftsproblem und prüfen bei Bedarf Ihre Datenbasis. Am Ende steht ein Problem Statement mit messbaren Erfolgskriterien.</p></li>
                <li><span className="f-no">02</span><span className="f-name">KI Design Sprint</span><span className="f-dur">2 Tage<span>Schritt 02</span></span><p>Ihr Team entwickelt mit uns Lösungen, baut einen Prototyp und testet ihn mit echten Nutzern. Sie entscheiden auf Basis von Ergebnissen, nicht von Annahmen.</p></li>
                <li><span className="f-no">03</span><span className="f-name">Entwicklung &amp; Skalierung</span><span className="f-dur">ab 2 Wochen<span>Schritt 03–05</span></span><p>Wir bauen den sicheren KI-Arbeitsablauf, prüfen ihn, messen die Wirkung und rollen aus, was belegt funktioniert. Auf Wunsch übergeben wir alles an Ihr Team.</p></li>
              </ol>
            </div>
          </section>

          <section className="sec" id="kontakt">
            <div className="wrap">
              <div className="contact">
                <p className="eyebrow">KONTAKT</p>
                <h2 className="sec-title">Wo soll KI in Ihrem Unternehmen wirken?</h2>
                <p>Beschreiben Sie uns kurz Ihr Vorhaben oder Ihr Geschäftsproblem. Wir melden uns mit einem Termin für ein unverbindliches Erstgespräch.</p>
                <div className="cta-row">
                  <a className="pill pill-light" href="https://one-next.com/kontakt">Erstgespräch vereinbaren</a>
                  <a className="pill pill-outline" href="https://one-next.com/sprint-uebersicht/online">Online-Sprint-Tool ausprobieren</a>
                </div>
                <div className="parade">
                  <svg className="bot" viewBox="0 0 40 46" aria-hidden="true"><use href="#bot"/></svg>
                  <svg className="bot" viewBox="0 0 40 46" aria-hidden="true"><use href="#bot"/></svg>
                  <svg className="bot" viewBox="0 0 40 46" aria-hidden="true"><use href="#bot"/></svg>
                  <svg className="bot" viewBox="0 0 40 46" aria-hidden="true"><use href="#bot"/></svg>
                  <svg className="bot" viewBox="0 0 40 46" aria-hidden="true"><use href="#bot"/></svg>
                </div>
              </div>
            </div>
          </section>

          <footer>
            <div className="wrap">
              <span>© 2026 one-next · Horgen, Schweiz</span>
              <span className="claim">we define your way forward</span>
              <span><a href="https://one-next.com/impressum">Impressum</a> · <a href="https://one-next.com/faq">FAQ</a> · <a href="https://one-next.com/blog">Blog</a></span>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
