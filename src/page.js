// Shared script for the simple sub-pages (collection / projects / how-it-works):
// smooth scroll + mobile nav + fade-up reveals. No pinning/scrubbing here.
import "lenis/dist/lenis.css";
import { initNav, initReveals, initLenis } from "./shared.js";

initNav();
initReveals();
initLenis();
