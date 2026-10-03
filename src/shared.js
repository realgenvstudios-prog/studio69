// Small bits every page shares: the mobile nav toggle and the generic
// "fade up when it scrolls into view" treatment for headers/cards/steps.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initNav() {
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (!burger || !mobileMenu) return;
  const setOpen = (open) => {
    mobileMenu.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.classList.toggle("menu-open", open);
  };
  burger.addEventListener("click", () => setOpen(!mobileMenu.classList.contains("open")));
  mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));
  // Don't leave the page scroll-locked if the viewport grows past the breakpoint.
  window.matchMedia("(min-width: 821px)").addEventListener("change", (e) => e.matches && setOpen(false));
}

export function initReveals() {
  document.querySelectorAll(".section-head, .want-head, .product-card, .step, .wood-story-copy, .op-header, .op-step, .mind-copy, .closer-content").forEach((el) => {
    el.classList.add("reveal");
  });
  if (reduceMotion) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    return;
  }
  document.querySelectorAll(".reveal").forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      onEnter: () => el.classList.add("in"),
      once: true,
    });
  });
}

export function initLenis() {
  if (reduceMotion) return null;
  return import("lenis").then(({ default: Lenis }) => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return lenis;
  });
}
