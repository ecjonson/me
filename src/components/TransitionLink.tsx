"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

type Props = ComponentProps<typeof Link>;

/**
 * Drop-in replacement for next/link that runs the client-side navigation
 * inside document.startViewTransition(). Any element that has a matching
 * `view-transition-name` on both the source and destination page will morph
 * (position + size + crossfade) instead of hard-cutting — e.g. a carousel
 * thumbnail scaling up into the hero background image on the project page.
 *
 * Falls back to a normal <Link> when the browser lacks the API, when the user
 * prefers reduced motion, or on modified / middle / new-tab clicks.
 */
export function TransitionLink({ href, onClick, ...rest }: Props) {
    const router = useRouter();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);

        // Let the browser handle new-tab / modified / non-primary clicks.
        if (
            e.defaultPrevented ||
            e.button !== 0 ||
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey
        ) {
            return;
        }

        const reduce =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // No View Transitions support (or reduced motion) → plain <Link> nav.
        if (typeof document === "undefined" || !document.startViewTransition || reduce) {
            return;
        }

        e.preventDefault();
        document.startViewTransition(() => {
            router.push(href.toString());
        });
    };

    return <Link href={href} onClick={handleClick} {...rest} />;
}