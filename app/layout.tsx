import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "AI Booking Scheduler Kit",
  description: "Timezone-aware booking, reservations, reminders, and AI scheduling assistant.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
