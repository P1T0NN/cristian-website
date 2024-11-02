// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";
import { EditMatchInstructionsDialog } from "./edit-match-instructions-dialog";

// ACTIONS
import { server_fetchUserData } from "@/actions/functions/data/server/server_fetchUserData";
import { typesUser } from "@/types/typesUser";

type MatchInstructionsProps = {
    instructions: string
    matchId: string
    authToken: string
}

export const MatchInstructions = async ({
    instructions,
    matchId,
    authToken,
}: MatchInstructionsProps) => {
    const t = await getTranslations("MatchPage");

    const serverUserData = await server_fetchUserData();
    const userData = serverUserData.data as typesUser;

    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            {instructions || t('noInstructions')}
                        </div>
                    </div>
                    {userData.isAdmin && (
                        <EditMatchInstructionsDialog
                            instructions={instructions}
                            matchId={matchId}
                            authToken={authToken}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};