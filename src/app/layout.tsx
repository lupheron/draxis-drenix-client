import type { Metadata } from "next";
import { Montserrat, Source_Sans_3 } from "next/font/google";
import QueryProviderDefault from "@/components/Providers/QueryProviderDefault";
import "./globals.css";

const display = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DRAXIS Client Portal",
  description:
    "Everyday workspace for DRAXIS employees — your day, your performance, your leads.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-[var(--foreground)]">
        <QueryProviderDefault>{children}</QueryProviderDefault>
      </body>
    </html>
  );
}
