import type { Metadata } from "next";
import "./globals.css";

const themeScript = `
    (function () {
        try {
            var t = localStorage.getItem('theme') || 'system';
            var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (t === 'dark' || (t === 'system' && m)) {
            document.documentElement.classList.add('dark');
            }
        } catch (e) {}
    })();
`;

export const metadata: Metadata = {
    title: "Evan Jonson",
    description: "Computer scientist and graphics researcher and programmer.",
    metadataBase: new URL("https://evanjonson.com"),
    openGraph: {
        title: "Evan Jonson",
        description: "Computer scientist and graphics researcher and programmer.",
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
