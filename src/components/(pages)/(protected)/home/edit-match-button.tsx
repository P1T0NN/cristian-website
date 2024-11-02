"use client"

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Button } from "@/components/ui/button";

type EditMatchButtonProps = {
    matchId: string;
}

export const EditMatchButton = ({
    matchId
}: EditMatchButtonProps) => {
    const t = useTranslations("MatchPage");
    const router = useRouter();

    const handleEditMatch = () => {
        router.push(`${PAGE_ENDPOINTS.EDIT_MATCH_PAGE}/${matchId}`);
    };

    return (
        <Button 
            className="w-full bg-blue-500 hover:bg-blue-500/80"
            onClick={handleEditMatch}
        >
            {t('editMatch')}
        </Button>
    )
}