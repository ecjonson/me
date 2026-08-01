// Reduced-motion preference. Mirrors the theme model: an explicit user choice
// that can override the OS, with "system" deferring to prefers-reduced-motion.
//
// The *effective* state is reflected as a `reduce-motion` class on <html> (set
// here + by the inline script in layout.tsx), so both CSS and the JS that drives
// the intro / view transitions can read one source of truth.

export type MotionPref = "full" | "reduced" | "system";

const KEY = "motion";

export function systemPrefersReduced(): boolean {
    return (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
}

export function getMotionPref(): MotionPref {
    if (typeof window === "undefined") return "system";
    const v = localStorage.getItem(KEY);
    return v === "full" || v === "reduced" || v === "system" ? v : "system";
}

// Is motion reduced right now, given the (defaulted) preference?
export function isReducedMotion(pref: MotionPref = getMotionPref()): boolean {
    return pref === "reduced" || (pref === "system" && systemPrefersReduced());
}

// Reflect the effective state on <html> for CSS to hook into.
export function applyMotion(pref: MotionPref = getMotionPref()): void {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("reduce-motion", isReducedMotion(pref));
}