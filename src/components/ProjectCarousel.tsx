import Image from "next/image";
import Link from "next/link";
import { Fragment, ViewTransition, useLayoutEffect, useRef } from "react";
import { projects } from "@/lib/projects";
import { markViewTransition } from "@/lib/motion";

// roll-in timing.
const ROLL_BASE = 1000; // holds the stagger until the reveal wrapper (page.tsx) has finished fading in
const ROLL_STEP = 80; // spaces the items out; oldest (rightmost) fires first
const ROLL_DURATION = 1000; // must match the animation-duration of .carousel-roll-in in globals.css

// how far off the LEFT edge items wait before sliding in
const ROLL_OFFSCREEN = 240;

// timeline tick
function YearMarker({ year, intro, delay }: { year: number; intro?: boolean; delay?: number }) {
    return (
        <li
            className={`flex shrink-0 snap-start flex-col items-center gap-2 ${intro ? "carousel-roll-in" : ""}`}
            style={intro ? { animationDelay: `${delay}ms` } : undefined}
        >
            <div className="flex h-28 flex-col items-center justify-center gap-2">
                <span aria-hidden="true" className="w-px flex-1 bg-gray-200 dark:bg-gray-800" />
                <span className="text-xs font-medium tabular-nums text-gray-500 dark:text-gray-400">{year}</span>
                <span aria-hidden="true" className="w-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>
            {/* keeps the marker the same total height as a project (thumbnail + name row) */}
            <span aria-hidden="true" className="text-xs">&nbsp;</span>
        </li>
    );
}

// intro
export function ProjectCarousel({ intro = false }: { intro?: boolean }) {
    const last = projects.length - 1;
    const listRef = useRef<HTMLUListElement>(null);
    const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

    // center thumbnail before paint so the reverse morph has a visible source
    useLayoutEffect(() => {
        let slug: string | null = null;
        try { slug = sessionStorage.getItem("lastProject"); } catch {}
        if (!slug) return;
        itemRefs.current.get(slug)?.scrollIntoView({
            inline: "center",
            block: "nearest",
            behavior: "instant" as ScrollBehavior,
        });
    }, []);

    // roll-in start positions
    useLayoutEffect(() => {
        const list = listRef.current;
        if (!intro || !list) return;
        // reset to the resting position FIRST
        list.scrollLeft = 0;
        try { sessionStorage.removeItem("lastProject"); } catch {}
        const els = list.querySelectorAll<HTMLElement>(".carousel-roll-in");
        els.forEach((el) => {
            const home = el.offsetLeft - list.scrollLeft; // resting distance from the left edge
            // wait off-screen (ROLL_OFFSCREEN px left of the edge), then slide in
            el.style.setProperty("--roll-from", `${-(home + ROLL_OFFSCREEN)}px`);
        });

        list.style.scrollSnapType = "none";
        list.style.pointerEvents = "none";

        // +40 matches the year marker's extra offset — it lands last of all
        const settled = ROLL_BASE + last * ROLL_STEP + 40 + ROLL_DURATION;
        const t = setTimeout(() => {
            list.scrollLeft = 0;
            list.style.scrollSnapType = "";
            list.style.pointerEvents = "";
        }, settled);
        return () => {
            clearTimeout(t);
            list.style.scrollSnapType = "";
            list.style.pointerEvents = "";
        };
    }, [intro, last]);

    return (
        <ul ref={listRef} className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
            {projects.map(({ slug, name, year, blurb, image, alt, animated=false }, i) => {
                // leading marker
                const newYear = i === 0 || year !== projects[i - 1].year;
                // oldest (highest index, rightmost) fires first.
                const delay = ROLL_BASE + (last - i) * ROLL_STEP;
                return (
                    <Fragment key={slug}>
                        {newYear && <YearMarker year={year} intro={intro} delay={delay + 40} />}
                        <li
                            ref={(el) => { if (el) itemRefs.current.set(slug, el); }}
                            className={`shrink-0 snap-start ${intro ? "carousel-roll-in" : ""}`}
                            style={intro ? { animationDelay: `${delay}ms` } : undefined}
                        >
                            <Link
                                href={`/projects/${slug}`}
                                title={blurb}
                                onClick={() => markViewTransition("enter")}
                                className="group flex flex-col items-center gap-2"
                            >
                                {/* Shared element */}
                                <ViewTransition name={`project-${slug}`} share="morph">
                                    <span className="relative block h-28 w-40 overflow-hidden rounded-2xl border border-gray-200 transition-transform duration-300 ease-out group-hover:scale-105 group-focus-visible:scale-105 group-active:scale-105 dark:border-gray-800">
                                        <Image
                                            src={image}
                                            alt={alt}
                                            fill
                                            unoptimized={animated}
                                            priority={i === 0}
                                            sizes="160px"
                                            className="object-cover transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-110"
                                        />
                                    </span>
                                </ViewTransition>
                                <span className="w-40 text-center text-xs text-gray-600 dark:text-gray-400">{name}</span>
                            </Link>
                        </li>
                    </Fragment>
                );
            })}
        </ul>
    );
}