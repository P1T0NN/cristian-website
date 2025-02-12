'use client'

// NEXTJS IMPORTS
import { useRouter } from 'next/navigation';

// LIBRARIES
import { authClient } from '@/features/auth/auth-client';

// CONFIG
import { PUBLIC_PAGE_ENDPOINTS } from '@/config';

// COMPONENTS
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu";

// LUCIDE ICONS
import { LogOut } from "lucide-react";

export const LogoutButton = () => {
    const router = useRouter();

    const handleLogout = async () => {
        await authClient.signOut();
        router.push(PUBLIC_PAGE_ENDPOINTS.LOGIN_PAGE);
    };

    return (
        <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2" /> Logout
        </DropdownMenuItem>
    );
};