// Homepage: ARRIVAL (hero) → THE MATERIAL → ORDER PROCESS → GALLERY →
// WHAT DO YOU HAVE IN MIND? (more sections to follow, rebuilt one at a time).
// Philosophy: the site behaves like a physical showroom — photography does
// the storytelling, interaction gives it life. Only the hero is pinned/
// scroll-scrubbed; everything after it is direct hover/click interaction,
// same as walking through rooms rather than watching a movie.
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reduceMotion, initNav, initReveals, initLenis } from "./shared.js";

gsap.registerPlugin(ScrollTrigger);

initNav();
initReveals();
const lenisReady = initLenis();

const clamp01 = (v) => Math.min(1, Math.max(0, v));

const loader = document.getElementById("loader");
function hideLoader() {
  loader?.classList.add("hidden");
}

if (reduceMotion) {
  document.querySelectorAll(".hero-type .word").forEach((w) => {
    w.style.opacity = 1;
    w.style.transform = "none";
  });
  document.getElementById("heroMask").style.clipPath = "inset(0% 0% 0% 0%)";
  document.querySelector(".hero-type").classList.add("on-image");
  document.querySelector(".hero-cta").style.opacity = 1;
  document.querySelector(".hero-block .scroll-cue").style.display = "none";
  document.querySelector(".hero-block").style.height = "auto";
  document.querySelector(".hero-pin").style.position = "relative";
  document.querySelector(".hero-pin").style.height = "100vh";
  hideLoader();

  // Gallery: no crossfade, just the first photo at a normal height.
  document.querySelector(".gallery").style.height = "80vh";
  document.querySelector(".gallery-pin").style.position = "relative";
  document.querySelector(".gallery-pin").style.height = "100%";
} else {
  heroWordReveal();
  heroScroll();
  gallerySequence();

  const heroImage = document.getElementById("heroImage");
  if (heroImage?.complete) hideLoader();
  else heroImage?.addEventListener("load", hideLoader, { once: true });
  setTimeout(hideLoader, 3500);
}

woodStoryParallax();
scrollButton();

window.addEventListener("load", () => ScrollTrigger.refresh());

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================================
   01 — ARRIVAL (the only pinned/scrubbed section)
   ============================================================ */
function heroWordReveal() {
  const words = gsap.utils.toArray(".hero-type .word");
  const tl = gsap.timeline({ delay: 0.3 });
  words.forEach((w, i) => {
    tl.to(w, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, i === 0 ? 0 : "+=0.35");
  });
}

function heroScroll() {
  const heroType = document.querySelector(".hero-type");
  const lineTop = heroType.querySelector(".line-top");
  const lineMid = heroType.querySelector(".line-mid");
  const lineBot = heroType.querySelector(".line-bot");
  const heroMask = document.getElementById("heroMask");
  const heroCta = document.querySelector(".hero-cta");
  const scrollCue = document.querySelector(".hero-block .scroll-cue");

  ScrollTrigger.create({
    trigger: ".hero-block",
    start: "top top",
    end: "bottom bottom",
    pin: ".hero-pin",
    scrub: 0.5,
    onUpdate(self) {
      const p = self.progress;
      scrollCue.style.opacity = String(clamp01(1 - p * 8));

      const phase = clamp01(p / 0.5);
      // MADE / YOUR SPACE ride the box's top and bottom edges off-screen;
      // FOR fades out as the full image takes over.
      const edgeShift = phase * 0.42 * heroMask.clientHeight;
      lineTop.style.transform = `translateY(${-edgeShift}px)`;
      lineBot.style.transform = `translateY(${edgeShift}px)`;
      lineMid.style.opacity = String(1 - phase);
      const inset = 42 - phase * 42;
      heroMask.style.clipPath = `inset(${inset}% ${inset * 0.76}% ${inset}% ${inset * 0.76}% round 2px)`;
      heroCta.style.opacity = String(clamp01((p - 0.25) / 0.15));
    },
  });
}

/* ============================================================
   04 — GALLERY: five real photos. Each one holds, then pushes
   fully off-screen as the next slides in behind it — a directional
   push, not a crossfade. Pinned the same way the hero is.
   ============================================================ */
function gallerySequence() {
  const slides = gsap.utils.toArray(".gallery-slide");
  const fill = document.getElementById("galleryProgressFill");
  const steps = slides.length - 1;

  ScrollTrigger.create({
    trigger: ".gallery",
    start: "top top",
    end: "bottom bottom",
    pin: ".gallery-pin",
    scrub: 0.5,
    onUpdate(self) {
      const p = self.progress;
      fill.style.width = `${p * 100}%`;
      const seg = p * steps;
      const idx = Math.min(steps - 1, Math.floor(seg));
      const local = seg - idx;
      // Each photo holds in place for the first 65% of its segment,
      // then pushes off over the remaining 35% as the next slides in.
      const holdUntil = 0.65;
      const blend = local < holdUntil ? 0 : (local - holdUntil) / (1 - holdUntil);
      slides.forEach((slide, i) => {
        if (i < idx) slide.style.transform = "translateX(-100%)";
        else if (i === idx) slide.style.transform = `translateX(${-blend * 100}%)`;
        else if (i === idx + 1) slide.style.transform = `translateX(${(1 - blend) * 100}%)`;
        else slide.style.transform = "translateX(100%)";
      });
    },
  });
}

/* ============================================================
   02 — THE MATERIAL: the two timber slices drift at slightly
   different speeds as you scroll past — a quiet parallax, not
   a pinned moment.
   ============================================================ */
function woodStoryParallax() {
  if (reduceMotion) return;
  const section = document.getElementById("wood-story");
  if (!section) return;
  const tr = section.querySelector(".slice-tr");
  const bl = section.querySelector(".slice-bl");

  ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    scrub: 0.6,
    onUpdate(self) {
      const p = self.progress - 0.5; // -0.5 -> 0.5
      tr.style.transform = `translateY(${p * -60}px)`;
      bl.style.transform = `translateY(${p * 50}px)`;
    },
  });
}


/* ============================================================
   SCROLL BUTTON: bottom-right. In the hero it points down and
   jumps to the Material section; past that it flips up and
   returns to the top. Uses Lenis when it's running.
   ============================================================ */
function scrollButton() {
  const btn = document.getElementById("scrollBtn");
  const next = document.getElementById("wood-story");
  if (!btn || !next) return;
  let lenis = null;
  Promise.resolve(lenisReady).then((l) => (lenis = l));

  const nextTop = () => next.getBoundingClientRect().top + window.scrollY;
  let up = false;
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    btn.style.setProperty("--p", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);

    const isUp = window.scrollY > nextTop() - window.innerHeight / 2;
    if (isUp === up) return;
    up = isUp;
    btn.classList.toggle("up", up);
    btn.setAttribute("aria-label", up ? "Back to top" : "Scroll to next section");
  };
  window.addEventListener("scroll", () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();

  btn.addEventListener("click", () => {
    const target = up ? 0 : nextTop();
    if (lenis) lenis.scrollTo(target, { duration: up ? 1.6 : 1.2 });
    else window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
  });
}
