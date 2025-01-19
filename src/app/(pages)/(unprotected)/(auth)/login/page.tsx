"use client"

// REACTJS IMPORTS
import { useEffect } from 'react';

// LIBRARIES
import { useQuery } from '@tanstack/react-query';

// COMPONENTS
import { LoginContent } from '@/features/auth/components/(auth)/login/login-content';

async function deleteAuthCookies() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return response.json();
}

export default function LoginPage() {
    const { refetch } = useQuery({
        queryKey: ['deleteAuthCookies'],
        queryFn: deleteAuthCookies,
        enabled: false, // This prevents the query from running automatically
    });

    useEffect(() => {
        refetch(); // This will run the query when the component mounts
    }, [refetch]);

    return (
        <main>
            <LoginContent />
        </main>
    )
}