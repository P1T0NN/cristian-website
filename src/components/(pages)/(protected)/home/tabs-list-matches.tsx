// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

// ACTIONS
import { getUser } from "@/actions/auth/verifyAuth";
import { fetchMyActiveMatchesCount } from "@/actions/match/fetchMyActiveMatchesCount";

// TYPES
import type { typesUser } from "@/types/typesUser";

export const TabsListMatches = async () => {
    const [t, currentUserData] = await Promise.all([
            getTranslations("HomePage"),
            getUser() as Promise<typesUser>
    ]);
    
    // Do not put it in promise.all because we need currentUserData first!
    const myMatchesCountData = await fetchMyActiveMatchesCount(currentUserData.id);
    const count = myMatchesCountData.success && myMatchesCountData.data ? myMatchesCountData.data.count : 0;

    return (
        <TabsList className={`grid w-full ${currentUserData.isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="all-matches">{t('allMatches')}</TabsTrigger>

            <TabsTrigger value="my-matches">{t('myMatches')} ({count})</TabsTrigger>

            {currentUserData.isAdmin && (
                <TabsTrigger value="old-matches">{t('pastMatches')}</TabsTrigger>
            )}
        </TabsList>
    )
}