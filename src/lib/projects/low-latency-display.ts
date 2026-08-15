import type { Project } from "./types";

export const lowLatencyDisplay: Project = {
    slug: "low-latency-display",
    name: "Low-latency display",
    year: 2026,
    blurb: "Near-zero latency display system. MSCS thesis research. Image from Emerging Technologies (E-Tech) SIGGRAPH 2026, LA.",
    image: "/projects/thesis/SIGGRAPH_ETech_2026.jpeg",
    alt: "SIGGRAPH Emerging Technologies 2026",
    focal: "center",
    // context and media first, then the three publications in descending weight
    links: [
        {
            label: "VX Lab",
            href: "https://vxlab.csc.ncsu.edu/",
            title: "Visual Experience Lab, NC State University",
        },
        {
            label: "YouTube demo",
            href: "https://www.youtube.com/watch?v=zViqs_4evNY",
            title: "Walkthrough with Nicolas Charbonnier (Charbax) at SID Display Week 2026",
        },
        {
            label: "I3D 2026",
            href: "https://dl.acm.org/doi/10.1145/3807895.3807936",
            title: "Technical paper — ACM SIGGRAPH Symposium on Interactive 3D Graphics and Games",
        },
        {
            label: "SIGGRAPH E-Tech 2026",
            href: "https://dl.acm.org/doi/10.1145/3799826.3812437",
            title: "Exhibit demo — ACM SIGGRAPH 2026 Emerging Technologies",
        },
        {
            label: "SIGGRAPH PRICE 2026",
            href: "https://dl.acm.org/doi/10.1145/3799828.3816007",
            title: "Symposium paper — ACM SIGGRAPH 2026 Workshop on Performance and Rendering in Competitive Esports",
        },
    ],
    sections: [
        {
            id: "overview",
            label: "Overview",
            heading: "Near-zero latency display",
            body: "The general render-display pipeline we use today was built for recorded media, where latency doesn't exist, and modern interactive systems still inherit those latency-free assumptions. We proposed an alternative: tightly integrating render and display to prioritize interactive latency.",
        },
        {
            id: "problem",
            label: "The problem",
            heading: "Latency you can feel",
            body: "Interactive latency is the total, perceived delay from a user's input to the moment photons change on the display. I measured this delay using NVIDIA's LDAT (Latency and Display Analysis Tool) and compared our system against the standard approach.",
            image: "/projects/thesis/interactive_latency.gif",
            alt: "Interactive latency: a GIF showing the delay between a controller button press and the on-screen response.",
        },
        {
            id: "role",
            label: "My role",
            heading: "MSCS Thesis",
            body: "Thesis lead — design, implementation, evaluation. Image from Display Week's Innovation Zone (I-Zone), SID 2026, LA.",
            image: "/projects/thesis/SID_IZone_2026.jpeg",
            alt: "SID Innovation Zone 2026",
            focal: "center top",
            size: "LG",
        },
        {
            id: "solution",
            label: "Solution",
            heading: "The approach",
            body: "Frames cause latency. Our system takes advantage of a property of image-order renderers (ray tracing), where pixels can be displayed the instant they're computed. Interactive latency is minimized by sampling and updating pixels framelessly, individually and just-in-time, along a stochastic scan pattern.",
        },
        {
            id: "results",
            label: "Results",
            heading: "Results",
            body: "In a controlled experiment with render speed throttled to 60 Hz, we achieved click-to-photon latency under 2 ms across the entire panel on average. This is only possible due to our unique ability to update pixels throughout the frame.",
        },
        {
            id: "future",
            label: "Future",
            heading: "Looking forward",
            body: "This has been an incredible project to work on, and it's taken me to some exciting places. I'm eager to keep improving on the system. Image from PRICE technical workshop, SIGGRAPH 2026, LA.",
            image: "/projects/thesis/SIGGRAPH_PRICE_2026.jpeg",
            alt: "SIGGRAPH PRICE Technical Workshop 2026",
        },
    ],
};