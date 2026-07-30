import type { Project } from "./types";
import { lowLatencyDisplay } from "./low-latency-display";
import { fluidsSimulator } from "./fluids-simulator";
import { gmailAddon } from "./gmail-addon";
import { pathtracing } from "./pathtracing";

// Re-export the types so existing `@/lib/projects` imports keep working.
export type { Project, ProjectSection, ProjectLink } from "./types";

// Add a project by dropping a file in this folder and appending it here.
// Array order is the display order.
export const projects: Project[] = [
    lowLatencyDisplay,
    fluidsSimulator,
    gmailAddon,
    pathtracing,
];
