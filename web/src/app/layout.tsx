import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AlertConfirmProvider } from "@/components/providers/AlertConfirmProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BeaverDash - Quản lý dự án",
    template: "%s | BeaverDash",
  },
  description: "BeaverDash - Hệ thống quản lý công việc và bảng Kanban thông minh giúp tối ưu hóa hiệu suất làm việc nhóm, theo dõi tiến độ trực quan, và tích hợp trợ lý AI chuyên nghiệp.",
  keywords: [
    "BeaverDash",
    "quản lý dự án",
    "quan ly du an",
    "quản lý công việc",
    "quan ly cong viec",
    "bảng kanban",
    "kanban board",
    "cộng tác nhóm",
    "tối ưu hiệu suất",
    "trợ lý AI",
    "quản lý tiến độ",
  ],
  authors: [{ name: "BeaverDash Team" }],
  creator: "BeaverDash Team",
  publisher: "BeaverDash",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.beaverdash.xyz"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BeaverDash - Quản lý dự án",
    description: "Hệ thống quản lý công việc và bảng Kanban thông minh giúp tối ưu hóa hiệu suất làm việc nhóm.",
    url: "https://www.beaverdash.xyz",
    siteName: "BeaverDash",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "BeaverDash Logo",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "BeaverDash - Quản lý dự án",
    description: "Hệ thống quản lý công việc và bảng Kanban thông minh giúp tối ưu hóa hiệu suất làm việc nhóm.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "0ohv2P32ErCmhaqC8BbG3uLJLBT-SOdqhkNSKip7nSw",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BeaverDash",
    "alternateName": "BeaverDash - Quản lý dự án",
    "url": "https://www.beaverdash.xyz",
    "description": "Hệ thống quản lý công việc và bảng Kanban thông minh giúp tối ưu hóa hiệu suất làm việc nhóm.",
    "logo": "https://www.beaverdash.xyz/logo.png",
  };

  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        <AuthProvider>
          <AlertConfirmProvider>
            <ToastProvider>{children}</ToastProvider>
          </AlertConfirmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
