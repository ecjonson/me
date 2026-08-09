import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Evan Jonson",
        short_name: "Evan Jonson",
        description: "Computer scientist, engineer, graphics researcher, and programmer.",
        id: "/",
        start_url: "/",
        scope: "/",
        lang: "en",
        dir: "ltr",
        display: "standalone",
        orientation: "any",
        categories: ["business"],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
            {
                src: "/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
        screenshots: [
            {
                src: "/screenshots/desktop.png",
                sizes: "1280x720",
                type: "image/png",
                form_factor: "wide",
            },
            {
                src: "/screenshots/mobile.png",
                sizes: "750x1334",
                type: "image/png",
                form_factor: "narrow",
            },
        ],
    };
}