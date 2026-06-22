import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
