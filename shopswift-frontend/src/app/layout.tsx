import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthInitializer } from '@/components/AuthInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'ShopSwift', template: '%s | ShopSwift' },
  description: 'Premium products at unbeatable prices.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthInitializer />
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}