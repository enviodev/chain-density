import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Chain Density",
  description:
    "Analyze and visualize event and transaction density for any address across 60+ chains.",
  icons: {
    icon: [
      {
        url: "/favicon/favicon.png",
        href: "/favicon/favicon.png",
      },
    ],
    shortcut: ["/favicon/favicon.png"],
    apple: [
      {
        url: "/favicon/favicon.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon/favicon.png" />
        <link rel="shortcut icon" href="/favicon/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon/favicon.png" />
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
