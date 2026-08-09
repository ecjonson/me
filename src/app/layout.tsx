import type { Metadata, Viewport } from "next";
import { DEFAULT_CUSTOM } from "@/lib/theme";
import "./globals.css";

const themeScript = `
    (function () {
        try {
            var root = document.documentElement;
            var t = localStorage.getItem('theme') || 'system';

            function isDark(hex) {
                var m = hex.replace('#', '');
                if (m.length === 3) m = m[0]+m[0]+m[1]+m[1]+m[2]+m[2];
                var r = parseInt(m.slice(0,2),16)/255, g = parseInt(m.slice(2,4),16)/255, b = parseInt(m.slice(4,6),16)/255;
                function lin(v){ return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }
                return (0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b)) < 0.5;
            }

            if (t === 'custom') {
                var c = {};
                try { c = JSON.parse(localStorage.getItem('customTheme') || '{}'); } catch (e) {}
                var primary = c.primary || c.bg || '${DEFAULT_CUSTOM.primary}';
                var ac = c.accent || '${DEFAULT_CUSTOM.accent}';
                root.style.setProperty('--background', primary);
                root.style.setProperty('--accent', ac);
                if (isDark(primary)) root.classList.add('dark');
            } else {
                var mDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (t === 'dark' || (t === 'system' && mDark)) root.classList.add('dark');
            }

            var mp = localStorage.getItem('motion') || 'system';
            var mReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (mp === 'reduced' || (mp === 'system' && mReduce)) root.classList.add('reduce-motion');

            var bg = getComputedStyle(root).getPropertyValue('--background').trim();
            if (bg) {
                var meta = document.querySelector('meta[name="theme-color"]');
                if (meta) meta.setAttribute('content', bg);
            }
        } catch (e) {}
    })();
`;

export const viewport: Viewport = {
    themeColor: "#ffffff",
};

export const metadata: Metadata = {
    title: "Evan Jonson",
    description: "Computer scientist, engineer, graphics researcher, and programmer.",
    metadataBase: new URL("https://evanjonson.com"),
    openGraph: {
        title: "Evan Jonson",
        description: "Computer scientist, engineer, graphics researcher, and programmer.",
        url: "https://evanjonson.com",
        siteName: "Evan Jonson",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
                {children}
            </body>
        </html>
    );
}
