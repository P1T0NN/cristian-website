// COMPONENTS
import { HeaderUnprotected } from "@/components/ui/header/header_unprotected";
import { VerifyEmailContent } from "@/components/(pages)/(unprotected)/(auth)/verify_email/verify-email-content";

export default function VerifyEmailPage() {
    return (
        <main>
            <HeaderUnprotected />

            <VerifyEmailContent />
        </main>
    )
}