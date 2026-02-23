import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DreamWriter | AI 网文生成神器',
  description: '你的私人 AI 爆款网文生成神器 | 极简与硬核双模式',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased selection:bg-primary/30`}>
        {children}
      </body>
    </html>
  );
}
