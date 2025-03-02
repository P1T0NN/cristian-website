"use client"

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";

export const GoToNewUserPage = () => {
    const t = useTranslations("UnauthorizedPage");

    const router = useRouter();

    const handleGoToLoginPage = async () => {
        router.replace(PROTECTED_PAGE_ENDPOINTS.NEW_USER_DETAILS_PAGE);
    }

    return (
        <Button variant="outline" onClick={handleGoToLoginPage}>
            {t('goToNewUserPage')}
        </Button>
    )
}