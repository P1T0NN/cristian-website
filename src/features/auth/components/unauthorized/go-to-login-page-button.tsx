"use client"

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";
import { authClient } from '@/features/auth/auth-client';

// CONFIG
import { PUBLIC_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";

export const GoToLoginPageButton = () => {
    const t = useTranslations("UnauthorizedPage");

    const router = useRouter();

    const handleGoToLoginPage = async () => {
        await authClient.signOut();
        router.replace(PUBLIC_PAGE_ENDPOINTS.LOGIN_PAGE);
    }

    return (
        <Button variant="outline" onClick={handleGoToLoginPage}>
            {t('goToHomepage')}
        </Button>
    )
}