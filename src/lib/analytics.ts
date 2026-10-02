import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let measurementId: string | null = null;

export async function initAnalytics(): Promise<void> {
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
