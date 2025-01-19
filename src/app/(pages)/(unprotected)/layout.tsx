// PROVIDERS
import { ThemeProvider } from "@/shared/providers/theme-provider";

// COMPONENTS
import { HeaderUnprotected } from "@/shared/components/ui/header/header_unprotected";

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