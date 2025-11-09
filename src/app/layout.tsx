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
  title: "Agentic Social Media Strategist",
  description:
    "AI-driven social media agent that builds brand personas, content calendars, and campaign assets.",
  keywords: [
    "social media agent",
    "content calendar",
    "ai marketing assistant",
    "campaign generator",
  ],
  metadataBase: new URL("https://agentic-83d358e6.vercel.app"),
  openGraph: {
    title: "Agentic Social Media Strategist",
    description:
      "Interactive AI agent that plans and generates social media content across platforms.",
    url: "https://agentic-83d358e6.vercel.app",
    siteName: "Agentic Social Media Strategist",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Agentic Social Media Strategist dashboard",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-surface`}
      >
        {children}
      </body>
    </html>
  );
}
