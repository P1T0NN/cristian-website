// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { DisplayActiveMatches } from "@/components/(pages)/(protected)/active_matches/display-active-matches";

// SERVER ACTIONS
import { getUser } from "@/actions/actions/auth/verifyAuth";

// TYPES
import { typesUser } from "@/types/typesUser";

export default async function ActiveMatchesPage() {
    const t = await getTranslations('ActiveMatchesPage');

    const serverUserData = await getUser() as typesUser;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{t('activeMatches')}</h1>
            <DisplayActiveMatches currentUserId={serverUserData.id} />
        </div>
    )
}