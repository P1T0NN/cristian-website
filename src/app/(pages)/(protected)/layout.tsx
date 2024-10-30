// NEXTJS IMPORTS
import { cookies } from "next/headers";

// PROVIDERS
import { ThemeProvider } from "@/providers/theme-provider";

// COMPONENTS
import { HeaderProtected } from "@/components/ui/header/header_protected";

// ACTIONS
import { server_fetchUserData } from "@/actions/functions/data/server/server_fetchUserData";

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

  const result = await server_fetchUserData();
  const userData: typesUser | undefined = result.success ? (result.data as typesUser) : undefined;

  if (!userData) {
    // Handle the case where user data couldn't be fetched
    // For now, we'll just return null
    return null;
  }

  return (
    <>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          <HeaderProtected serverUserData={userData} authToken={authToken} />
          {children}
        </ThemeProvider>
    </>
  );
}