// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteMatchButton } from './delete-match-button';
import { FinishMatchButton } from './finish-match-button';
import { EditMatchButton } from './edit-match-button';

type AdminFunctionsProps = {
    matchId: string
    authToken: string
}

export const AdminFunctions = async ({ 
    matchId, 
    authToken 
}: AdminFunctionsProps) => {
    const t = await getTranslations("MatchPage");

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{t('adminFunctions')}</CardTitle>
            </CardHeader>
            
            <CardContent className="flex flex-wrap gap-4">
                <FinishMatchButton authToken={authToken} matchId={matchId} />

                <EditMatchButton matchId={matchId}/>

                <DeleteMatchButton authToken={authToken} matchId={matchId} />
            </CardContent>
        </Card>
    )
}