"use client";

import { useEffect, useRef, useState } from "react";
import { FaSun, FaMoon, FaCircleHalfStroke } from "react-icons/fa6";

type Theme = "light" | "dark" | "system";

const NEXT: Record<Theme, Theme> = { light: "dark", dark: "system", system: "light" };
const ICON = { light: FaSun, dark: FaMoon, system: FaCircleHalfStroke };
const LABEL = { light: "Light", dark: "Dark", system: "System" };

function prefersDark() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(theme: Theme) {
    const dark = theme === "dark" || (theme === "system" && prefersDark());
    document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>("system");
    const hydrated = useRef(false); // have we loaded the stored value yet?

    // Load the stored preference once, after hydration.
    useEffect(() => {
        const t = setTimeout(() => {
            const stored = localStorage.getItem("theme") as Theme | null;
            hydrated.current = true;
            if (stored === "light" || stored === "dark" || stored === "system")
                setTheme(stored);
        }, 0);
        return () => clearTimeout(t);
    }, []);

    // Apply theme on system change
    useEffect(() => {
        apply(theme);
        if (hydrated.current)
            localStorage.setItem("theme", theme);
        if (theme !== "system")
            return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => apply("system");
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, [theme]);

    const Icon = ICON[theme];

    return (
        <button
            type="button"
            onClick={() => setTheme((t) => NEXT[t])}
            aria-label={`Theme: ${LABEL[theme]}, tap to change`}
            title={`Theme: ${LABEL[theme]}`}
            className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
        >
            <Icon />
        </button>
    );
}