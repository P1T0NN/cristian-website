'use client'

// REACTJS IMPORTS
import { Suspense } from 'react';

// COMPONENTS
import { HeaderUnprotected } from "@/components/ui/header/header_unprotected";
import { ResetPasswordContent } from "@/components/(pages)/(unprotected)/(auth)/reset_password/reset-password-content";

export default function ResetPasswordPage() {
    return (
        <main>
            <HeaderUnprotected />

            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordContent />
            </Suspense>
        </main>
    )
}