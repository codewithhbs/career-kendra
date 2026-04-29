import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout/layout-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

/**
 * Fetch settings from API
 */
async function getSettings() {
  try {
    const res = await fetch(
      "http://localhost:9012/api/v1/ad/get-web-settings",
      { cache: "no-store" }
    );

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Settings fetch error:", error);
    return null;
  }
}

/**
 * Dynamic SEO Metadata
 */
export async function generateMetadata(): Promise<Metadata> {

  const settings = await getSettings();

  return {
    title: settings?.metaTitle || settings?.siteName,
    description: settings?.metaDescription,
    keywords: settings?.metaKeywords,

    icons: {
      icon: settings?.siteLogo,
    },

    openGraph: {
      title: settings?.metaTitle,
      description: settings?.metaDescription,
      images: settings?.siteLogo ? [settings.siteLogo] : [],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const settings = await getSettings();

  return (
    <html lang="en">
      <head>
        {settings?.siteFavicon && (
          <link rel="icon" href={settings.siteFavicon} />
        )}
      </head>

      <body className={`${inter.variable} font-sans antialiased`}>
        <LayoutWrapper settings={settings}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}