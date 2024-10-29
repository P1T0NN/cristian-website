'use client';

// REACTJS IMPORTS
import { useState, useRef } from 'react';

// NEXTJS IMPORTS
import { useSearchParams, useRouter } from 'next/navigation';

// LIBRARIES
import { useTranslations } from 'next-intl';

// CONFIG
import { PAGE_ENDPOINTS } from '@/config';

// COMPONENTS
import { toast } from 'sonner';

export function VerifyEmailContent() {
    const t = useTranslations('VerifyEmail')
    const searchParams = useSearchParams()
    const router = useRouter()
  
    const verificationAttempted = useRef(false)
    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  
    if (!verificationAttempted.current) {
        verificationAttempted.current = true
        const token = searchParams.get('token')
    
        if (!token) {
            setVerificationStatus('error')
            toast.error(t('invalidLink'))
        } else {
            verifyEmail(token)
        }
    }
  
    async function verifyEmail(token: string) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/verify_email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            })
    
            const data = await response.json()
    
            if (response.ok) {
                setVerificationStatus('success')
                toast.success(data.message)
                setTimeout(() => router.push(PAGE_ENDPOINTS.LOGIN_PAGE), 3000)
            } else {
                setVerificationStatus('error')
                toast.error(data.message)
            }
        } catch {
            setVerificationStatus('error')
            toast.error(t('unexpectedError'))
        }
    }
  
    if (verificationStatus === 'loading') {
        return <h1 className='font-bold text-2xl text-center pt-16'>{t('verifyingEmail')}</h1>
    }
  
    if (verificationStatus === 'success') {
        return <h1 className='text-green-500 font-bold text-2xl text-center pt-16'>{t('verificationSuccess')}</h1>
    }
  
    return <h1 className='text-red-500 font-bold text-2xl text-center pt-16'>{t('verificationError')}</h1>
}