import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar/navbar";
import { ClerkProvider } from "@clerk/nextjs";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <ClerkProvider>
      <body>
        <Navbar />
        {children}
        </body>
      </ClerkProvider>
    </html>
  );
}
