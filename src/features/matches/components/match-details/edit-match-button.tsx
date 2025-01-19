"use client"

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";

// CONFIG
import { ADMIN_PAGE_ENDPOINTS } from "@/config";

// LUCIDE ICONS
import { Edit } from "lucide-react";

type EditMatchButtonProps = {
    matchId: string;
}

export const EditMatchButton = ({
    matchId
}: EditMatchButtonProps) => {
    const t = useTranslations("MatchPage");
    const router = useRouter();

    const handleEditMatch = () => {
        router.push(`${ADMIN_PAGE_ENDPOINTS.EDIT_MATCH_PAGE}/${matchId}`)
    };

    return (
        <Button onClick={handleEditMatch} variant="outline" className="w-full sm:w-auto">
            <Edit className="mr-2 h-4 w-4" /> {t('editMatch')}
        </Button>
    )
}