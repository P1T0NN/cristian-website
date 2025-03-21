"use client"

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Button } from "@/shared/components/ui/button"

export const CancelEditButton = () => {
    const t = useTranslations("EditMatchPage");
    const router = useRouter();

    const handleCancelButton = () => {
        router.push(PROTECTED_PAGE_ENDPOINTS.HOME_PAGE);
    }

    return (
        <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={handleCancelButton}
        >
            {t('cancel')}
        </Button>
    )
}