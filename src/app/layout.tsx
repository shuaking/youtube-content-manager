import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Language Reactor",
  description: "Language Reactor: your language learning toolbox. Discover, understand, and learn from native materials, including Netflix and YouTube.",
  icons: {
    icon: "/favicon.ico",
    apple: "/pwa/apple-icon-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#913ca0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Sidebar />
        <div className="md:pl-[240px]">
          {children}
        </div>
      </body>
    </html>
  );
}
