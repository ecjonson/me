"use client";

import { useEffect, useRef, useState } from "react";
import { FaGear, FaRotateLeft, FaCircleHalfStroke, FaPlay, FaPause, FaSun, FaMoon, FaPalette } from "react-icons/fa6";
import {
    applyTheme,
    getCustomColors,
    getTheme,
    setCustomColors,
    setTheme,
    PRIMARY_SWATCHES,
    ACCENT_SWATCHES,
    type CustomColors,
    type Theme,
} from "@/lib/theme";
import { applyMotion, getMotionPref, systemPrefersReduced, type MotionPref } from "@/lib/motion";

const NEXT_THEME: Record<Theme, Theme> = { light: "dark", dark: "system", system: "custom", custom: "light" };
const THEME_ICON = { light: FaSun, dark: FaMoon, system: FaCircleHalfStroke, custom: FaPalette };
const THEME_LABEL = { light: "Light", dark: "Dark", system: "System", custom: "Custom" };

const NEXT_MOTION: Record<MotionPref, MotionPref> = { full: "reduced", reduced: "system", system: "full" };
const MOTION_ICON = { full: FaPlay, reduced: FaPause, system: FaCircleHalfStroke };
const MOTION_LABEL = { full: "Full", reduced: "Reduced", system: "System" };

const rowCls = "flex w-full items-center justify-between gap-6 text-sm";
const rowLabel = "text-gray-600 dark:text-gray-400";
const controlCls = "inline-flex items-center gap-2 transition-colors hover:text-[var(--accent)]";

// One custom-colour row: label + a small swatch palette (wraps if the panel is
// narrow so it can never overflow).
function SwatchRow({ label, value, swatches, onPick }: {
    label: string;
    value: string;
    swatches: string[];
    onPick: (c: string) => void;
}) {
    return (
        <div className={rowCls}>
            <span className={rowLabel}>{label}</span>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
                {swatches.map((c) => {
                    const active = c.toLowerCase() === value.toLowerCase();
                    return (
                        <button
                            key={c}
                            type="button"
                            onClick={() => onPick(c)}
                            aria-label={c}
                            aria-pressed={active}
                            title={c}
                            style={{ backgroundColor: c }}
                            className={`h-5 w-5 rounded-full border border-gray-300/60 ring-offset-2 ring-offset-white transition-transform hover:scale-110 dark:border-gray-600/60 dark:ring-offset-gray-950 ${
                                active ? "ring-2 ring-gray-500 dark:ring-gray-300" : "ring-0"
                            }`}
                        />
                    );
                })}
            </div>
        </div>
    );
}

// The collapsible container. A gear button opens a frosted popover; closes on
// outside-click / Escape. Theme + motion state live here so the custom-colour
// rows and the replay-disabled state can react to them.
export function SettingsMenu({ onReplay }: { onReplay: () => void }) {
    const [open, setOpen] = useState(false);
    // Lazy initialisers read localStorage; the closed trigger's markup doesn't
    // depend on them, so there's no hydration mismatch — and the inline script in
    // layout.tsx already painted the correct colours, so nothing flashes.
    const [theme, setThemeState] = useState<Theme>(() => getTheme());
    const [custom, setCustomState] = useState<CustomColors>(() => getCustomColors());
    const [motion, setMotionState] = useState<MotionPref>(() => getMotionPref());
    const [systemReduced, setSystemReduced] = useState(() => systemPrefersReduced());
    const ref = useRef<HTMLDivElement>(null);

    // Re-apply theme if the OS scheme flips while on "System".
    useEffect(() => {
        if (theme !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => applyTheme("system");
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, [theme]);

    // Track the OS reduced-motion setting (keeps replay-disabled correct on "System").
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = () => {
            setSystemReduced(mq.matches);
            if (motion === "system") applyMotion("system");
        };
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, [motion]);

    // Close on outside-click / Escape.
    useEffect(() => {
        if (!open) return;
        const onPointer = (e: PointerEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointer);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointer);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const cycleTheme = () => {
        const next = NEXT_THEME[theme];
        setThemeState(next);
        setTheme(next); // persist + apply
    };
    const pickColor = (patch: Partial<CustomColors>) => {
        const next = { ...custom, ...patch };
        setCustomState(next);
        setCustomColors(next); // persist + apply (also flips .dark by luminance)
    };
    const cycleMotion = () => {
        const next = NEXT_MOTION[motion];
        setMotionState(next);
        localStorage.setItem("motion", next);
        applyMotion(next);
    };

    const reduced = motion === "reduced" || (motion === "system" && systemReduced);
    const isCustom = theme === "custom";
    const ThemeIcon = THEME_ICON[theme];
    const MotionIcon = MOTION_ICON[motion];

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label="Settings"
                aria-expanded={open}
                title="Settings"
                className={`transition-colors hover:text-accent ${open ? "text-accent" : ""}`}
            >
                <FaGear className={`transition-transform duration-300 ${open ? "rotate-45" : ""}`} />
            </button>

            {open && (
                <div
                    aria-label="Settings"
                    className={`absolute right-0 top-full mt-3 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200/70 bg-white/90 p-4 text-base text-gray-600 shadow-lg backdrop-blur-md dark:border-gray-800/70 dark:bg-gray-950/85 dark:text-gray-400 ${
                        isCustom ? "w-80" : "w-60"
                    }`}
                >
                    <div className="flex flex-col gap-4">
                        {/* Theme */}
                        <div className={rowCls}>
                            <span className={rowLabel}>Theme</span>
                            <button
                                type="button"
                                onClick={cycleTheme}
                                aria-label={`Theme: ${THEME_LABEL[theme]}, tap to change`}
                                title={`Theme: ${THEME_LABEL[theme]}`}
                                className={controlCls}
                            >
                                <span className="text-xs">{THEME_LABEL[theme]}</span>
                                <ThemeIcon />
                            </button>
                        </div>

                        {/* Custom colours — only while the custom theme is active */}
                        {isCustom && (
                            <div className="flex flex-col gap-3 rounded-xl bg-gray-500/5 p-3 dark:bg-white/5">
                                <SwatchRow label="Primary" value={custom.primary} swatches={PRIMARY_SWATCHES} onPick={(c) => pickColor({ primary: c })} />
                                <SwatchRow label="Accent" value={custom.accent} swatches={ACCENT_SWATCHES} onPick={(c) => pickColor({ accent: c })} />
                            </div>
                        )}

                        {/* Motion */}
                        <div className={rowCls}>
                            <span className={rowLabel}>Motion</span>
                            <button
                                type="button"
                                onClick={cycleMotion}
                                aria-label={`Motion: ${MOTION_LABEL[motion]}, tap to change`}
                                title={`Motion: ${MOTION_LABEL[motion]}`}
                                className={controlCls}
                            >
                                <span className="text-xs">{MOTION_LABEL[motion]}</span>
                                <MotionIcon />
                            </button>
                        </div>

                        <hr className="border-gray-200 dark:border-gray-800" />

                        {/* Replay */}
                        <button
                            type="button"
                            disabled={reduced}
                            onClick={() => {
                                setOpen(false);
                                onReplay();
                            }}
                            title={reduced ? "Turn motion back on to replay the intro" : "Replay intro"}
                            className={`${rowCls} ${reduced ? "opacity-50 disabled:cursor-not-allowed" : controlCls}`}
                        >
                            <span className={rowLabel}>Replay intro</span>
                            <FaRotateLeft />
                        </button>
                        {reduced && (
                            <p className="-mt-2 text-xs text-gray-500 dark:text-gray-500">
                                The intro is animated — turn motion back on to replay it.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}