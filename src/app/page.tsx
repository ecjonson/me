"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaEnvelope, FaLinkedinIn, FaGithub, FaFileLines, FaRotateLeft, FaChessKnight } from "react-icons/fa6";
import { ThemeToggle } from "@/components/ThemeToggle";
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
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
        <main className="mx-auto max-w-2xl px-6 sm:px-8 lg:max-w-5xl">
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
                                    className="text-blue-600 hover:underline dark:text-blue-400"
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
            {/* The rest of the page, revealed as the hero pans out */}
            <div
                className={`pb-24 ${
                    started ? "transition-opacity delay-300 duration-700 ease-out" : ""
                } ${revealed ? "opacity-100" : "opacity-0"}`}
            >
                <section className="mb-16">
                    <ProjectCarousel />
                </section>
            </div>
            <nav
                aria-label="Controls and contact"
                className={`fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-5 p-4 text-2xl text-gray-600 transition-opacity duration-700 dark:text-gray-400 lg:inset-x-auto lg:bottom-auto lg:right-0 lg:top-0 lg:justify-end lg:p-6 ${
                    revealed ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            >
                <ThemeToggle />
                <button
                    type="button"
                    onClick={replayGreeting}
                    aria-label="Replay intro"
                    title="Replay intro"
                    className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                    <FaRotateLeft />
                </button>
                <span aria-hidden="true" className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
                <a aria-label="Email" href="mailto:evancjonson@gmail.com" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"><FaEnvelope /></a>
                <a aria-label="LinkedIn" href="https://www.linkedin.com/in/evan-jonson/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"><FaLinkedinIn /></a>
                <a aria-label="GitHub" href="https://github.com/ecjonson" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"><FaGithub /></a>
                <a aria-label="Chess" href="https://www.chess.com/member/ibahn" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"><FaChessKnight /></a>
                <Link aria-label="Resume" href="/resume" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"><FaFileLines /></Link>
            </nav>
        </main>
    );
}