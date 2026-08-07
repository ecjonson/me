import Image from "next/image";
import Link from "next/link";
import { Fragment, ViewTransition, useLayoutEffect, useRef } from "react";
import { projects } from "@/lib/projects";

// Roll-in timing.
// ROLL_BASE holds the stagger until the reveal wrapper (page.tsx) has finished
// fading in (~300ms delay + ~700ms duration). Otherwise the slide plays behind
// the still-fading wrapper and items look like they just appear in place. If you
// speed up that wrapper's opacity fade, you can lower ROLL_BASE to match.
// STEP spaces the items out; oldest (rightmost) fires first.
const ROLL_BASE = 1000;
const ROLL_STEP = 80;

// How far off the LEFT edge items wait before sliding in. Keeps the "stacked"
// phase hidden off-screen, so you only see them roll in — not pile up first.
// Must exceed a thumbnail's width (w-40 = 160px) so items are fully off-screen.
const ROLL_OFFSCREEN = 240;

// Timeline tick shown BEFORE the first (newest) project of each year. `intro` +
// `delay` let it join the greeting's staggered roll-in.
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

// `intro` (passed only while the greeting actually plays) triggers a quick
// roll-in that sweeps oldest → newest (right → left), landing on the newest last.
export function ProjectCarousel({ intro = false }: { intro?: boolean }) {
    const last = projects.length - 1;
    const listRef = useRef<HTMLUListElement>(null);
    const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

    // Returning from a project: center its thumbnail before paint so the reverse
    // morph has a visible source. Gated on lastProject, so a cold load of "/"
    // keeps the default position (newest, at the left).
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

    // Roll-in start positions. Each item should begin off-screen past the
    // carousel's LEFT edge and slide right into its slot — a different distance
    // per item — so we measure each resting position and write it to --roll-from,
    // which the @keyframes reads. offsetLeft is layout-based (unaffected by the
    // transform the animation is already applying), so the measurement is stable.
    // Runs before paint; React never touches --roll-from (it's not in the style
    // prop), so it survives the parent's frequent re-renders during the greeting.
    useLayoutEffect(() => {
        const list = listRef.current;
        if (!intro || !list) return;
        const els = list.querySelectorAll<HTMLElement>(".carousel-roll-in");
        els.forEach((el) => {
            const home = el.offsetLeft - list.scrollLeft; // resting distance from the left edge
            // Wait off-screen (ROLL_OFFSCREEN px left of the edge), then slide in
            // to the slot — so the stacked phase is hidden and only the roll shows.
            el.style.setProperty("--roll-from", `${-(home + ROLL_OFFSCREEN)}px`);
        });
    }, [intro]);

    return (
        <ul ref={listRef} className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
            {projects.map(({ slug, name, year, blurb, image, alt }, i) => {
                // Leading marker: sits to the LEFT of each year's newest project.
                const newYear = i === 0 || year !== projects[i - 1].year;
                // Oldest (highest index, rightmost) fires first.
                const delay = ROLL_BASE + (last - i) * ROLL_STEP;
                return (
                    <Fragment key={slug}>
                        {newYear && <YearMarker year={year} intro={intro} delay={delay + 40} />}
                        <li
                            ref={(el) => { if (el) itemRefs.current.set(slug, el); }}
                            className={`shrink-0 snap-start ${intro ? "carousel-roll-in" : ""}`}
                            style={intro ? { animationDelay: `${delay}ms` } : undefined}
                        >
                            <Link href={`/projects/${slug}`} title={blurb} className="group flex flex-col items-center gap-2">
                                {/* Shared element: this thumbnail morphs into the hero image on the
                                    project page. `name` must match the hero and be unique per snapshot,
                                    so it's keyed by slug. `share="morph"` tags the group as .morph for CSS. */}
                                <ViewTransition name={`project-${slug}`} share="morph">
                                    <span className="relative block h-28 w-40 overflow-hidden rounded-2xl border border-gray-200 transition-transform duration-300 ease-out group-hover:scale-105 group-focus-visible:scale-105 group-active:scale-105 dark:border-gray-800">
                                        <Image
                                            src={image}
                                            alt={alt}
                                            fill
                                            priority={i === last}
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