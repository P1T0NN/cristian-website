// PROVIDERS
import { ThemeProvider } from "@/providers/theme-provider";

// COMPONENTS
import { HeaderUnprotected } from "@/components/ui/header/header_unprotected";

export default async function UnprotectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          <HeaderUnprotected />
          {children}
        </ThemeProvider>
    </>
  );
}