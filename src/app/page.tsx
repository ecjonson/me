"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { FaEnvelope, FaLinkedinIn, FaGithub, FaFileLines, FaChessKnight, FaEnvelopeCircleCheck, FaPaperPlane, FaOrcid } from "react-icons/fa6";
import { isReducedMotion, markViewTransition } from "@/lib/motion";
import { SettingsMenu } from "@/components/SettingsMenu";
import { ProjectCarousel } from "@/components/ProjectCarousel";
import styles from "./page.module.css";

const CURRENT_PROJECT = {
    name: "a near-zero latency display system",
    href: "/projects/low-latency-display",
    company: "NCSU",
    companyHref: "https://vxlab.csc.ncsu.edu/", // optional — drop this line to leave it plain text
};

// headshot
const COIN_INTRO = "h-32 w-32 sm:h-40 sm:w-40";
const COIN_BAR = "h-9 w-9"; // resting size in the top bar
const COIN_BAR_RADIUS = "rounded-[18px]"; // half of the 36px above — a circle, in px so it can interpolate
const COIN_BAR_OPEN = "h-40 w-40 sm:h-48 sm:w-48"; // enlarged on click
const COIN_BAR_OPEN_RADIUS = "rounded-3xl"; // 24px against a 160px box — a rounded rectangle
const COIN_GAP = 24; // px between headshot and greeting — keep in step with `mb-6` below

// greeting
const GREETING = "Hi, I'm Evan.";
const TAGLINE = "Computer scientist and engineer.";
const YEAR = new Date().getFullYear();
const TRACKER = `It's ${YEAR}! I'm at ${CURRENT_PROJECT.company} building ${CURRENT_PROJECT.name}.`
const FULL = `${GREETING}\n${TAGLINE}\n${TRACKER}`;
const INTRO_SCALE = 1.2; // how much bigger the greeting sits while it's centred
const HEADSHOT_SRC = "/me_2026.jpeg";

// opening beats (ms): headshot, then caret, then typing
const START_DELAY = 300;
const POP_IN = 560; // must match .headshot-pop duration in globals.css

// typing rhythm (ms)
const CHAR_DELAY = 25;
const CHAR_RANDOMNESS = 35;
const WORD_DELAY = 100;
const SEMANTIC_DELAY = 500;
const CURSOR_DELAY = 5000;
const REVEAL_DELAY = 500; // caret holds at the end of the greeting before the page arrives

// links
const linkCls = "inline-flex items-center gap-2 transition-colors hover:text-[var(--accent)]";
const EMAIL = "evancjonson@gmail.com";

// `shown` hides the caret without removing it, so it still holds its width
function Cursor({ shown = true }: { shown?: boolean }) {
    return <span aria-hidden="true" className={`${styles.cursor} ${shown ? "" : "invisible"}`} />;
}

// the not-yet-typed remainder of a line, holding its space so the hero's size
// never changes as the text arrives. empty — and free — once the line is done.
function Untyped({ full, typed }: { full: string; typed: string }) {
    return <span aria-hidden="true" className="invisible whitespace-pre-wrap">{full.slice(typed.length)}</span>;
}

