import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sluice — Pay-Per-Call API Monetization on Arc | Meridian Mission Control",
  description:
    "Autonomous pay-per-call API gateway monetizing machine-to-machine AI services in USDC on Arc Testnet & Mainnet with on-chain UsageVault proof.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  keywords: [
    "Arc",
    "USDC",
    "API Gateway",
    "HTTP 402",
    "x402",
    "UsageVault",
    "ETHOnline",
    "Autonomous Agents",
    "Neumorphism",
  ],
  authors: [{ name: "Sluice Architecture Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="meridian">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body data-theme="meridian">
        {children}
      </body>
    </html>
  );
}
