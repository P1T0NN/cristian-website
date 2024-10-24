// COMPONENTS
import { HeaderUnprotected } from "@/components/ui/header/header_unprotected";
import { ForgotPasswordContent } from "@/components/(pages)/(unprotected)/(auth)/forgot_password/forgot-password-content";

export default function ForgotPasswordPage() {
    return (
        <main>
            <HeaderUnprotected />

            <ForgotPasswordContent />
        </main>
    )
}