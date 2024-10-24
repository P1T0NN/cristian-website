// COMPONENTS
import { HeaderUnprotected } from "@/components/ui/header/header_unprotected";
import { RegisterContent } from "@/components/(pages)/(unprotected)/(auth)/register/register-content";

export default function RegisterPage() {
    return (
        <main>
            <HeaderUnprotected />
            
            <RegisterContent />
        </main>
    )
}