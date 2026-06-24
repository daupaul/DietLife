import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_TC, Geist_Mono } from "next/font/google";
import "./globals.css";

// Sans: Inter (Latin/numerals) + Noto Sans TC (Traditional Chinese).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  display: "swap",
  // CJK subsets are huge — fetch on demand rather than preloading.
  preload: false,
});

// Mono: numeric values, dates and times (per spec §2.1).
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DietLife 飲控生活",
  description: "雲端同步的飲食控制與體重追蹤，手機優先。",
};

// Mobile-first: cover the iOS safe area (notch / home indicator). We do NOT
// block pinch-zoom (accessibility); the 16px base font prevents iOS focus
// auto-zoom instead.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${inter.variable} ${notoSansTC.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
