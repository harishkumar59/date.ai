import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today in History",
  description: "Discover interesting historical events that happened on any date",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white">{children}</body>
    </html>
  );
}
