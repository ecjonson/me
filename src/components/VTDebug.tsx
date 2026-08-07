"use client";
import { useEffect } from "react";

export function VTDebug() {
    useEffect(() => {
        const orig = document.startViewTransition?.bind(document);
        if (!orig) return;
        const box = document.createElement("pre");
        box.style.cssText =
            "position:fixed;left:4px;bottom:4px;z-index:99999;max-width:96vw;max-height:45vh;overflow:auto;margin:0;padding:6px;background:rgba(0,0,0,.85);color:#0f0;font:10px/1.3 monospace;white-space:pre-wrap;pointer-events:none";
        document.body.appendChild(box);
        const log = (s: string) => { box.textContent = s + "\n----\n" + box.textContent; };
        document.startViewTransition = (cb: () => void) => {
            const t = orig(cb);
            t.ready.then(() => requestAnimationFrame(() => {
                const groups = [...new Set(
                    document.getAnimations()
                        .map(a => (a.effect as KeyframeEffect | null)?.pseudoElement)
                        .filter((p): p is string => !!p && p.startsWith("::view-transition"))
                )].sort();
                log(`READY (${groups.length}):\n` + groups.join("\n"));
            })).catch(() => log("ready rejected"));
            return t;
        };
        return () => { document.startViewTransition = orig; box.remove(); };
    }, []);
    return null;
}