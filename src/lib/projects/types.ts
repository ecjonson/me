export type ProjectLink = {
    label: string;
    href: string;
    desktopOnly?: boolean; // shows a subtle "desktop only" hint on mobile
};

export type ProjectSection = {
    id: string;
    label: string;
    heading: string;
    body: string;
    image?: string; // optional — triggers the split layout when present
    alt?: string;
    focal?: string;   // e.g. "center", "top", "50% 30%"
    size?: "XS" | "SM" | "MD" | "LG" | "XL";
};

export type Project = {
    slug: string;
    name: string;
    year: number; // used to order the timeline and draw the year separators
    blurb: string;
    image: string;
    alt: string;
    focal?: string; // object-position for the hero, e.g. "center top" or "50% 20%"
    links?: ProjectLink[];
    sections: ProjectSection[];
};