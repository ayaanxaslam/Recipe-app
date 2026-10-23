import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Mise — My Recipe Collection", template: "%s · Mise" },
  description: "A personal collection of hundreds of recipes to browse, search, and cook from.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f1" },
    { media: "(prefers-color-scheme: dark)", color: "#17130f" },
  ],
};

const NAV = [
  { href: "/recipes", label: "Browse" },
  { href: "/random", label: "Surprise me" },
  { href: "/generate", label: "AI Kitchen" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh font-sans flex flex-col">
        <header className="no-print sticky top-0 z-30 border-b border-line/70 bg-bg/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
            <Link href="/" className="group flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-accent text-lg text-accent-ink shadow-sm transition group-hover:rotate-6">
                🍽️
              </span>
              <span className="font-serif text-2xl font-semibold tracking-tight">Mise</span>
            </Link>
            <nav className="flex items-center text-[13px] font-medium sm:gap-1 sm:text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={item.href === "/random" ? false : undefined}
                  className="whitespace-nowrap rounded-full px-2.5 py-2 text-muted transition hover:bg-surface-2 hover:text-ink sm:px-3"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="no-print border-t border-line/70 py-8 text-center text-sm text-muted">
          <p>Mise · my personal recipe box · cooked with care</p>
          <p className="mt-1 text-xs">Food photos from Wikimedia Commons, credited on each recipe.</p>
        </footer>
      </body>
    </html>
  );
}
