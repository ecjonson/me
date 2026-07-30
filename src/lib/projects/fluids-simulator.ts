import type { Project } from "./types";

export const fluidsSimulator: Project = {
    slug: "fluids-simulator",
    name: "Fluids simulator",
    year: 2025,
    blurb: "Fluids simulator with blobby modeling (metaballs) and spring mechanics.",
    image: "/projects/metaball_fluids/metaball_fluids_01.png",
    alt: "Fluids simulator",
    focal: "center",
    links: [
        { label: "Demo video", href: "https://ecjonson.github.io/MetaballFluids/demo.mp4" },
        { label: "Interactive tool", href: "https://ecjonson.github.io/MetaballFluids/", desktopOnly: true },
        { label: "Github", href: "https://github.com/ecjonson/MetaballFluids" },
    ],
    sections: [
        {
            id: "overview",
            label: "Overview",
            heading: "Metaball fluids with marching cubes",
            body: "I combined blobby (metaball) modeling with spring-based physics to generate a fluid surface mesh that melds and deforms in real time.",
            image: "/projects/metaball_fluids/metaball_fluids_01.gif",
            alt: "Animated metaball fluid melding and deforming in the simulator.",
            size: "SM",
        },
        {
            id: "mesh",
            label: "Metaballs",
            heading: "Metaballs with marching cubes",
            body: "Metaballs, also called blobby objects, are implicit isosurfaces that meld together as they approach one another. I polygonize them into a renderable mesh with marching cubes.",
            image: "/projects/metaball_fluids/metaball_fluids_04.png",
            alt: "Metaball surface from the simulator.",
        },
        {
            id: "physics",
            label: "Physics",
            heading: "Spring mechanics",
            body: "A network of springs governs how the particles push and pull on one another, making a tunable sandbox-style physics playground.",
            image: "/projects/metaball_fluids/metaball_fluids_02.png",
            alt: "Particle physics visualized in the simulator.",
        },
        {
            id: "implementation",
            label: "Implementation",
            heading: "Implementation",
            body: "I implemented this from scratch in WebGL 1.0, everything from rendering and shading to the physics and interface. Run it in your browser!",
            image: "/projects/metaball_fluids/metaball_fluids_03.png",
            alt: "Rendered fluid from the simulator.",
        },
        {
            id: "sandbox",
            label: "Sandbox",
            heading: "Sandbox",
            body: "Play with shading techniques and physics variables to create your own liquids, or just play with the particles.",
            image: "/projects/metaball_fluids/metaball_fluids_05.png",
            alt: "Simulator with many particles forming a fluid.",
        },
    ],
};
