import type { Project } from "./types";

export const lowLatencyDisplay: Project = {
    slug: "low-latency-display",
    name: "Low-latency display",
    year: 2026,
    blurb: "Near-zero latency display system — MSCS thesis research. Image from Emerging Technologies, SIGGRAPH 2026, LA.",
    image: "/projects/thesis/SIGGRAPH_ETech_2026.jpeg",
    alt: "SIGGRAPH Emerging Technologies 2026",
    focal: "center",
    links: [
        { label: "YouTube demo", href: "https://www.youtube.com/watch?v=zViqs_4evNY&list=LL" },
        { label: "ACM paper", href: "https://dl.acm.org/doi/10.1145/3799826.3812437" },
    ],
    sections: [
        {
            id: "overview",
            label: "Overview",
            heading: "Near-zero latency display",
            body: "Rendering and display systems were built for recorded media, where latency doesn't exist, and modern interactive systems still inherit those latency-free assumptions. We proposed an alternative: tightly integrating rendering and display to prioritize interactive latency.",
        },
        {
            id: "problem",
            label: "The problem",
            heading: "Latency you can feel",
            body: "Interactive latency is the total, perceived delay from a user's input to the moment photons actually change on the display.",
            image: "/projects/thesis/interactive_latency.gif",
            alt: "Interactive latency: a GIF showing the delay between a controller button press and the on-screen response.",
        },
        {
            id: "role",
            label: "My role",
            heading: "My role",
            body: "Thesis lead — design, implementation, evaluation. Image from SID Display Week's I-Zone (Innovation Zone) 2026, LA.",
            image: "/projects/thesis/SID_IZone_2026.jpg",
            alt: "SID Innovation Zone 2026",
            focal: "center top",
            size: "LG",
        },
        {
            id: "solution",
            label: "Solution",
            heading: "The approach",
            body: "Frames cause latency. Our system takes advantage of a property of image-order renderers (ray tracing), where pixels can be displayed the instant they're computed. Pixels are sampled and updated individually along a stochastic scan pattern, minimizing input latency.",
        },
        {
            id: "results",
            label: "Results",
            heading: "Results",
            body: "I used NVIDIA's LDAT (Latency and Display Analysis Tool) to compare our system against the standard approach. In a controlled experiment with render speed throttled to 60 Hz, we achieved click-to-photon latency under 2 ms across the entire panel on average.",
        },
        {
            id: "future",
            label: "Future",
            heading: "Looking forward",
            body: "This has been an incredible project to work on, and it's taken me to some exciting places. I'm eager to keep improving the system.",
            image: "/projects/thesis/SIGGRAPH_PRICE_2026.jpeg",
            alt: "SIGGRAPH PRICE Technical Workshop 2026",
        },
    ],
};
