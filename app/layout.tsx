"use client";

import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { JourneyProvider } from "user-journey-analytics";
import ExportButton from "./components/ExportButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <JourneyProvider 
            appName="Demo User Journey App"
            devOnly={true}
            endpoint="/api/journey"
            flushInterval={30000}
            batchSize={10}
            persist={true}
            session={true}
          >
            {children as any}
            <ExportButton />
          </JourneyProvider>
        </Suspense>
      </body>
    </html>
  );
}
