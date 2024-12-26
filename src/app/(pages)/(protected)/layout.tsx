// PROVIDERS
import { ThemeProvider } from "@/providers/theme-provider";

// COMPONENTS
import { HeaderProtected } from "@/components/ui/header/header_protected";

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