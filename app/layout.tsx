import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "深海圈 - 海外AI产品",
  description: "深海圈是专注于海外AI产品开发的在线教育社区，教授使用AI编程工具开发SaaS产品并实现商业变现。",
  keywords: "AI编程, SaaS开发, 海外产品, AI工具, 深海圈, 刘小排",
  authors: [{ name: "深海圈团队" }],
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: "深海圈 - 海外AI产品",
    description: "用AI编程，兑现你的创意",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
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
