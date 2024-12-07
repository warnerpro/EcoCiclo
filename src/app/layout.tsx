import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/session-provider";
import { Toaster } from "@/components/ui/toaster";

const mainFontFamily = Plus_Jakarta_Sans({
  weight: ["300", "500", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoCiclo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mainFontFamily.className} antialiased`}>
        <SessionWrapper>{children}</SessionWrapper>
        <Toaster />
      </body>
    </html>
  );
}
