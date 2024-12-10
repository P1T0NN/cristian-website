// NEXTJS IMPORTS
import type { Metadata } from "next";
import { Inter } from "next/font/google";

// STYLES
import "./globals.css";

// LIBRARIES
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { SpeedInsights } from "@vercel/speed-insights/next"

// PROVIDERS
import { ThemeProvider } from "@/providers/theme-provider";
import { ReactQueryClientProvider } from "@/providers/react-query-client-provider";

// COMPONENTS
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crys Sports",
  description: "Únete a emocionantes partidos de fútbol con Crys Sports. Reserva tu lugar en partidos 8v8 y otros formatos. Juega, conéctate y disfruta del fútbol con jugadores de todos los niveles.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <ReactQueryClientProvider>
      <html lang={locale}>
        <body className={inter.className}>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
              <SpeedInsights />
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}