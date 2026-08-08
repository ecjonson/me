"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { FaEnvelope, FaLinkedinIn, FaGithub, FaFileLines, FaChessKnight, FaEnvelopeCircleCheck, FaPaperPlane } from "react-icons/fa6";
import { isReducedMotion, markViewTransition } from "@/lib/motion";
import { SettingsMenu } from "@/components/SettingsMenu";
import { ProjectCarousel } from "@/components/ProjectCarousel";
import styles from "./page.module.css";

const CURRENT_PROJECT = {
    name: "a near-zero latency display system",
    href: "/projects/low-latency-display",
    company: "NCSU"
};

const GREETING = "Hi, I'm Evan.";
const TAGLINE = "Computer scientist and engineer.";
const YEAR = new Date().getFullYear();
const TRACKER = `It's ${YEAR}! I'm at ${CURRENT_PROJECT.company} building ${CURRENT_PROJECT.name}.`
const FULL = `${GREETING}\n${TAGLINE}\n${TRACKER}`;

// Typing rhythm (ms)
const START_DELAY = 300;
const CHAR_DELAY = 25;
const CHAR_RANDOMNESS = 35;
const WORD_DELAY = 100;
const SEMANTIC_DELAY = 500;
const CURSOR_DELAY = 5000;
const REVEAL_DELAY = 1000;

function Cursor() {
    return <span aria-hidden="true" className={styles.cursor} />;
}

const linkCls = "inline-flex items-center gap-2 transition-colors hover:text-[var(--accent)]";
const EMAIL = "evancjonson@gmail.com";

