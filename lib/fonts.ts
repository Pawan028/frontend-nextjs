import { Inter, Libre_Barcode_128 } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const barcode128 = Libre_Barcode_128({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-barcode-128',
});

