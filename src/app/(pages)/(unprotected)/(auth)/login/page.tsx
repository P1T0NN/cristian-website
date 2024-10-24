// COMPONENTS
import { HeaderUnprotected } from "@/components/ui/header/header_unprotected";
import { LoginContent } from "@/components/(pages)/(unprotected)/(auth)/login/login-content";

export default function LoginPage() {
    return (
        <main>
            <HeaderUnprotected />

            <LoginContent />
        </main>
    )
}