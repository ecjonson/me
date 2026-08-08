"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ViewTransition, useEffect, useRef, useState } from "react";
import { ProjectBackdrop } from "@/components/ProjectBackdrop";
import { projects } from "@/lib/projects";
import { isReducedMotion, markViewTransition } from "@/lib/motion";
import type { Project, ProjectLink, ProjectSection } from "@/lib/projects";

/**
 * Mobile-first spacing contract that keeps images clear of the fixed nav.
 *   mobile: bottom bar  -> reserve bottom space (pb-20), small margins elsewhere
 *   desktop: left rail  -> reserve left space (lg:pl-44), normal bottom
 * box-border (Tailwind default) keeps h-dvh + padding == one screen.
 */
const SECTION_FRAME = "pt-3 pr-3 pl-3 pb-20 lg:pt-6 lg:pr-6 lg:pb-6 lg:pl-44";

// Desktop image width per `size`. MD = half text / half image; XL fills the
// frame with the copy overlaid. (Mobile stacking is unaffected by size.)
type SectionSize = "XS" | "SM" | "MD" | "LG" | "XL";
const IMAGE_BASIS_LG: Record<SectionSize, string> = {
    XS: "lg:basis-1/4",
    SM: "lg:basis-1/3",
    MD: "lg:basis-1/2",
    LG: "lg:basis-2/3",
    XL: "", // handled separately (image goes full-bleed)
};

function SectionBlock({ section: s, index }: { section: ProjectSection; index: number }) {
    // Alternates the stack/split order: even = image first, odd = text first.
    const reverse = index % 2 === 1;
    const hasImage = !!s.image;
    const size = (s.size ?? "MD") as SectionSize;
    const isXL = size === "XL";

    // For XL the copy sits over the image on desktop, so it needs light colours there.
    const labelCls = `mb-2 text-sm font-medium uppercase tracking-wide text-accent ${isXL ? "lg:text-[color-mix(in_srgb,var(--accent)_65%,white)]" : ""}`;
    const headingCls = `text-3xl font-bold tracking-tight sm:text-4xl ${isXL ? "lg:text-white" : ""}`;
    const bodyCls = `mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300 ${isXL ? "lg:text-gray-200 lg:dark:text-gray-200" : ""}`;

    const text = (
        <>
            <p className={labelCls}>{s.label}</p>
            <h2 className={headingCls}>{s.heading}</h2>
            <p className={bodyCls}>{s.body}</p>
        </>
    );

    if (!hasImage) {
        return (
            <section id={s.id} className={`flex h-dvh snap-start items-center ${SECTION_FRAME}`}>
                <div className={`w-full max-w-2xl px-2 sm:px-6 ${reverse ? "lg:ml-auto lg:text-right" : ""}`}>{text}</div>
            </section>
        );
    }

    return (
        <section id={s.id} className={`relative h-dvh snap-start ${SECTION_FRAME}`}>
            {/* Mobile: stacked split (order alternating), unaffected by size.
                Desktop: image width follows `size`; XL fills and the copy overlays. */}
            <div className={`relative flex h-full w-full gap-4 lg:gap-6 ${reverse ? "flex-col-reverse lg:flex-row-reverse" : "flex-col lg:flex-row"}`}>
                {/* Image: stacked band on mobile; sized column (or full-bleed for XL) on desktop */}
                <div
                    className={`relative w-full shrink-0 basis-2/5 overflow-hidden rounded-2xl ${
                        isXL ? "lg:absolute lg:inset-0" : IMAGE_BASIS_LG[size]
                    }`}
                >
                    <Image
                        src={s.image!}
                        alt={s.alt ?? ""}
                        fill
                        sizes="(min-width: 1024px) 66vw, 100vw"
                        className="object-cover"
                        style={{ objectPosition: s.focal ?? "center" }}
                    />
                    {/* Readability scrim — only when the copy overlays (XL, desktop). */}
                    {isXL && <div className="absolute inset-0 hidden bg-linear-to-r from-black/70 via-black/20 to-transparent lg:block" />}
                </div>
                {/* Text */}
                <div className={`flex min-h-0 flex-1 items-center px-4 sm:px-6 lg:px-12 ${isXL ? "lg:relative lg:z-10 lg:max-w-2xl" : ""}`}>
                    <div className="max-w-xl">{text}</div>
                </div>
            </div>
        </section>
    );
}

