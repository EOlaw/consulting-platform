import './globals.css';
import type { Metadata } from 'next';
import { MuiSetup } from '@/components/MuiSetup';

export const metadata: Metadata = {
  title: 'Consulting Platform',
  description: 'A comprehensive consulting platform for business growth',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MuiSetup>{children}</MuiSetup>
      </body>
    </html>
  );
}
