import type { Project } from "./types";
import { lowLatencyDisplay } from "./low-latency-display";
import { fluidsSimulator } from "./fluids-simulator";
import { pathtracing } from "./pathtracing";
import { gmailAddon } from "./gmail-addon";

// re-export the types so existing `@/lib/projects` imports keep working
export type { Project, ProjectSection, ProjectLink } from "./types";

// add a project by dropping a file in this folder and adding it below
export const projects: Project[] = [
    lowLatencyDisplay,
    fluidsSimulator,
    pathtracing,
    gmailAddon,
].sort((a, b) => b.year - a.year);