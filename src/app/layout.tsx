import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Connectors | FinOps Analytics",
  description: "Connect billing and usage providers to start FinOps analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-bg text-dark-text antialiased selection:bg-brand-blue selection:text-white overflow-hidden">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
