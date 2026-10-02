import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let measurementId: string | null = null;
let started = false;
const CONSENT_KEY = "one-next-analytics-consent";

export type Consent = "granted" | "denied";

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Consent): void {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* ignore */
  }
  if (value === "granted") {
    void initAnalytics();
    return;
  }
  // Widerruf: Tracking abschalten, GA-Cookies löschen und neu laden, damit gtag entfernt ist
  if (measurementId) (window as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] = true;
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name === "_ga" || name.startsWith("_ga_") || name === "_gid") {
      domains.forEach((d) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ""}`;
      });
    }
  });
  if (started) location.reload();
}

export async function initAnalytics(): Promise<void> {
  if (started || getConsent() !== "granted") return;
  started = true;
  try {
    const { data } = await supabase.functions.invoke<{ id: string }>("ga-config", { method: "GET" });
    const id = data?.id?.trim();
    if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return;
    measurementId = id;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", id);
    trackSpaNavigation();
  } catch {
    /* Analytics darf die App nie blockieren */
  }
}

function trackSpaNavigation() {
  let last = location.pathname + location.search;
  const send = () => {
    const path = location.pathname + location.search;
    if (path === last || !measurementId || !window.gtag) return;
    last = path;
    window.gtag("event", "page_view", { page_path: path, page_location: location.href, page_title: document.title });
  };
  const wrap = (fn: typeof history.pushState) =>
    function (this: History, ...args: Parameters<typeof history.pushState>) {
      fn.apply(this, args);
      setTimeout(send, 0);
    };
  history.pushState = wrap(history.pushState);
  history.replaceState = wrap(history.replaceState);
  window.addEventListener("popstate", send);
}
