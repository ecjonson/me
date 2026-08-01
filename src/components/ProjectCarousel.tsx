import Image from "next/image";
import Link from "next/link";
import { Fragment, ViewTransition } from "react";
import { projects } from "@/lib/projects";

// Timeline tick shown before the first project of each year. Decorative lines
// flank the year label so the row reads as a dated axis rather than a plain row.
function YearMarker({ year }: { year: number }) {
    return (
        <li className="flex shrink-0 snap-start flex-col items-center gap-2">
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

export function ProjectCarousel() {
    // `projects` is already sorted newest-first in lib/projects, so a year marker
    // goes before the first project and wherever the year changes down the row.
    return (
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
            {projects.map(({ slug, name, year, blurb, image, alt }, i) => {
                // Trailing marker: sits to the RIGHT of each year's oldest project.
                // const endYear = i === projects.length - 1 || year !== projects[i + 1].year;
                const newYear = i === 0 || year !== projects[i - 1].year;
                return (
                    <Fragment key={slug}>
                        {newYear && <YearMarker year={year} />}
                        <li className="shrink-0 snap-start">
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
                                            priority={i === 0}
                                            sizes="160px"
                                            className="object-cover transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-110"
                                        />
                                    </span>
                                </ViewTransition>
                                <span className="w-40 text-center text-xs text-gray-600 dark:text-gray-400">{name}</span>
                            </Link>
                        </li>
                        {/* {endYear && <YearMarker year={year} />} */}
                    </Fragment>
                );
            })}
        </ul>
    );
}