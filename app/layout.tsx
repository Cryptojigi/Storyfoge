import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingBubbles from "@/components/FloatingBubbles";
import ThemeToggle from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Storyfoge — AI-Powered Story & World Builder on 0G",
  description:
    "Create and continue interactive stories powered by decentralized AI on the 0G network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem("theme");
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                if (savedTheme === "light" || (!savedTheme && !prefersDark)) {
                  document.documentElement.classList.remove("dark");
                } else {
                  document.documentElement.classList.add("dark");
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="square-grid min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <FloatingBubbles />
        {/* Upper Banner */}
        <nav className="flex items-center justify-between px-4 sm:px-8 py-5 z-50 relative bg-transparent w-full">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600 dark:text-zinc-400">Storyfoge</span>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-600 dark:text-zinc-400">Synced</span>
            </div>
          </div>
          <div>
            {/* Future components (e.g., wallet) */}
            <div className="fixed top-5 right-5 sm:top-6 sm:right-8 z-[100]">
              <ThemeToggle />
            </div>
          </div>
        </nav>
        
        <main className="flex-1 flex flex-col relative z-0">
          {children}
        </main>

        {/* Lower Banner */}
        <footer className="flex flex-col sm:flex-row items-center justify-center px-4 sm:px-8 py-6 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500 z-50 relative bg-transparent gap-4 sm:gap-8 w-full">
          <a href="#" className="hover:text-zinc-300 transition-colors">Technical Docs</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Node</a>
        </footer>
      </body>
    </html>
  );
}
