"use client"

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Button } from "@/components/ui/button";

type ViewMatchButtonProps = {
    matchId: string;
}

export const ViewMatchButton = ({
    matchId
}: ViewMatchButtonProps) => {
    const t = useTranslations("MatchPage");
    const router = useRouter();

    const handleViewMatch = () => {
        router.push(`${PAGE_ENDPOINTS.MATCH_PAGE}/${matchId}`);
    }

    return (
        <Button 
            className="w-full"
            onClick={handleViewMatch}
        >
            {t('viewMatch')}
        </Button>
    )
}