// reduced-motion preference
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

// is motion reduced right now, given the (defaulted) preference?
export function isReducedMotion(pref: MotionPref = getMotionPref()): boolean {
    return pref === "reduced" || (pref === "system" && systemPrefersReduced());
}

// reflect the effective state on <html> for CSS to hook into
export function applyMotion(pref: MotionPref = getMotionPref()): void {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("reduce-motion", isReducedMotion(pref));
}

// view-transition direction
export function markViewTransition(dir: "enter" | "exit", ms = 900): void {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.dataset.vt = dir;
    window.setTimeout(() => {
        if (root.dataset.vt === dir) delete root.dataset.vt;
    }, ms);
}