import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "CivicFlow - Smart Civic Issue Management",
  description: "Transform your city with intelligent issue tracking, reporting, and resolution. CivicFlow connects citizens, field workers, and administrators for efficient civic management.",
  keywords: ["civic management", "issue tracking", "city administration", "smart city", "citizen engagement"],
  authors: [{ name: "CivicFlow Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased bg-dark-900 text-gray-100 font-sans font-light tracking-tight"
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}