// NEXTJS IMPORTS
import Link from "next/link";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// ACTIONS
import { serverFetchMyActiveMatchesCount } from "@/actions/functions/data/server/server_fetchMyActiveMatchesCount";

// COMPONENTS
import { Skeleton } from "@/components/ui/skeleton";

type MyActiveMatchesProps = {
    currentUserId: string;
}

export const MyActiveMatches = async ({ currentUserId }: MyActiveMatchesProps) => {
    const t = await getTranslations("HomePage");

    const serverActiveMatchesData = await serverFetchMyActiveMatchesCount(currentUserId);
    const activeMatchesCount = serverActiveMatchesData.data as number;

    return (
        <Link href={PAGE_ENDPOINTS.ACTIVE_MATCHES} className="group">
            <div className="flex items-center space-x-2 p-2 rounded-md transition-colors duration-200 ease-in-out group-hover:bg-muted/50">
                <span className="text-sm font-medium group-hover:underline">{t('upcoming')}</span>
                {activeMatchesCount !== null ? (
                    <span className="bg-muted px-2 py-0.5 rounded text-sm font-semibold">{activeMatchesCount}</span>
                ) : (
                    <Skeleton className="h-6 w-8" />
                )}
            </div>
        </Link>
    );
};