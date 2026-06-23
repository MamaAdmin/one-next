import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Global scroll-reveal controller.
 *
 * Watches the DOM and adds `.is-visible` to elements that should fade-up
 * once when they enter the viewport.
 *
 * Targets:
 *   - any element with class `reveal-on-scroll` or attribute `[data-reveal]`
 *   - <img> elements wider than 160px (auto opt-in for content images);
 *     opt out via `data-no-reveal` or by wrapping in `.no-auto-reveal`.
 *
 * Honours `prefers-reduced-motion`.
 */
const REVEAL_CLASS = "reveal-on-scroll";
const VISIBLE_CLASS = "is-visible";
const AUTO_FLAG = "data-auto-reveal";

function shouldAutoReveal(img: HTMLImageElement): boolean {
  if (img.hasAttribute("data-no-reveal")) return false;
  if (img.closest(".no-auto-reveal")) return false;
  if (img.hasAttribute(AUTO_FLAG)) return false;
  // skip tiny icons / logos
  const rect = img.getBoundingClientRect();
  const w = rect.width || img.naturalWidth || 0;
  const h = rect.height || img.naturalHeight || 0;
  return w >= 160 && h >= 90;
}

const ScrollReveal = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(VISIBLE_CLASS);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const register = (el: Element) => {
      if (el.classList.contains(VISIBLE_CLASS)) return;
      // If already in viewport on mount, just show it without animation.
      const rect = (el as HTMLElement).getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add(VISIBLE_CLASS);
        return;
      }
      observer.observe(el);
    };

    const scan = () => {
      // Explicit opt-in
      document
        .querySelectorAll<HTMLElement>(`.${REVEAL_CLASS}, [data-reveal]`)
        .forEach((el) => {
          if (!el.classList.contains(REVEAL_CLASS)) {
            el.classList.add(REVEAL_CLASS);
          }
          register(el);
        });

      // Auto opt-in for content images
      document.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
        if (!shouldAutoReveal(img)) return;
        img.setAttribute(AUTO_FLAG, "");
        img.classList.add(REVEAL_CLASS);
        register(img);
      });
    };

    // Initial scan (after layout)
    const raf = requestAnimationFrame(scan);

    // Watch for dynamically added nodes
    const mo = new MutationObserver(() => {
      // debounce via rAF
      requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      observer.disconnect();
    };
    // Re-scan on route change
  }, [location.pathname]);

  return null;
};

export default ScrollReveal;
