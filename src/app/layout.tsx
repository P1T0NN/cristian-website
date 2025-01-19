// NEXTJS IMPORTS
import type { Metadata } from "next";
import { Inter } from "next/font/google";

// STYLES
import "./globals.css";

// LIBRARIES
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

// PROVIDERS
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { ReactQueryClientProvider } from "@/shared/providers/react-query-client-provider";

// COMPONENTS
import { Toaster } from "@/shared/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crys Sports",
  description: "Únete a emocionantes partidos de fútbol con Crys Sports. Reserva tu lugar en partidos 8v8 y otros formatos. Juega, conéctate y disfruta del fútbol con jugadores de todos los niveles.",
  icons: {
    icon: [
      { url: '/crys-sports.webp', type: 'image/webp' },
    ],
    apple: '/crys-sports.webp',
    shortcut: '/crys-sports.webp',
  },
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
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}