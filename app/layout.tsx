import type { Metadata } from "next";
import { Outfit, Nunito } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/navbar";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Champions League 2025/26",
  description: "Fixtures, standings, and predictions for UEFA Champions League 2025/26",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`${outfit.variable} ${nunito.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground flex flex-col antialiased">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