// Email is a two-step link: copy to clipboard, then mailto
function EmailLink({ showLabel = false }: { showLabel?: boolean }) {
    const [primed, setPrimed] = useState(false);
    const [copied, setCopied] = useState(false);

    // Hide the bubble ~1.8s after it appears.
    useEffect(() => {
        if (!copied) return;
        const t = setTimeout(() => setCopied(false), 1200);
        return () => clearTimeout(t);
    }, [copied]);

    // Revert mail-app mode back to copy after a few idle seconds.
    useEffect(() => {
        if (!primed) return;
        const t = setTimeout(() => setPrimed(false), 6000);
        return () => clearTimeout(t);
    }, [primed]);

    const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
        if (primed) return; // second click within the window → let the mailto open
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

// Shared contact/profile links — icon-only in the mobile bottom bar, icon + label
// in the desktop in-flow section (showLabels). Kept in one place so both stay in sync.
function ContactLinks({ showLabels = false }: { showLabels?: boolean }) {
    return (
        <>
            <a aria-label="LinkedIn" href="https://www.linkedin.com/in/evan-jonson/" target="_blank" rel="noopener noreferrer" className={linkCls}>
                <FaLinkedinIn />
                {showLabels && <span>LinkedIn</span>}
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

export default function Home() {
    // const alreadyGreeted = typeof window !== "undefined" && !!sessionStorage.getItem("greeted");
    const [typed, setTyped] = useState(0);
    const [started, setStarted] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [cursorGone, setCursorGone] = useState(false);
    const [ready, setReady] = useState(false);
    const [replay, setReplay] = useState(0);

    useEffect(() => {
        const greeted = !!sessionStorage.getItem("greeted");
        const reduce = isReducedMotion();

        // skip greeting?
        if (greeted || reduce) {
            const skip = setTimeout(() => {
                setTyped(FULL.length);
                setRevealed(true);
                setCursorGone(true);
                setReady(true);
            }, 0);
            return () => clearTimeout(skip);
        }

        let timer: ReturnType<typeof setTimeout>;

        const tick = (i: number) => {
            if (i >= FULL.length) {
                timer = setTimeout(() => setCursorGone(true), CURSOR_DELAY);
                return;
            }
            setTyped(i + 1);

            // Greeting, pause, then pan the page in and resume typing.
            if (i + 1 === GREETING.length) {
                timer = setTimeout(() => {
                    setRevealed(true);
                    sessionStorage.setItem("greeted", "1");
                    tick(i + 1);
                }, REVEAL_DELAY);
                return;
            }

            timer = setTimeout(() => tick(i + 1), delayAfter(FULL[i]));
        };

        timer = setTimeout(() => {
            setReady(true);
            setStarted(true);
            tick(0);
        }, START_DELAY);

        return () => clearTimeout(timer);
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

    const replayGreeting = () => {
        sessionStorage.removeItem("greeted");
        setTyped(0);
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
    
    // Render line3 with the project name as a live link once its text appears
    const beforeCompany = TRACKER.slice(0, TRACKER.indexOf(CURRENT_PROJECT.company));
    const beforeLink = TRACKER.slice(0, TRACKER.indexOf(CURRENT_PROJECT.name));
    const typedIntoLink  = line3.length > beforeLink.length;
    const linkTextTyped  = typedIntoLink
        ? line3.slice(beforeLink.length, beforeLink.length + CURRENT_PROJECT.name.length)
        : "";
    const afterLinkTyped = line3.length > beforeLink.length + CURRENT_PROJECT.name.length
        ? line3.slice(beforeLink.length + CURRENT_PROJECT.name.length)
        : "";

    return (
        <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-6 sm:px-8 lg:max-w-5xl">
            {/* Greeting hero — stays on the page, then pans out to reveal the rest */}
            <section className="flex flex-col pt-16 pb-12 sm:pt-20 min-h-[40vh]">
                <div
                    className={`origin-top-left ${
                        started ? "transition-transform duration-900 ease-out" : ""
                    } ${revealed ? "scale-100" : "scale-130"} ${ready ? "" : "invisible"}`}
                >
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                        {line1}
                        {!onTagline && !cursorGone && <Cursor />}
                    </h1>
                    {onTagline && (
                        <p className="mt-4 text-2xl font-medium text-gray-600 sm:text-3xl dark:text-gray-400">
                            {line2}
                            {!onTracker && !cursorGone && <Cursor />}
                        </p>
                    )}
                    {onTracker && (
                        <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                            <span className="text-gray-600 dark:text-gray-400">
                                {line3.slice(0, beforeCompany.length)}
                            </span>
                            {line3.slice(beforeCompany.length, beforeCompany.length + CURRENT_PROJECT.company.length)}
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
                            {!cursorGone && <Cursor />}
                        </h2>
                    )}
                </div>
            </section>
            {/* The rest of the page, revealed as the hero pans out. On mobile it floats
                to the bottom (mt-auto) for breathing room under the greeting; on desktop
                it sits right below the hero, with the links in-flow beneath the projects. */}
            <div
                className={`mt-auto pb-28 lg:mt-0 lg:pb-20 ${
                    started ? "transition-opacity delay-300 duration-700 ease-out" : ""
                } ${revealed ? "opacity-100" : "opacity-0"}`}
            >
                <section>
                    <ProjectCarousel intro={started && revealed} />
                </section>

                {/* Links — desktop only, in-flow below the projects with a bit of context.
                    Mobile shows the fixed bottom bar version instead. */}
                <section className="mt-16 hidden lg:block">
                    <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Get in touch
                    </h2>
                    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-lg text-gray-600 dark:text-gray-400">
                        <ContactLinks showLabels />
                    </div>
                </section>
            </div>

            {/* Utilities — theme + replay. Top-right on every viewport. */}
            <div
                className={`fixed right-0 top-0 z-40 flex items-center p-4 text-2xl text-gray-600 [&_button]:cursor-pointer dark:text-gray-400 lg:p-6 ${
                    started ? "transition-opacity duration-700" : ""
                } ${revealed ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
                <SettingsMenu onReplay={replayGreeting} />
            </div>
            
            {/* Contact links — mobile bottom bar. Frosted + top border to match the
                project nav, with a "Get in touch" label and a hairline divider before
                the icons. Desktop uses the in-flow section above (no separator there). */}
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