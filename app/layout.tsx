import type { Metadata } from "next";
import "./globals.css";
import Navbar  from "./navbar";

export const metadata: Metadata = {
  title: "Kakiyo Outreach",
  description: "AI-powered outreach platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
