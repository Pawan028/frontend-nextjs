import './globals.css';
import { ReactNode } from 'react';
import Providers from './providers';
import Navbar from '../components/Navbar';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { TopupModal } from '../components/TopupModal';
import OnboardingTour from '../components/OnboardingTour';
import { inter, barcode128 } from '../lib/fonts';

export const metadata = {
    title: 'ShipMVP - Shipping Management',
    description: 'Multi-courier shipping aggregator platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
        <body className={`${inter.variable} ${barcode128.variable} font-sans`}>
        <Providers>
            <ErrorBoundary>
                <Navbar />
                <main className="p-4">{children}</main>
                <TopupModal />
                <OnboardingTour />
            </ErrorBoundary>
        </Providers>
        </body>
        </html>
    );
}