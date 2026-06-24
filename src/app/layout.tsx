import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import "./globals.css";

// Body sans: Inter (Latin/numerals) + Noto Sans TC (Traditional Chinese).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  display: "swap",
  preload: false, // CJK subsets are huge — fetch on demand
});

// Display serif: Fraunces (editorial headings + hero numerals) + Noto Serif TC.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
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
  themeColor: "#f6f4ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${inter.variable} ${notoSansTC.variable} ${fraunces.variable} ${notoSerifTC.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
