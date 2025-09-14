import { Providers } from "@/app/providers";
import Header from "@/components/Header";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Trackback",
  description: "Trackback"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <Providers>
        <body
          className={`${poppins.variable} ${poppins.className} font-poppins relative flex min-h-screen flex-col bg-zinc-950 text-zinc-100`}
        >
          <Header />
          <main className="flex min-h-0 w-full flex-grow flex-col overflow-x-hidden">{children}</main>
        </body>
      </Providers>
    </html>
  );
}
