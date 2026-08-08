import Image from "next/image";
import Link from "next/link";
import { Fragment, ViewTransition, useLayoutEffect, useRef } from "react";
import { projects } from "@/lib/projects";
import { markViewTransition } from "@/lib/motion";

// Roll-in timing.
// ROLL_BASE holds the stagger until the reveal wrapper (page.tsx) has finished
// fading in (~300ms delay + ~700ms duration). Otherwise the slide plays behind
// the still-fading wrapper and items look like they just appear in place. If you
// speed up that wrapper's opacity fade, you can lower ROLL_BASE to match.
// STEP spaces the items out; oldest (rightmost) fires first.
const ROLL_BASE = 1000;
const ROLL_STEP = 80;
// Must match the animation-duration of .carousel-roll-in in globals.css.
const ROLL_DURATION = 1000;

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
        // Reset to the resting position FIRST. Replaying the greeting after
        // coming back from a project meant the strip was still scrolled to that
        // project's centred thumbnail, and every offset below was measured
        // against that scroll — so the roll-in started mid-strip and settled on
        // the centred project instead of sweeping the whole row. The intro
        // always plays from the newest project at the left edge.
        list.scrollLeft = 0;
        // Drop the centring hint too, so it can't re-apply on a later mount.
        try { sessionStorage.removeItem("lastProject"); } catch {}
        const els = list.querySelectorAll<HTMLElement>(".carousel-roll-in");
        els.forEach((el) => {
            const home = el.offsetLeft - list.scrollLeft; // resting distance from the left edge
            // Wait off-screen (ROLL_OFFSCREEN px left of the edge), then slide in
            // to the slot — so the stacked phase is hidden and only the roll shows.
            el.style.setProperty("--roll-from", `${-(home + ROLL_OFFSCREEN)}px`);
        });

        // Mandatory scroll snapping keeps the scrollport aligned to a snap area,
        // and a snap area is the item's TRANSFORMED box — so during the roll-in
        // every snap position in the strip is sliding. The container chases them,
        // and once the items settle it's parked between snap points. Nothing looks
        // wrong until you touch it: the first touch re-snaps, the strip lurches by
        // an item at the exact moment you tap, and you open its neighbour.
        //
        // So suspend snapping for the duration and put the scroll back at the start
        // when everything lands. Restoring to "" hands control back to the
        // stylesheet's snap-x snap-mandatory rather than hard-coding it here.
        //
        // pointer-events covers the same window for a different reason — the newest
        // project is the LAST to arrive, so it's still moving under your finger
        // while the sweep finishes. A tap that does nothing is the better failure.
        // Both are written straight to the node: no render depends on them, and
        // setting them in a layout effect means they apply in the first painted frame.
        list.style.scrollSnapType = "none";
        list.style.pointerEvents = "none";
        // +40 matches the year marker's extra offset — it lands last of all.
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
                            <Link
                                href={`/projects/${slug}`}
                                title={blurb}
                                onClick={() => markViewTransition("enter")}
                                className="group flex flex-col items-center gap-2"
                            >
                                {/* Shared element: this thumbnail morphs into the hero image on the
                                    project page. `name` must match the hero and be unique per snapshot,
                                    so it's keyed by slug. `share="morph"` tags the group as .morph for CSS. */}
                                <ViewTransition name={`project-${slug}`} share="morph">
                                    <span className="relative block h-28 w-40 overflow-hidden rounded-2xl border border-gray-200 transition-transform duration-300 ease-out group-hover:scale-105 group-focus-visible:scale-105 group-active:scale-105 dark:border-gray-800">
                                        <Image
                                            src={image}
                                            alt={alt}
                                            fill
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