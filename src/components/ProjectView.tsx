"use client";

import Image from "next/image";
import Link from "next/link";
import { ViewTransition, useEffect, useRef, useState } from "react";
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
    const labelCls = `mb-2 text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400 ${isXL ? "lg:text-blue-300 lg:dark:text-blue-300" : ""}`;
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

    return (
        <div className="relative">
            {/* Desktop back button — top-left, as a bubble matching the nav. */}
            <Link
                href="/"
                aria-label="Back"
                className="fixed left-4 top-4 z-50 hidden h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-base text-gray-600 transition-colors hover:text-blue-600 lg:flex dark:bg-gray-800 dark:text-gray-300 dark:hover:text-blue-400"
            >
                ←
            </Link>

            {/* Section outline.
                Mobile: bottom bar with a back bubble pinned left + a left-aligned
                        label strip (active tab sits next to the back button).
                Desktop (lg): left rail, same bubble aesthetic. Slides in last. */}
            <ViewTransition enter="section-nav-in" default="none">
                <nav
                    ref={navRef}
                    aria-label="Sections"
                    className="fixed inset-x-0 bottom-0 z-40 flex h-14 touch-none items-center gap-1 overscroll-contain border-t border-gray-200/70 bg-white/80 px-2 backdrop-blur-sm lg:inset-x-auto lg:left-0 lg:top-0 lg:h-dvh lg:w-40 lg:flex-col lg:items-start lg:justify-center lg:gap-2 lg:border-t-0 lg:border-r lg:px-4 dark:border-gray-800/70 dark:bg-gray-950/60"
                >
                    {/* Mobile back button (bubble). Hidden on desktop — the top-left one shows there. */}
                    <Link
                        href="/"
                        aria-label="Back"
                        className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base text-gray-600 transition-colors hover:text-blue-600 lg:hidden dark:bg-gray-800 dark:text-gray-300 dark:hover:text-blue-400"
                    >
                        ←
                    </Link>

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
                        </div>
                    </div>
                </nav>
            </ViewTransition>

            {/* Vertical snap scroller */}
            <div ref={scrollerRef} className="h-dvh snap-y snap-mandatory overflow-y-scroll scroll-smooth">
                {/* Hero — fullscreen framed image; the image is the morph target and
                    the copy fades in after (unchanged). */}
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

                        <ViewTransition enter="hero-copy-in" default="none">
                            <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-5xl px-6 pb-16 sm:px-8">
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
                        </ViewTransition>
                    </div>
                </section>

                {project.sections.map((s, i) => (
                    <SectionBlock key={s.id} section={s} index={i} />
                ))}
            </div>
        </div>
    );
}