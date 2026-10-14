import type { Metadata, Viewport } from "next";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import { CodeSpotlight } from "@/components/code-spotlight";
import { Nav } from "@/components/nav";
import { themeScript } from "@/components/theme-toggle";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: {
    default: `${profile.name} · ${profile.role}`,
    template: `%s · ${profile.name}`,
  },
  description: profile.summary,
  openGraph: {
    type: "website",
    title: `${profile.name} · ${profile.role}`,
    description: profile.summary,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0e13" },
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
        >
          Skip to content
        </a>
        <CodeSpotlight />
        <div className="relative z-10 mx-auto max-w-[1100px] px-6">
          <Nav />
          <main id="main">{children}</main>
          <footer className="mt-10 flex flex-wrap justify-between gap-4 border-t border-line py-8 text-[13px] text-muted">
            <span>© {profile.name}</span>
            <span>built with Next.js · deployed on Vercel</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
