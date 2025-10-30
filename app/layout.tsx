import type { Metadata, Viewport } from "next";
import "./globals.css";

// INTE "use client"! Ingen useEffect här!

export const metadata: Metadata = {
  title: "Frost Bygg",
  description: "Tidsrapportering & fakturering för bygg – Frost Apps",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0ea5e9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
