// PROVIDERS
import { ThemeProvider } from "@/shared/providers/theme-provider";

// COMPONENTS
import { HeaderProtected } from "@/shared/components/ui/header/header_protected";

export default async function ProtectedLayout({
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
          <HeaderProtected />
          {children}
        </ThemeProvider>
    </>
  );
}