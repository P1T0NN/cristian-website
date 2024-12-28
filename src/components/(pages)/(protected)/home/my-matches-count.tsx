// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { TabsTrigger } from "@/components/ui/tabs";

// ACTIONS
import { getUser } from "@/actions/auth/verifyAuth";
import { fetchMyActiveMatchesCount } from "@/actions/match/fetchMyActiveMatchesCount";

// TYPES
import type { typesUser } from "@/types/typesUser";

export const MyMatchesCount = async () => {
    const [t, currentUserData] = await Promise.all([
        getTranslations("HomePage"),
        getUser() as Promise<typesUser>
    ]);

    const myMatchesCountData = await fetchMyActiveMatchesCount(currentUserData.id);
    const count = myMatchesCountData.success && myMatchesCountData.data ? myMatchesCountData.data.count : 0;

    return (
        <TabsTrigger value="my-matches">{t('myMatches')} ({count})</TabsTrigger>
    )
}