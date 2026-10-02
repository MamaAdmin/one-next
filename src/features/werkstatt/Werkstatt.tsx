import { ServiceProcessContext } from "@/components/service/ServiceProcessContext";
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
          <a className="logo ui" href="/" aria-label="one-next Startseite"><svg viewBox="0 0 80 80" aria-hidden="true"><use href="#on-icon"/></svg>one-next</a>
          <nav className="top-actions ui" aria-label="Hauptnavigation">
            <a className="pill pill-ghost" href="#leistungen">Leistungen</a>
            <a className="pill pill-primary" href="/kontakt">Erstgespräch vereinbaren</a>
          </nav>
        </header>

        <div className="hero" id="hero">
          <p className="hero-eyebrow"><svg className="bot" viewBox="0 0 40 46" aria-hidden="true"><use href="#bot"/></svg>KI-Entwicklung &amp; Design Sprints</p>
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
          <a className="pill pill-primary card-cta" id="cardCta" href="/kontakt" hidden>Erstgespräch vereinbaren</a>
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
          <section><h2 className="sr">Schritt 2: Design Sprint</h2></section>
          <section><h2 className="sr">Schritt 3: Arbeitsablauf entwickeln</h2></section>
          <section><h2 className="sr">Schritt 4: Prüfen &amp; Freigeben</h2></section>
          <section><h2 className="sr">Schritt 5: Wirkung &amp; Skalierung</h2></section>
        </div>

        <div className="content">
          <div id="leistungen" className="werkstatt-process"><ServiceProcessContext variant="full" showExample /></div>

          <section className="sec">
            <div className="wrap">
              <p className="eyebrow">ARBEITSWEISE</p>
              <h2 className="sec-title">KI mit Methode, Menschen am Steuer</h2>
              <div className="principles">
                <div><h3>Problem vor Lösung</h3><p>Wir starten beim echten Geschäftsproblem, nicht bei der Technologie. Erst wenn klar ist, was sich verbessern soll, sprechen wir über KI.</p></div>
                <div><h3>Validieren statt vermuten</h3><p>Im Design Sprint testen wir Ideen mit echten Nutzerinnen und Nutzern, bevor Budget in die Entwicklung fliesst.</p></div>
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
                <li><span className="f-no">02</span><span className="f-name">Design Sprint</span><span className="f-dur">2 Tage<span>Schritt 02</span></span><p>Ihr Team entwickelt mit uns Lösungen, baut einen Prototyp und testet ihn mit echten Nutzern. Sie entscheiden auf Basis von Ergebnissen, nicht von Annahmen.</p></li>
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
                  <a className="pill pill-light" href="/kontakt">Erstgespräch vereinbaren</a>
                  <a className="pill pill-outline" href="/sprint-uebersicht/online">Online-Sprint-Tool ausprobieren</a>
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
              <span><a href="/impressum">Impressum</a> · <a href="/faq">FAQ</a> · <a href="/blog">Blog</a></span>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
