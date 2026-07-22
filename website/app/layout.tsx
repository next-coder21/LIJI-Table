import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Update this once the site has a real domain (or set NEXT_PUBLIC_SITE_URL at build time).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://liji-table.example.com";
const TITLE = "Liji Table — the data-grid engine every framework deserves";
const DESCRIPTION =
  "A framework-agnostic, headless table engine with React, Angular, and pre-built UI bindings. Sorting, filtering, grouping, virtualization, and layout persistence — in about 12kB.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Liji Table",
  },
  description: DESCRIPTION,
  authors: [{ name: "Lijish Wilson" }],
  creator: "Lijish Wilson",
  keywords: [
    "data table",
    "data grid",
    "react table",
    "angular table",
    "headless table",
    "framework agnostic",
    "virtualization",
    "liji table",
  ],
  category: "technology",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Liji Table",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport = {
  themeColor: "#05060d",
};

// Dark is the default brand identity; only opt out into `.light` if the
// visitor explicitly chose it before. Runs before hydration to avoid a flash.
const themeInitScript = `
(function () {
  try {
    if (localStorage.getItem('liji-theme') === 'light') {
      document.documentElement.classList.add('light');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
