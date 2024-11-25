// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";
import { EditMatchInstructionsDialog } from "./edit-match-instructions-dialog";

// SERVER ACTIONS
import { getUser } from "@/actions/actions/auth/verifyAuth";

// ACTIONS
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

    const serverUserData = await getUser() as typesUser; 

    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="whitespace-pre-wrap break-words">
                            {instructions || t('noInstructions')}
                        </div>
                    </div>
                    {serverUserData.isAdmin && (
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