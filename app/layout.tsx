import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  title: "DormPay",
  description: "Dormitory payment system",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/*
        Body must NOT be flex-col here.
        The AdminShell / RoleShell owns the full-screen layout via
        `h-screen w-screen overflow-hidden` on its root div.
        Adding flex-col + min-h-full on body fights that and causes scroll bleed.
      */}
      <body
        suppressHydrationWarning
        className="h-full bg-background text-foreground"
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}