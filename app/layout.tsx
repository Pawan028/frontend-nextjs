// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Providers from './providers';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'ShipMVP - Shipping Management',
  description: 'Multi-courier shipping aggregator platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
