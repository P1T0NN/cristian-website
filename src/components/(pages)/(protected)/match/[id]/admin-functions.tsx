// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SortTeamsButton } from "./sort-teams-button";
import { DeleteMatchButton } from './delete-match-button';
import { FinishMatchButton } from './finish-match-button';
import { EditMatchButton } from './edit-match-button';

type AdminFunctionsProps = {
    matchId: string;
    authToken: string;
    hasTeams: boolean;
}

export const AdminFunctions = async ({ 
    matchId, 
    authToken,
    hasTeams
}: AdminFunctionsProps) => {
    const t = await getTranslations("MatchPage");

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{t('adminFunctions')}</CardTitle>
            </CardHeader>
            
            <CardContent className="flex flex-wrap justify-center gap-4">
                {!hasTeams && (
                    <SortTeamsButton authToken={authToken} matchId={matchId} />
                )}

                <FinishMatchButton authToken={authToken} matchId={matchId} />

                <EditMatchButton matchId={matchId}/>

                <DeleteMatchButton authToken={authToken} matchId={matchId} />
            </CardContent>
        </Card>
    )
}