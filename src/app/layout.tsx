import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ProviderWrapper from "@/state/ProviderWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Campaign Builder",
  description: "DnD Campaign Builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <ProviderWrapper>
        <body className={inter.className}>
          {children}
          <script src="../path/to/flowbite/dist/flowbite.min.js"></script>
        </body>
      </ProviderWrapper>
    </html>
  );
}
