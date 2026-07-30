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
    blurb: string;
    image: string;
    alt: string;
    focal?: string; // object-position for the hero, e.g. "center top" or "50% 20%"
    links?: { label: string; href: string }[];
    sections: ProjectSection[];
};

export const projects: Project[] = [
    {
        slug: "low-latency-display",
        name: "Low-latency display",
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
                body: "Rendering and display systems were built for recorded media, where latency doesn't exist. Modern interactive systems still inherit those latency-free assumptions. We proposed an alternative: tightly integrating rendering and display to prioritize interactive latency.",
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
                body: "Thesis lead — design, implementation, evaluation.",
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
    },
    {
        slug: "fluids-simulator",
        name: "Fluids simulator",
        blurb: "Fluids simulator with blobby modeling (metaballs) and spring mechanics.",
        image: "/projects/metaball_fluids/metaball_fluids_01.png",
        alt: "Fluids simulator",
        focal: "center",
        links: [
            { label: "Demo video", href: "https://ecjonson.github.io/MetaballFluids/demo.mp4" },
            { label: "Interactive tool", href: "https://ecjonson.github.io/MetaballFluids/" },
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
    },
    {
        slug: "gmail-addon",
        name: "InterAction+ for Gmail",
        blurb: "Senior design project with LexisNexis to extend their Outlook extension toolkit InterAction+ into Google Workspace.",
        image: "/projects/interaction_plus/posters_and_pies_02.jpeg",
        alt: "Senior design posters and pies group photo 2023",
        focal: "center right",
        sections: [
            {
                id: "overview",
                label: "Overview",
                heading: "InterAction+ for Gmail",
                body: "We teamed up with LexisNexis to design and build a Gmail add-on based on InterAction+, their Outlook CRM extension for legal professionals.",
                image: "/projects/interaction_plus/login.png",
                alt: "Low-level design of the login screen in the Gmail add-on.",
                focal: "center right",
                size: "LG",
            },
            {
                id: "role",
                label: "My role",
                heading: "My role",
                body: "Design, project staging, and implementation. I worked on the high-level designs in Balsamiq, staged the project for effective team collaboration, and wrote much of the code in Google Apps Script.",
                image: "/projects/interaction_plus/posters_and_pies_01.jpeg",
                alt: "Evan Jonson at the senior design posters and pies event, 2023.",
                size: "SM",
            },
            {
                id: "design",
                label: "Design",
                heading: "The design",
                body: "We mapped every screen and flow in Balsamiq before we touched code, starting with authentication, how a user securely connects the add-on to their InterAction+ account from inside Gmail.",
                image: "/projects/interaction_plus/design_01.png",
                alt: "Authentication flow diagram of our Gmail add-on.",
            },
            {
                id: "architecture",
                label: "Architecture",
                heading: "System architecture",
                body: "The add-on had to bridge Gmail, Google Apps Script, and the InterAction+ backend. This diagram lays out how those pieces talk to each other and where data moves between them.",
                image: "/projects/interaction_plus/design_02.png",
                alt: "System architecture diagram of our Gmail add-on.",
                size: "LG",
            },
            {
                id: "staging",
                label: "Staging",
                heading: "Project staging",
                body: "To keep a student team building in parallel, I broke the work into staged, dependency-ordered tasks in a shared JSON, so everyone always knew what was unblocked and ready to pick up next.",
                image: "/projects/interaction_plus/staging_01.png",
                alt: "Project staging JSON file.",
                focal: "center left",
            },
            {
                id: "implementation",
                label: "Implementation",
                heading: "Google Apps Script",
                body: "We built the add-on in Google Apps Script, Google's platform for extending Workspace. Here it's open to a contact's sender details, surfacing their InterAction+ relationship data right beside the email.",
                image: "/projects/interaction_plus/sender_details.png",
                alt: "Our add-on open to a contact's sender details page.",
                focal: "center right",
                size: "LG",
            },
            {
                id: "reflection",
                label: "Reflection",
                heading: "Reflection",
                body: "This project taught me how careful design and disciplined task staging matter when a team is shipping against an unfamiliar platform on a deadline, and was a fun exercise on overcoming framework limitations.",
            },
        ],
    },
    {
        slug: "pathtracing",
        name: "Path tracer",
        blurb: "A physically-based path tracer written from scratch in WebGL 1.0, rendering the Cornell box.",
        image: "/projects/pathtracing/cornell_box_01.png", // final / converged render (hero)
        alt: "Path-traced Cornell box, fully converged.",
        focal: "center",
        sections: [
            {
                id: "overview",
                label: "Overview",
                heading: "Light, simulated from scratch",
                body: "For an advanced graphics course I built a Monte Carlo path tracer from scratch, no engine, no ray-tracing library, and pointed it at the Cornell box. Path tracing simulates light in reverse: rays leave the camera, bounce randomly around the room, and gather the light they find, so averaging enough of them per pixel produces a physically accurate image.",
            },
            {
                id: "progressive",
                label: "Rendering",
                heading: "Converging in the browser",
                body: "WebGL 1.0 has no compute shaders, so the entire tracer lives in a fragment shader. Each frame traces a fresh batch of random samples and blends them into an accumulation buffer using ping-pong framebuffers, the image starts as pure noise and refines itself the longer you let it run.",
                image: "/projects/pathtracing/cornell_box_02.png",
                alt: "Early Cornell box render, noisy with only a few samples per pixel.",
                size: "LG",
            },
            {
                id: "gi",
                label: "Global illumination",
                heading: "Color bleeding",
                body: "The Cornell box earns its fame right here: light bouncing off the red and blue walls tints the white surfaces nearby. That subtle color bleed is indirect lighting, the effect that only global illumination, not traditional direct lighting, can reproduce.",
                image: "/projects/pathtracing/cornell_box_01.png",
                alt: "Cornell box render showing color bleeding from the red and blue walls.",
                size: "LG",
            },
            {
                id: "convergence",
                label: "Convergence",
                heading: "Thousands of samples later",
                body: "Monte Carlo noise falls off slowly, halving it takes four times the samples, so the finished image is the average of thousands of light paths per pixel. What's left is soft shadows, smooth gradients, and clean indirect light.",
                image: "/projects/pathtracing/cornell_box_03.png",
                alt: "Nearly noise-free, converged Cornell box render.",
                size: "LG",
            },
            {
                id: "bugs",
                label: "Happy accidents",
                heading: "Pretty bugs",
                body: "Writing a renderer from scratch means breaking it in visually spectacular ways. A few of my favorite failures:",
            },
            {
                id: "bug-fireflies",
                label: "Fireflies",
                heading: "Fireflies",
                body: "High-variance samples divided by a near-zero probability blow up into bright specks scattered across the frame. Mathematically wrong, weirdly starry.",
                image: "/projects/pathtracing/cornell_box_07.png",
                alt: "Cornell box render peppered with bright firefly noise.",
                size: "LG",
            },
            {
                id: "bug-leak",
                label: "Light leak",
                heading: "Light leak",
                body: "A missing clamp let energy escape through the walls, washing the whole scene in an impossible, dreamy glow.",
                image: "/projects/pathtracing/cornell_box_04.png",
                alt: "Cornell box render with light leaking through the walls.",
                size: "LG",
            },
            {
                id: "bug-plaid",
                label: "Plaid",
                heading: "Plaid",
                body: "Every surface split into an even grid of squares, each converging at its own pace. A soft plaid, woven into the Cornell box.",
                image: "/projects/pathtracing/cornell_box_06.png",
                alt: "Cornell box render with a plaid grid pattern, each square converging at a different rate.",
                size: "LG",
            },
            {
                id: "reflection",
                label: "Reflection",
                heading: "Reflection",
                body: "Building a path tracer bottom-up made the rendering equation click in a way no lecture could, and the bugs were half the fun. Next time I'd reach for WebGL 2.0 or WebGPU to escape the 1.0 constraints and push toward richer scenes.",
            },
        ],
    },
];