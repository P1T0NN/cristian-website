"use client"

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { ADMIN_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Button } from "@/components/ui/button";

export const AddMatchButton = () => {
    const router = useRouter();

    const t = useTranslations("Header");

    const handleRedirectToAddMatch = () => {
        router.push(ADMIN_PAGE_ENDPOINTS.ADD_MATCH_PAGE);
    }

    return (
        <Button
            className="font-bold rounded-lg w-[115px]"
            onClick={handleRedirectToAddMatch}
        >
            {t('newMatch')}
        </Button>
    )
}