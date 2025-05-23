import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { HeaderServer } from "@/components/layout/HeaderServer";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { ThemeProvider } from "@/components/ThemeProvider";
import { baseMetadata, viewport } from "@/lib/metadata";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = baseMetadata;
export { viewport };

import { AppProvider } from '@/context/app-context';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col bg-white dark:bg-[#121212]`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AppProvider>
            <HeaderServer />
            <main className="flex-1 w-full">
              {children}
            </main>
            <ConditionalFooter />
            <Toaster position="top-center" richColors />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
