"use client";

import { useMemo, type CSSProperties } from "react";

type Variant = "grid" | "dots" | "lines" | "glow" | "frame";

// variants eligible for the per-project random pick (frame is opt-in only).
const RANDOM_VARIANTS: Variant[] = ["grid", "dots", "lines", "glow"];

// cheap deterministic hash
function hash(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
    return Math.abs(h);
}

// center-weighted fade so patterns look intentional
const MASK = "radial-gradient(ellipse 85% 75% at 50% 40%, #000 30%, transparent 82%)";
const mix = (pct: number) => `color-mix(in srgb, var(--accent) ${pct}%, transparent)`;

// a faint, accent-tinted layer behind the page
export function ProjectBackdrop({ seed, variant }: { seed: string; variant?: Variant }) {
    const { resolved, spots } = useMemo(() => {
        const h = hash(seed);
        return {
            resolved: variant ?? RANDOM_VARIANTS[h % RANDOM_VARIANTS.length],
            spots: {
                a: `${15 + (h % 70)}% ${10 + ((h >> 3) % 45)}%`,
                b: `${55 + ((h >> 6) % 40)}% ${50 + ((h >> 9) % 45)}%`,
            },
        };
    }, [seed, variant]);

    // framing variant is a border, not a background layer
    if (resolved === "frame") {
        return (
            <div
                aria-hidden="true"
                className="vt-backdrop pointer-events-none fixed inset-3 -z-10 rounded-3xl border border-accent/20 lg:inset-6"
            />
        );
    }

    let style: CSSProperties;
    let drift = false;

    if (resolved === "glow") {
        style = {
            background:
                `radial-gradient(38rem 38rem at ${spots.a}, ${mix(16)}, transparent 70%), ` +
                `radial-gradient(32rem 32rem at ${spots.b}, ${mix(12)}, transparent 70%)`,
        };
        drift = true;
    } else if (resolved === "grid") {
        style = {
            backgroundImage:
                `linear-gradient(to right, ${mix(9)} 1px, transparent 1px), ` +
                `linear-gradient(to bottom, ${mix(9)} 1px, transparent 1px)`,
            backgroundSize: "44px 44px",
            maskImage: MASK,
            WebkitMaskImage: MASK,
        };
    } else if (resolved === "dots") {
        style = {
            backgroundImage: `radial-gradient(${mix(18)} 1.2px, transparent 1.4px)`,
            backgroundSize: "22px 22px",
            maskImage: MASK,
            WebkitMaskImage: MASK,
        };
    } else {
        // lines
        style = {
            backgroundImage: `repeating-linear-gradient(-45deg, ${mix(8)} 0 1px, transparent 1px 15px)`,
            maskImage: MASK,
            WebkitMaskImage: MASK,
        };
    }

    return (
        <div
            aria-hidden="true"
            className="vt-backdrop pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
            <div
                className={`absolute inset-[-10%] ${drift ? "motion-safe:animate-[backdrop-drift_26s_ease-in-out_infinite_alternate]" : ""}`}
                style={style}
            />
        </div>
    );
}