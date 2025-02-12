// NEXTJS IMPORTS
import Link from "next/link";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// CONFIG
import { ADMIN_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";

// LUCIDE ICONS
import { Edit } from "lucide-react";

interface EditMatchButtonProps {
    matchIdFromParams: string;
}

export const EditMatchButton = async ({
    matchIdFromParams
}: EditMatchButtonProps) => {
    const t = await getTranslations('MatchPage');

    return (
        <Button 
            variant="outline"
            size="sm"
            className="inline-flex items-center"
            asChild
        >
            <Link href={`${ADMIN_PAGE_ENDPOINTS.EDIT_MATCH_PAGE}/${matchIdFromParams}`}>
                <Edit className="w-4 h-4 mr-2" />
                {t('editMatch')}
            </Link>
        </Button>
    )
}
