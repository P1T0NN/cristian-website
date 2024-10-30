'use client'

// REACTJS IMPORTS
import { Suspense } from 'react';

// COMPONENTS
import { ResetPasswordContent } from "@/components/(pages)/(unprotected)/(auth)/reset_password/reset-password-content";

export default function ResetPasswordPage() {
    return (
        <main>
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordContent />
            </Suspense>
        </main>
    )
}