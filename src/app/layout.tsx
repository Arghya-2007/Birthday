import type { Metadata, Viewport } from "next";
import "./globals.css";
import SplashCursor from "@/components/SplashCursor";

export const metadata: Metadata = {
  title: "A Special Day",
  description: "Something just for you.",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased cursor-none">
        <SplashCursor 
          RAINBOW_MODE={true}
          COLOR="#C9A96E"
          SPLAT_RADIUS={0.2}
          SHADING={true}
        />
        {children}
      </body>
    </html>
  );
}
