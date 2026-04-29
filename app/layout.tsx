import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Organizador de prioridades",
  description: "Sua IA pessoal pra organizar tarefas",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
        <footer className="flex flex-col items-center gap-1 px-6 py-6 text-center text-xs text-foreground/40">
          <span>Copyright feito por Giu 2026</span>
          <a
            href="/admin/entrar"
            className="text-foreground/30 transition-colors hover:text-foreground/70"
          >
            admin
          </a>
        </footer>
      </body>
    </html>
  );
}
