export type Theme = "light" | "dark" | "system" | "custom";
export type CustomColors = { primary: string; accent: string };

const THEME_KEY = "theme";
const CUSTOM_KEY = "customTheme";

// A Dracula-flavoured starting point (matches the site's existing accents).
export const DEFAULT_CUSTOM: CustomColors = { primary: "#0f172a", accent: "#50FA7B" };

// Swatch palettes for the custom-theme pickers. Text is not a choice — it's
// derived from the primary's luminance (see applyTheme).
export const PRIMARY_SWATCHES = ["#ffffff", "#faf7f0", "#0a0a0a", "#282a36", "#0f172a", "#1a1b26"];
export const ACCENT_SWATCHES  = ["#BD93F9", "#FF79C6", "#FF5555", "#F1FA8C", "#50FA7B", "#8BE9FD"];

export function systemPrefersDark(): boolean {
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getTheme(): Theme {
    if (typeof window === "undefined") return "system";
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" || t === "system" || t === "custom" ? t : "system";
}

export function getCustomColors(): CustomColors {
    if (typeof window === "undefined") return DEFAULT_CUSTOM;
    try {
        const c = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "null");
        if (c) {
            // `bg` accepted as a legacy alias so an older saved theme survives the rename.
            const primary = typeof c.primary === "string" ? c.primary : typeof c.bg === "string" ? c.bg : null;
            if (primary && typeof c.accent === "string") return { primary, accent: c.accent };
        }
    } catch {}
    return DEFAULT_CUSTOM;
}

// WCAG relative luminance → decide whether the primary reads as "dark", so the
// text / grays / borders / cursor (all keyed to .dark) stay legible in custom mode.
export function isDarkColor(hex: string): boolean {
    let m = hex.replace("#", "");
    if (m.length === 3) m = m.split("").map((c) => c + c).join("");
    const r = parseInt(m.slice(0, 2), 16) / 255;
    const g = parseInt(m.slice(2, 4), 16) / 255;
    const b = parseInt(m.slice(4, 6), 16) / 255;
    const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) < 0.5;
}

// Custom mode writes primary + accent inline on <html> (inline styles beat the
// stylesheet's :root / .dark). Foreground is intentionally NOT set — it's left to
// the .dark class (toggled by the primary's luminance), so text derives itself.
export function applyTheme(theme: Theme, custom: CustomColors = getCustomColors()): void {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "custom") {
        root.style.setProperty("--background", custom.primary);
        root.style.setProperty("--accent", custom.accent);
        root.style.removeProperty("--foreground"); // implicit: follows .dark
        root.classList.toggle("dark", isDarkColor(custom.primary));
    } else {
        root.style.removeProperty("--background");
        root.style.removeProperty("--foreground");
        root.style.removeProperty("--accent");
        root.classList.toggle("dark", theme === "dark" || (theme === "system" && systemPrefersDark()));
    }
}

export function setTheme(theme: Theme): void {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
}

export function setCustomColors(custom: CustomColors): void {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));
    applyTheme("custom", custom);
}