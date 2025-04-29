import { Toaster } from "@/components/ui/sonner"
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Star City Dashboard",
  description: "Star City Amusement Park",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} antialiased !pointer-events-auto`}
      >

        {children}
        <Toaster richColors={true} />
        <NextTopLoader
          color="#000000"
          initialPosition={0.08}
          crawlSpeed={500}
          height={5}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={500}
          shadow="0 0 10px #000000,0 0 5px #000000"
          template='<div class="bar" role="bar">
                      <div class="peg"></div>
                    </div> 
                    <div class="spinner" role="spinner">
                      <div class="spinner-icon"></div>
                    </div>'
          zIndex={1600}
          showAtBottom={false}
        />
      </body>
    </html >
  );
}