export function ProjectView({ project }: { project: Project }) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const items = [
        { id: "hero", label: project.name },
        ...project.sections.map((s) => ({ id: s.id, label: s.label })),
    ];
    const [active, setActive] = useState(items[0].id);

    // Sibling projects for the end-of-nav hand-offs. Linear (no wrap): the first
    // project has no previous and the last has no next, so each control only
    // appears "when applicable". Driven off the objects directly so TS narrows them.
    const projectIndex = projects.findIndex((p) => p.slug === project.slug);
    const prevProject = projects[projectIndex - 1]; // undefined on the first project
    const nextProject = projects[projectIndex + 1]; // undefined on the last project

    // Mobile nav: translate the label strip so the active tab sits at the left,
    // right next to the back button. No horizontal scrolling.
    const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
    const [navOffset, setNavOffset] = useState(0);
    const [navReady, setNavReady] = useState(false);

    // The nav element — the scroll handler forwards gestures into the scroller.
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const root = scrollerRef.current;
        if (!root) return;
        const targets = items
            .map((i) => root.querySelector<HTMLElement>(`#${CSS.escape(i.id)}`))
            .filter((el): el is HTMLElement => el !== null);

        const io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
            },
            { root, threshold: 0.55 }
        );
        targets.forEach((t) => io.observe(t));
        return () => io.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.slug]);

    useEffect(() => {
        const realign = () => {
            // Desktop is a vertical rail — no horizontal offset.
            if (window.matchMedia("(min-width: 1024px)").matches) {
                setNavOffset(0);
                setNavReady(true);
                return;
            }
            const idx = items.findIndex((i) => i.id === active);
            const el = itemRefs.current[idx];
            if (!el) return;
            // Left-align the active tab (its left edge to the strip's left edge).
            setNavOffset(-el.offsetLeft);
            setNavReady(true);
        };
        realign();
        window.addEventListener("resize", realign);
        return () => window.removeEventListener("resize", realign);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, project.slug]);

    // Forward wheel/touch over the nav straight into the section scroller, so it
    // scrolls exactly like the page does — same native momentum, same CSS snap.
    // We don't step or debounce; we just relay the deltas and let scroll-snap land.
    useEffect(() => {
        const nav = navRef.current;
        const root = scrollerRef.current;
        if (!nav || !root) return;

        const onWheel = (e: WheelEvent) => {
            // Vertical rail uses deltaY; horizontal mobile strip uses deltaX.
            const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            if (delta === 0) return;
            e.preventDefault(); // relay to the scroller instead of scrolling the page
            // Normalise line/page deltas to pixels so the feel matches the trackpad.
            const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? root.clientHeight : 1;
            // behavior:"auto" overrides the scroller's scroll-smooth so momentum stays 1:1.
            root.scrollBy({ top: delta * unit, behavior: "auto" });
        };

        // Touch: track the finger 1:1; snap-mandatory settles on the nearest
        // section when the finger lifts (no manual fling, but no overshoot either).
        let lastX = 0;
        let lastY = 0;
        const onTouchStart = (e: TouchEvent) => {
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
        };
        const onTouchMove = (e: TouchEvent) => {
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;
            const dx = x - lastX;
            const dy = y - lastY;
            lastX = x;
            lastY = y;
            const delta = Math.abs(dy) >= Math.abs(dx) ? dy : dx;
            if (delta === 0) return;
            e.preventDefault();
            root.scrollBy({ top: -delta, behavior: "auto" }); // drag down/right → go back
        };

        nav.addEventListener("wheel", onWheel, { passive: false });
        nav.addEventListener("touchstart", onTouchStart, { passive: true });
        nav.addEventListener("touchmove", onTouchMove, { passive: false });
        return () => {
            nav.removeEventListener("wheel", onWheel);
            nav.removeEventListener("touchstart", onTouchStart);
            nav.removeEventListener("touchmove", onTouchMove);
        };

    }, [project.slug]);

    // Esc exits to the index, the way a modal closes — reinforces the popup feel.
    // Mainly a desktop/keyboard nicety, but harmless everywhere. Routes to "/" (home),
    // matching the back/× controls rather than browser history.
    const router = useRouter();

    // Every route out of a project tags <html data-vt="exit"> so globals.css can
    // treat leaving differently from arriving (CSS can't tell them apart — the
    // old root snapshot is "home" one way and "this page" the other).
    const leaveHome = () => markViewTransition("exit");

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !e.defaultPrevented) {
                leaveHome();
                router.push("/");
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [router]);

    // History back — the browser button, Android's back gesture, iOS edge-swipe —
    // never runs a click handler, so tag it here as well. Without this a gesture
    // back falls through to the untagged default and the page pops instead of
    // leaving with the morph. popstate fires before the router commits, so the
    // attribute is in place by the time the transition captures.
    useEffect(() => {
        const onPop = () => markViewTransition("exit");
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, []);

    const slideDir = (dir: "next" | "prev") => () => {
        if (typeof document === "undefined" || isReducedMotion()) return;
        const root = document.documentElement;
        root.dataset.slide = dir;
        window.setTimeout(() => {
            if (root.dataset.slide === dir) delete root.dataset.slide;
        }, 700);
    };

    // Remember the current project so the home carousel can bring this thumbnail
    // back on-screen for the reverse morph (see ProjectCarousel).
    useEffect(() => {
        try { sessionStorage.setItem("lastProject", project.slug); } catch {}
    }, [project.slug]);

    // Mobile: horizontal swipe swaps projects like flipping between app screens.
    // Vertical scroll and the nav's own gesture forwarding are untouched — we only
    // act once a drag is clearly horizontal.
    useEffect(() => {
        const root = scrollerRef.current;
        if (!root) return;
        if (!window.matchMedia("(max-width: 1023px)").matches) return; // touch/mobile only

        const SWIPE_MIN = 60; // px of horizontal travel to commit
        const AXIS_LOCK = 12; // px before locking to an axis
        let startX = 0, startY = 0, dx = 0, dy = 0;
        let axis: "none" | "x" | "y" = "none";

        const onStart = (e: TouchEvent) => {
            if (e.touches.length !== 1) { axis = "y"; return; } // pinch/multi → ignore
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            dx = dy = 0;
            axis = "none";
        };
        const onMove = (e: TouchEvent) => {
            if (axis === "y") return;
            dx = e.touches[0].clientX - startX;
            dy = e.touches[0].clientY - startY;
            if (axis === "none" && (Math.abs(dx) > AXIS_LOCK || Math.abs(dy) > AXIS_LOCK)) {
                axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
            }
            if (axis === "x") e.preventDefault(); // suppress edge-back / rubber-band
        };
        const onEnd = () => {
            if (axis === "x" && Math.abs(dx) >= SWIPE_MIN) {
                const goNext = dx < 0;                        // finger left → next
                const target = goNext ? nextProject : prevProject;
                if (target) {
                    slideDir(goNext ? "next" : "prev")();
                    router.push(`/projects/${target.slug}`);
                }
            }
            axis = "none";
        };

        root.addEventListener("touchstart", onStart, { passive: true });
        root.addEventListener("touchmove", onMove, { passive: false });
        root.addEventListener("touchend", onEnd, { passive: true });
        return () => {
            root.removeEventListener("touchstart", onStart);
            root.removeEventListener("touchmove", onMove);
            root.removeEventListener("touchend", onEnd);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.slug, prevProject, nextProject]);

    return (
        <ViewTransition default="vt-page">
            <div className="vt-page-root relative">
                {/* Ambient backdrop. Carries `vt-backdrop`, which names it project-backdrop
                    at every size (see globals.css) — its own group is what keeps the wash
                    behind the morphing image, and it fades in on arrival only. */}
                <ProjectBackdrop seed={project.slug} />

                {/* Close (×) — mobile only, where the nav sits at the bottom and the page
                    reads as a popup. On desktop the left rail (with its Back link) covers
                    this, so a second dismiss control would just be noise. */}
                <Link
                    href="/"
                    aria-label="Close"
                    onClick={leaveHome}
                    className="fixed right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100/90 text-lg leading-none text-gray-600 backdrop-blur-sm transition-colors hover:text-accent lg:hidden dark:bg-gray-800/90 dark:text-gray-300"
                >
                    ×
                </Link>

                {/* Section outline.
                    Mobile: bottom bar with a back bubble pinned left + a left-aligned
                            label strip (active tab sits next to the back button).
                    Desktop (lg): left rail, same bubble aesthetic.
                    `vt-section-nav` applies view-transition-name: section-nav — but only
                    at lg and up (see globals.css). On mobile the bar deliberately has NO
                    name: it's the twin of home's contact bar, so sliding one out while an
                    identical one slides in just reads as jitter. Unnamed, it rides along
                    inside the page snapshot instead. */}
                <nav
                    ref={navRef}
                    aria-label="Sections"
                    className="vt-section-nav fixed inset-x-0 bottom-0 z-40 flex h-14 touch-none items-center gap-1 overscroll-contain border-t border-gray-200/70 bg-white/80 px-2 backdrop-blur-sm lg:inset-x-auto lg:left-0 lg:top-0 lg:h-dvh lg:w-40 lg:flex-col lg:items-start lg:justify-center lg:gap-2 lg:border-t-0 lg:border-r lg:px-4 dark:border-gray-800/70 dark:bg-gray-950/60"
                >
                    {/* Home — desktop only; a compact frosted pill pinned to the page's
                        top-left (mirrors the mobile ×). Absolutely positioned so it sits in
                        the corner rather than the centered rail stack, but kept inside the
                        nav so it still slides in with the rail. The arrow is decorative;
                        the "Back" label is the accessible name. */}
                    <Link
                        href="/"
                        title="Back to projects"
                        onClick={leaveHome}
                        className="absolute left-4 top-4 hidden h-9 items-center gap-1.5 rounded-full bg-gray-100/90 pl-2.5 pr-3.5 text-sm font-medium leading-none text-gray-600 backdrop-blur-sm transition-colors hover:text-accent lg:inline-flex dark:bg-gray-800/90 dark:text-gray-300"
                    >
                        <span aria-hidden="true" className="text-lg leading-none">←</span>
                        Back
                    </Link>

                    {/* Previous project — desktop rail only, pinned at the top to mirror
                        the "next" link at the bottom. On mobile, prev lives in the bubble below. */}
                    {prevProject ? (
                        <>
                            <Link
                                href={`/projects/${prevProject.slug}`}
                                onClick={slideDir("prev")}
                                title={`Previous project: ${prevProject.name}`}
                                className="hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-(--accent-soft) lg:flex lg:w-full"
                            >
                                <span aria-hidden="true">←</span>
                                <span className="max-w-32 truncate lg:max-w-full">{prevProject.name}</span>
                            </Link>
                            <span aria-hidden="true" className="hidden bg-gray-200 lg:my-1 lg:block lg:h-px lg:w-full dark:bg-gray-800" />
                        </>
                    ) : null}

                    {/* Bubble — mobile only. On the first project it's the home/back arrow.
                        On every other project it becomes "previous project" (blue), since
                        the top-right × already covers home there. */}
                    {prevProject ? (
                        <Link
                            href={`/projects/${prevProject.slug}`}
                            onClick={slideDir("prev")}
                            aria-label={`Previous project: ${prevProject.name}`}
                            title={`Previous project: ${prevProject.name}`}
                            className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--accent-soft) text-base text-accent transition-colors hover:bg-(--accent-softer) lg:hidden"
                        >
                            ←
                        </Link>
                    ) : (
                        <Link
                            href="/"
                            aria-label="Back"
                            onClick={leaveHome}
                            className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base text-gray-600 transition-colors hover:text-accent lg:hidden dark:bg-gray-800 dark:text-gray-300"
                        >
                            ←
                        </Link>
                    )}

                    {/* Clip window (mobile) → dissolves to plain rail items (desktop). */}
                    <div className="relative h-full flex-1 overflow-hidden lg:contents">
                        <div
                            style={{ transform: `translateX(${navOffset}px)` }}
                            className={`absolute left-0 top-0 flex h-full items-center gap-2 will-change-transform lg:contents ${
                                navReady ? "motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out" : ""
                            }`}
                        >
                            {items.map((item, idx) => {
                                const isActive = active === item.id;
                                return (
                                    <a
                                        key={item.id}
                                        ref={(el) => {
                                            itemRefs.current[idx] = el;
                                        }}
                                        href={`#${item.id}`}
                                        aria-current={isActive ? "true" : undefined}
                                        title={item.label}
                                        className={`max-w-36 shrink-0 truncate rounded-full px-3 py-1.5 text-xs transition-colors lg:max-w-full ${
                                            isActive
                                                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                                                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        {item.label}
                                    </a>
                                );
                            })}

                            {/* End-of-nav hand-off to the next project. A real route
                                Link (not a section anchor), so it's click-only and never
                                a scroll target — scrolling stays inside this project. */}
                            {nextProject ? (
                                <>
                                    <span
                                        aria-hidden="true"
                                        className="mx-1 h-5 w-px shrink-0 self-center bg-gray-200 dark:bg-gray-800 lg:mx-0 lg:my-1 lg:h-px lg:w-full"
                                    />
                                    <Link
                                        href={`/projects/${nextProject.slug}`}
                                        onClick={slideDir("next")}
                                        title={`Next project: ${nextProject.name}`}
                                        className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-(--accent-soft) lg:w-full"
                                    >
                                        <span className="max-w-32 truncate lg:max-w-full">{nextProject.name}</span>
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                </>
                            ) : null}
                        </div>
                    </div>
                </nav>

                {/* Vertical snap scroller */}
                <div ref={scrollerRef} className="h-dvh snap-y snap-mandatory overflow-y-scroll scroll-smooth">
                    {/* Hero — fullscreen framed image; the image is the morph target and
                        the copy fades in after. */}
                    <section id="hero" className={`relative h-dvh snap-start ${SECTION_FRAME}`}>
                        <div className="relative h-full w-full">
                            <ViewTransition name={`project-${project.slug}`} share="morph">
                                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                    <Image
                                        src={project.image}
                                        alt={project.alt}
                                        fill
                                        priority
                                        sizes="100vw"
                                        className="object-cover"
                                        style={{ objectPosition: project.focal ?? "center" }}
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                                </div>
                            </ViewTransition>

                            {/* Hero copy. `vt-hero-copy` applies view-transition-name:
                                hero-copy at lg and up (see globals.css), making it its own
                                group so it fades + rises in / fades out. Unnamed on mobile,
                                where the split-out group doesn't survive the trip. */}
                            <div className="vt-hero-copy absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-5xl px-6 pb-16 sm:px-8">
                                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">{project.name}</h1>
                                <p className="mt-3 max-w-2xl text-lg text-gray-200">{project.blurb}</p>
                                {project.links?.length ? (
                                    <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                                        {project.links.map((l: ProjectLink) => (
                                            <span key={l.href} className="inline-flex items-baseline gap-1.5">
                                                <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-300 hover:text-blue-200 hover:underline">
                                                    {l.label} ↗
                                                </a>
                                                {/* Only surfaces below lg, where the tool doesn't work. */}
                                                {l.desktopOnly ? (
                                                    <span
                                                        title="This interactive tool is built for desktop and may not work on mobile."
                                                        className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-300 lg:hidden"
                                                    >
                                                        desktop only
                                                    </span>
                                                ) : null}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </section>

                    {project.sections.map((s, i) => (
                        <SectionBlock key={s.id} section={s} index={i} />
                    ))}
                </div>
            </div>
        </ViewTransition>
    );
}