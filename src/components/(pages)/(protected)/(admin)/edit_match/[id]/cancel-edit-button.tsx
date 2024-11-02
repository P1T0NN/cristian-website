"use client"

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Button } from "@/components/ui/button"

export const CancelEditButton = () => {
    const t = useTranslations("EditMatchPage");
    const router = useRouter();

    const handleCancelButton = () => {
        router.push(PAGE_ENDPOINTS.HOME_PAGE);
    }

    return (
        <Button 
            variant="outline" 
            className="w-full"
            onClick={handleCancelButton}
        >
            {t('cancel')}
        </Button>
)
}