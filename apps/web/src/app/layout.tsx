// TODOS: Show Favicon
// TODOS: add google analytics
// TODOS: Post Viewer
import type { Metadata } from 'next';
import { Montserrat, Sigmar_One } from 'next/font/google';
import './globals.css';
import ClientNavigation from '@/components/navigation/ClientNavigation';
import ClientFooter from '@/components/navigation/ClientFooter';
import ProgressProvider from '@/lib/progress/ProgressProvider';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
});

const sigmarOne = Sigmar_One({
  weight: '400',
  variable: '--font-sigmar-one',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Star City Official Website',
  description:
    'Star City is an amusement park located in Pasay City, Philippines known for its variety of rides and attractions, catering to both children and adults',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sigmarOne.variable} ${montserrat.variable}`}>
      <body
        className={`antialiased min-h-screen font-montserrat pointer-events-auto!`}
      >
        <ProgressProvider>
          <ClientNavigation />
          {children}
          <ClientFooter />
        </ProgressProvider>
      </body>
    </html>
  );
}