// circular headshot
function Headshot({
    sizeCls, expandedCls = "", introCls = "", interactive = false,
}: { sizeCls: string; expandedCls?: string; introCls?: string; interactive?: boolean }) {
    const [big, setBig] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!big) return;
        const onDown = (e: PointerEvent) => {
            if (btnRef.current?.contains(e.target as Node)) return; // the button toggles itself
            setBig(false);
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setBig(false); };
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener("keydown", onKey);
        };
    }, [big]);

    // width/height rather than a scale: keeps the 1px ring hairline at every size
    const photo = (boxCls: string) => (
        <div className={`overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800 ${boxCls} ${introCls}`}>
            <Image
                src={HEADSHOT_SRC}
                alt="Evan Jonson"
                width={384}
                height={384}
                priority
                className="h-full w-full object-cover"
            />
        </div>
    );

    if (!interactive) return <div aria-hidden="true">{photo(`${sizeCls} shrink-0 rounded-full`)}</div>;

    return (
        // the slot keeps its resting size so growing the photo never reflows the bar
        <div className={`relative ${sizeCls}`}>
            <button
                ref={btnRef}
                data-coin
                type="button"
                onClick={() => setBig((v) => !v)}
                aria-expanded={big}
                aria-label={big ? "Shrink photo of Evan Jonson" : "Enlarge photo of Evan Jonson"}
                title={big ? "Shrink" : "Enlarge"}
                className={`absolute left-0 top-0 cursor-pointer transition-all duration-300 ease-out ${
                    big ? `${expandedCls} ${COIN_BAR_OPEN_RADIUS} z-50 shadow-xl` : `${sizeCls} ${COIN_BAR_RADIUS}`
                }`}
            >
                {photo(`h-full w-full transition-all duration-300 ease-out ${big ? COIN_BAR_OPEN_RADIUS : COIN_BAR_RADIUS}`)}
            </button>
        </div>
    );
}

// email is a three-step link: copy to clipboard, then mailto, and reset
function EmailLink({ showLabel = false }: { showLabel?: boolean }) {
    const [primed, setPrimed] = useState(false);
    const [copied, setCopied] = useState(false);

    // hide the bubble ~1.8s after it appears.
    useEffect(() => {
        if (!copied) return;
        const t = setTimeout(() => setCopied(false), 1200);
        return () => clearTimeout(t);
    }, [copied]);

    // revert mail-app mode back to copy after a few idle seconds.
    useEffect(() => {
        if (!primed) return;
        const t = setTimeout(() => setPrimed(false), 6000);
        return () => clearTimeout(t);
    }, [primed]);

    const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
        if (primed) return; // second click within the window, let the mailto open
        e.preventDefault();
        const clipboard = navigator.clipboard;
        if (clipboard?.writeText) {
            clipboard.writeText(EMAIL).then(
                () => { setPrimed(true); setCopied(true); },
                () => { window.location.href = `mailto:${EMAIL}`; }
            );
        } else {
            window.location.href = `mailto:${EMAIL}`;
        }
    };

    const hint = copied
        ? "Email copied — click again to open your mail app"
        : primed
            ? "Open your mail app"
            : "Copy email address";

    return (
        <span className="relative inline-flex">
            {copied && (
                <span role="status" className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-md ring-1 ring-(--accent)/40 motion-safe:animate-[bubble-pop_180ms_ease-out] dark:bg-gray-800">
                    Copied!
                    <span aria-hidden="true" className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
                </span>
            )}
            <a aria-label={hint} title={hint} href={`mailto:${EMAIL}`} onClick={onClick} className={linkCls}>
                {copied ? <FaEnvelopeCircleCheck /> : primed ? <FaPaperPlane /> : <FaEnvelope />}
                {showLabel && <span>{copied ? "Copied!" : primed ? "MailTo" : "Email"}</span>}
            </a>
        </span>
    );
}

// shared contact/profile links
function ContactLinks({ showLabels = false }: { showLabels?: boolean }) {
    return (
        <>
            <a aria-label="LinkedIn" href="https://www.linkedin.com/in/evan-jonson/" target="_blank" rel="noopener noreferrer" className={linkCls}>
                <FaLinkedinIn />
                {showLabels && <span>LinkedIn</span>}
            </a>
            <a aria-label="ORCID" href="https://orcid.org/0009-0009-3029-3880" target="_blank" rel="noopener noreferrer" className={linkCls}>
                <FaOrcid />
                {showLabels && <span>ORCID</span>}
            </a>
            <a aria-label="GitHub" href="https://github.com/ecjonson" target="_blank" rel="noopener noreferrer" className={linkCls}>
                <FaGithub />
                {showLabels && <span>GitHub</span>}
            </a>
            <a aria-label="Chess" href="https://www.chess.com/member/ibahn" target="_blank" rel="noopener noreferrer" className={linkCls}>
                <FaChessKnight />
                {showLabels && <span>Chess</span>}
            </a>
            <Link aria-label="Resume" href="/resume" target="_blank" rel="noopener noreferrer" className={linkCls}>
                <FaFileLines />
                {showLabels && <span>Resume</span>}
            </Link>
            <EmailLink showLabel={showLabels} />
        </>
    );
}

