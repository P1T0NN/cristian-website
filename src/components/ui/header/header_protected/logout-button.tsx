'use client'

// REACTJS IMPORTS
import { useState } from 'react';

// NEXTJS IMPORTS
import { useRouter } from 'next/navigation';

// CONFIG
import { PUBLIC_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// SERVER ACTIONS
import { logoutUser } from '@/actions/server_actions/auth/logoutUser';

// LUCIDE ICONS
import { LogOut } from "lucide-react";

export const LogoutButton = () => {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        const result = await logoutUser();
        setIsLoggingOut(false);

        if (result.success) {
            toast.success(result.message);
            router.push(PUBLIC_PAGE_ENDPOINTS.LOGIN_PAGE);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut className="mr-2" /> {isLoggingOut ? 'Logging out...' : 'Logout'}
        </DropdownMenuItem>
    );
};