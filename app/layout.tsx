import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alakara Studios Kapenguria | Professional Photography & Videography",
  description: "Professional photography and videography services in Kapenguria, West Pokot. Wedding photography, music videos, choir recording, studio portraits, and corporate events.",
  keywords: "photography Kapenguria, videography West Pokot, wedding photographer Kapenguria, music video production, choir recording, studio portraits, Alakara Studios",
  authors: [{ name: "Alakara Studios" }],
  openGraph: {
    title: "Alakara Studios Kapenguria | Professional Photography & Videography",
    description: "Professional photography and videography services in Kapenguria, West Pokot. Book your session today!",
    url: "https://alakara-studios.vercel.app",
    siteName: "Alakara Studios Kapenguria",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Alakara Studios Kapenguria",
      },
    ],
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alakara Studios Kapenguria | Professional Photography & Videography",
    description: "Professional photography and videography services in Kapenguria, West Pokot",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console code here
  },
  alternates: {
    canonical: "https://alakara-studios.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}