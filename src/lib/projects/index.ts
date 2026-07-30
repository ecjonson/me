import type { Project } from "./types";
import { lowLatencyDisplay } from "./low-latency-display";
import { fluidsSimulator } from "./fluids-simulator";
import { pathtracing } from "./pathtracing";
import { gmailAddon } from "./gmail-addon";

// Re-export the types so existing `@/lib/projects` imports keep working.
export type { Project, ProjectSection, ProjectLink } from "./types";

// Add a project by dropping a file in this folder and adding it below — the list
// is sorted by year (newest first) at build, so position here doesn't matter and
// both the carousel timeline and the project prev/next follow the same order.
// Flip to `a.year - b.year` for oldest-first.
export const projects: Project[] = [
    lowLatencyDisplay,
    fluidsSimulator,
    pathtracing,
    gmailAddon,
].sort((a, b) => b.year - a.year);