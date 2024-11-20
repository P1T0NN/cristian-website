// NEXTJS IMPORTS
import { cookies } from "next/headers";

// PROVIDERS
import { ThemeProvider } from "@/providers/theme-provider";

// COMPONENTS
import { HeaderProtected } from "@/components/ui/header/header_protected";

// SERVER ACTIONS
import { getUser } from "@/actions/actions/auth/verifyAuth";

// TYPES
import type { typesUser } from "@/types/typesUser";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (!authToken) {
    // Redirect to login page or show an error
    // For now, we'll just return null
    return null;
  }

  const serverUserData = await getUser() as typesUser;

  return (
    <>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          <HeaderProtected serverUserData={serverUserData} authToken={authToken} />
          {children}
        </ThemeProvider>
    </>
  );
}