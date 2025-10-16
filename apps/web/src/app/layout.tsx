import { Providers } from "@/app/providers";
import Header from "@/components/navigation/Header";
import TabsNavigation from "@/components/navigation/TabsNavigation";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// The following import prevents a Font Awesome icon server-side rendering bug,
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

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
          className={`${poppins.variable} ${poppins.className} font-poppins relative flex min-h-screen flex-col text-zinc-100`}
        >
          <div className="bg-gradient-primary flex h-full min-h-0 flex-grow flex-col">
            <Header />
            <main className="flex min-h-0 w-full flex-grow flex-col overflow-x-hidden pb-16 sm:pb-0">{children}</main>
            <TabsNavigation />
          </div>
        </body>
      </Providers>
    </html>
  );
}
