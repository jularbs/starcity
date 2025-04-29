//TODOS: Handle no authorization token error
import { Toaster } from "@/components/ui/sonner"
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

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
      </body>
    </html >
  );
}
