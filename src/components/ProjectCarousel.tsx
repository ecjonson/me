import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { projects } from "@/lib/projects";

export function ProjectCarousel() {
    return (
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
            {projects.map(({ slug, name, blurb, image, alt }) => (
                <li key={slug} className="shrink-0 snap-start">
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
                                    sizes="160px"
                                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-110"
                                />
                            </span>
                        </ViewTransition>
                        <span className="w-40 text-center text-xs text-gray-600 dark:text-gray-400">{name}</span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}