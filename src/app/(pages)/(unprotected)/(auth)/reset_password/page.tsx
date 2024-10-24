// COMPONENTS
import { HeaderUnprotected } from "@/components/ui/header/header_unprotected";
import { ResetPasswordContent } from "@/components/(pages)/(unprotected)/(auth)/reset_password/reset-password-content";

export default function ResetPasswordPage() {
    return (
        <main>
            <HeaderUnprotected />
            
            <ResetPasswordContent />
        </main>
    );
}