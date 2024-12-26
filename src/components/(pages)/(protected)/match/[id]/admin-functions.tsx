// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SortTeamsButton } from "./sort-teams-button";
import { DeleteMatchButton } from './delete-match-button';
import { FinishMatchButton } from './finish-match-button';
import { EditMatchButton } from './edit-match-button';

// ACTIONS
import { getUser } from "@/actions/auth/verifyAuth";
import { fetchMatch } from "@/actions/match/fetchMatch";

// TYPES
import type { typesUser } from "@/types/typesUser";
import type { typesMatch } from "@/types/typesMatch";

type AdminFunctionsProps = {
    matchIdFromParams: string;
}

export const AdminFunctions = async ({ 
    matchIdFromParams,
}: AdminFunctionsProps) => {
    const t = await getTranslations("MatchPage");

    const currentUserData = await getUser() as typesUser;

    const serverMatchData = await fetchMatch(matchIdFromParams);
    const match = serverMatchData.data?.match as typesMatch;

    return (
        <>
            {currentUserData.isAdmin && (
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>{t('adminFunctions')}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="flex flex-wrap justify-center gap-4">
                        {!match.has_teams && (
                            <SortTeamsButton matchIdFromParams={matchIdFromParams} />
                        )}

                        <FinishMatchButton matchIdFromParams={matchIdFromParams} />

                        <EditMatchButton matchId={matchIdFromParams}/>

                        <DeleteMatchButton matchIdFromParams={matchIdFromParams} />
                    </CardContent>
                </Card>
            )}
        </>
    )
}