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
    default: "BeaverDash - Quản lý dự án cho nhóm sinh viên",
    template: "%s | BeaverDash",
  },
  description: "BeaverDash - Hệ thống quản lý công việc và dự án học tập thông minh cho học sinh, sinh viên. Tối ưu hóa làm việc nhóm, quản lý tiến độ đồ án trực quan với bảng Kanban và Trợ lý AI hỗ trợ học tập.",
  keywords: [
    "BeaverDash",
    "quản lý dự án sinh viên",
    "làm việc nhóm sinh viên",
    "quản lý bài tập nhóm",
    "quản lý đồ án",
    "bảng kanban",
    "kanban board",
    "cộng tác nhóm",
    "tối ưu hiệu suất học tập",
    "trợ lý AI học tập",
    "bài tập lớn",
    "đồ án tốt nghiệp"
  ],
  authors: [{ name: "BeaverDash Team" }],
  creator: "BeaverDash Team",
  publisher: "BeaverDash",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.beaverdash.xyz"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" }
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "BeaverDash - Quản lý dự án cho nhóm sinh viên",
    description: "Hệ thống quản lý công việc, dự án học tập và bảng Kanban thông minh tối ưu cho học sinh, sinh viên làm việc nhóm.",
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
    title: "BeaverDash - Quản lý dự án cho nhóm sinh viên",
    description: "Hệ thống quản lý công việc, dự án học tập và bảng Kanban thông minh tối ưu cho học sinh, sinh viên làm việc nhóm.",
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
    "alternateName": "BeaverDash - Quản lý dự án cho nhóm sinh viên",
    "url": "https://www.beaverdash.xyz",
    "description": "Hệ thống quản lý công việc, tiến độ dự án học tập và bảng Kanban thông minh tối ưu cho học sinh, sinh viên làm việc nhóm.",
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
