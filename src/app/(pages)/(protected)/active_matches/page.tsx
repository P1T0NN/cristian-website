// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { DisplayActiveMatches } from "@/components/(pages)/(protected)/active_matches/display-active-matches";

// ACTIONS
import { server_fetchUserData } from "@/actions/functions/data/server/server_fetchUserData";

// TYPES
import { typesUser } from "@/types/typesUser";

export default async function ActiveMatchesPage() {
    const t = await getTranslations('ActiveMatchesPage');

    const serverUserData = await server_fetchUserData();
    const userData = serverUserData.data as typesUser;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{t('activeMatches')}</h1>
            <DisplayActiveMatches currentUserId={userData.id} />
        </div>
    )
}