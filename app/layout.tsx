import './globals.css';
import type { Metadata } from 'next';
import { Logo } from '@/components/Logo';

export const metadata: Metadata = {
  title: 'ALIBI - AI Detective',
  description: 'Everyone has a story. One of them is lying.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-black">
      <body className="text-green-500 font-mono min-h-screen flex flex-col items-center justify-center">
        <Logo />
        {children}
      </body>
    </html>
  );
}
