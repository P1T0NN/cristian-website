'use client'

// REACTJS IMPORTS
import { Suspense } from 'react';

// COMPONENTS
import { VerifyEmailContent } from "@/components/(pages)/(unprotected)/(auth)/verify_email/verify-email-content";

export default function VerifyEmailPage() {
    return (
        <main>
            <Suspense fallback={<div>Loading...</div>}>
                <VerifyEmailContent />
            </Suspense>
        </main>
    )
}