import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BERT — Talent & Resume Screening | Bertlab",
  description:
    "Intelligent resume analyzer and applicant tracking platform built for Bertlab.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans min-h-screen bg-[#F5F4F6] text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