function delayAfter(char: string) {
    if (char === "," || char === "." || char === "!") return SEMANTIC_DELAY;
    if (char === " ") return WORD_DELAY;
    return CHAR_DELAY + Math.random() * CHAR_RANDOMNESS; // human touch
}

// has the greeting already played this session, or is motion turned down?
function shouldSkipGreeting() {
    if (typeof window === "undefined") return false;
    let greeted = false;
    try { greeted = !!sessionStorage.getItem("greeted"); } catch {}
    return greeted || isReducedMotion();
}

export default function Home() {
    const [typed, setTyped] = useState(0);
    const [caretOn, setCaretOn] = useState(false);
    const [started, setStarted] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [cursorGone, setCursorGone] = useState(false);
    const [ready, setReady] = useState(false);
    const [replay, setReplay] = useState(0);
    const cancelled = useRef(false);
    // held in a ref so the skip handler can cancel the pending intro chain
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // greeting stage: the offset that carries the hero block to the middle of the screen
    const heroRef = useRef<HTMLDivElement>(null);   // the element the transform is on
    const greetRef = useRef<HTMLDivElement>(null);  // the greeting line, which is what gets centred
    const coinRef = useRef<HTMLDivElement>(null);
    const [intro, setIntro] = useState<{ x: number; y: number } | null>(null);

    // measured with the transform stripped, so the resting position is the reference
    const measureIntro = useCallback(() => {
        const el = heroRef.current;
        const box = greetRef.current;
        if (!el || !box) return;
        const prev = el.style.transform;
        el.style.transform = "none";
        // the greeting line only
        const r = box.getBoundingClientRect();
        el.style.transform = prev;

        // visualViewport excludes mobile browser chrome; innerHeight does not
        const vw = window.visualViewport?.width ?? window.innerWidth;
        const vh = window.visualViewport?.height ?? window.innerHeight;

        // the photo sits above the text, so the pair's centre is higher than the text's
        const lift = ((coinRef.current?.offsetHeight ?? 0) + COIN_GAP) * INTRO_SCALE;

        setIntro({
            x: vw / 2 - r.left - (r.width * INTRO_SCALE) / 2,
            y: vh / 2 - r.top - (r.height * INTRO_SCALE) / 2 + lift / 2,
        });
    }, []);

    useLayoutEffect(() => {
        if (revealed || shouldSkipGreeting()) return;
        measureIntro();
        window.addEventListener("resize", measureIntro);
        return () => window.removeEventListener("resize", measureIntro);
    }, [measureIntro, revealed, replay]);

    useEffect(() => {
        cancelled.current = false;

        // already greeted this session, or motion is turned down
        if (shouldSkipGreeting()) {
            timerRef.current = setTimeout(() => {
                cancelled.current = true;
                setTyped(FULL.length);
                setCaretOn(true);
                setRevealed(true);
                setCursorGone(true);
                setReady(true);
            }, 0);
            return () => clearTimeout(timerRef.current);
        }

        const tick = (i: number) => {
            if (cancelled.current) return;
            if (i >= FULL.length) {
                timerRef.current = setTimeout(() => setCursorGone(true), CURSOR_DELAY);
                return;
            }

            // hold on the line that just ended, then break and carry on
            if (FULL[i] === "\n") {
                const endsGreeting = i + 1 === GREETING.length + 1;
                timerRef.current = setTimeout(() => {
                    if (cancelled.current) return;
                    setTyped(i + 1);
                    if (endsGreeting) {
                        setRevealed(true);
                        sessionStorage.setItem("greeted", "1");
                    }
                    tick(i + 1);
                }, endsGreeting ? REVEAL_DELAY : SEMANTIC_DELAY);
                return;
            }

            setTyped(i + 1);
            timerRef.current = setTimeout(() => tick(i + 1), delayAfter(FULL[i]));
        };

        // headshot, then caret, then typing
        timerRef.current = setTimeout(() => {
            if (cancelled.current) return;
            setReady(true);
            timerRef.current = setTimeout(() => {
                if (cancelled.current) return;
                setCaretOn(true);
                setStarted(true);
                tick(0);
            }, POP_IN);
        }, START_DELAY);

        return () => clearTimeout(timerRef.current);
    }, [replay]);

    // disable scroll during greeting
    useEffect(() => {
        if (!revealed) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }
        return () => document.body.classList.remove("overflow-hidden");
    }, [revealed]);

    // Skip on input
    useEffect(() => {
        if (cursorGone) return; // already finished — nothing to skip
        const skip = () => {
            cancelled.current = true;
            clearTimeout(timerRef.current); // stop the intro chain mid-flight
            setTyped(FULL.length);
            setCaretOn(true);
            setStarted(false); // a skip lands instantly: no transitions, no roll-in
            setRevealed(true);
            setCursorGone(true);
            setReady(true);
            try { sessionStorage.setItem("greeted", "1"); } catch {}
        };
        window.addEventListener("pointerdown", skip);
        window.addEventListener("keydown", skip);
        return () => {
            window.removeEventListener("pointerdown", skip);
            window.removeEventListener("keydown", skip);
        };
    }, [cursorGone, replay]);

    const replayGreeting = () => {
        sessionStorage.removeItem("greeted");
        clearTimeout(timerRef.current);
        setTyped(0);
        setCaretOn(false);
        setStarted(false);
        setRevealed(false);
        setCursorGone(false);
        setReady(false);
        setReplay((r) => r + 1); // re-runs the typing effect from scratch
    };

    const shown = FULL.slice(0, typed);
    const lines = shown.split("\n");
    const line1 = lines[0] ?? "";
    const line2 = lines[1] ?? "";
    const line3 = lines[2] ?? "";
    const onTagline = lines.length >= 2;
    const onTracker = lines.length >= 3;

    // render line3 with the company and project name as live links as their text appears
    const beforeCompany = TRACKER.slice(0, TRACKER.indexOf(CURRENT_PROJECT.company));
    const beforeLink = TRACKER.slice(0, TRACKER.indexOf(CURRENT_PROJECT.name));
    const companyTyped = line3.slice(beforeCompany.length, beforeCompany.length + CURRENT_PROJECT.company.length);
    const typedIntoLink  = line3.length > beforeLink.length;
    const linkTextTyped  = typedIntoLink
        ? line3.slice(beforeLink.length, beforeLink.length + CURRENT_PROJECT.name.length)
        : "";
    const afterLinkTyped = line3.length > beforeLink.length + CURRENT_PROJECT.name.length
        ? line3.slice(beforeLink.length + CURRENT_PROJECT.name.length)
        : "";

    return (
        <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-6 sm:px-8 lg:max-w-5xl">
            {/* greeting hero */}
            <section className="flex flex-col pt-24 pb-12 sm:pt-28 min-h-[40vh]">
                <div
                    ref={heroRef}
                    style={{
                        transform: !revealed && intro
                            ? `translate3d(${intro.x}px, ${intro.y}px, 0) scale(${INTRO_SCALE})`
                            : "translate3d(0, 0, 0) scale(1)",
                    }}
                    className={`w-fit max-w-full origin-top-left ${
                        started ? "transition-transform duration-900 ease-out" : ""
                    } ${ready ? "" : "invisible"}`}
                >
                    {/* greeting box */}
                    <div ref={greetRef} className="relative w-fit max-w-full">
                        {/* out of flow, so its exit never reflows the greeting */}
                        <div
                            ref={coinRef}
                            className={`absolute bottom-full left-1/2 mb-6 -translate-x-1/2 ${
                                started ? "transition-all duration-700 ease-out" : ""
                            } ${revealed ? "scale-75 opacity-0" : "scale-100 opacity-100"}`}
                        >
                            <Headshot sizeCls={COIN_INTRO} introCls={ready ? "headshot-pop" : ""} />
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                            {line1}
                            {!onTagline && !cursorGone && <Cursor shown={caretOn} />}
                            <Untyped full={GREETING} typed={line1} />
                        </h1>
                    </div>

                    <p className="mt-4 text-2xl font-medium text-gray-600 sm:text-3xl dark:text-gray-400">
                        {line2}
                        {onTagline && !onTracker && !cursorGone && <Cursor />}
                        <Untyped full={TAGLINE} typed={line2} />
                    </p>

                    <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                        <span className="text-gray-600 dark:text-gray-400">
                            {line3.slice(0, beforeCompany.length)}
                        </span>
                        {CURRENT_PROJECT.companyHref && companyTyped ? (
                            <a
                                href={CURRENT_PROJECT.companyHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline"
                            >
                                {companyTyped}
                            </a>
                        ) : (
                            companyTyped
                        )}
                        <span className="text-gray-600 dark:text-gray-400">
                            {line3.slice(beforeCompany.length + CURRENT_PROJECT.company.length, beforeLink.length)}
                        </span>
                        {typedIntoLink && (
                            <Link
                                href={CURRENT_PROJECT.href}
                                onClick={() => markViewTransition("enter")}
                                className="text-accent hover:underline"
                            >
                                {linkTextTyped}
                            </Link>
                        )}
                        <span className="text-gray-600 dark:text-gray-400">
                            {afterLinkTyped}
                        </span>
                        {onTracker && !cursorGone && <Cursor />}
                        <Untyped full={TRACKER} typed={line3} />
                    </h2>
                </div>
            </section>

            {/* the rest of the page, revealed as the hero pans out. */}
            <div
                className={`mt-auto pb-28 lg:mt-0 lg:pb-20 ${
                    started ? "transition-opacity delay-300 duration-700 ease-out" : ""
                } ${revealed ? "opacity-100" : "opacity-0"}`}
            >
                <section>
                    <ProjectCarousel intro={started && revealed} />
                </section>

                {/* links — desktop only */}
                <section className="mt-16 hidden lg:block">
                    <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Get in touch
                    </h2>
                    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-lg text-gray-600 dark:text-gray-400">
                        <ContactLinks showLabels />
                    </div>
                </section>
            </div>

            {/* top bar */}
            <div
                className={`pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between p-4 text-2xl text-gray-600 [&_button]:cursor-pointer dark:text-gray-400 lg:p-6 ${
                    started ? "transition-opacity duration-700" : ""
                } ${revealed ? "opacity-100" : "opacity-0"}`}
            >
                <div className={revealed ? "pointer-events-auto" : ""}>
                    <Headshot sizeCls={COIN_BAR} expandedCls={COIN_BAR_OPEN} interactive />
                </div>
                <div className={revealed ? "pointer-events-auto" : ""}>
                    <SettingsMenu onReplay={replayGreeting} />
                </div>
            </div>

            {/* contact links */}
            <nav
                aria-label="Contact and links"
                className={`fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-3 border-t border-gray-200/70 bg-white/80 backdrop-blur-sm p-4 text-2xl text-gray-600 dark:border-gray-800/70 dark:bg-gray-950/60 dark:text-gray-400 lg:hidden ${
                    started ? "transition-opacity duration-700" : ""
                } ${revealed ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
                <span className="whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">Get in touch</span>
                <span aria-hidden="true" className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
                <div className="flex items-center gap-3">
                    <ContactLinks />
                </div>
            </nav>
        </main>
    );
}