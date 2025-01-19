// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent } from "@/shared/components/ui/card";
import { EditMatchInstructionsDialog } from "./edit-match-instructions-dialog";

// ACTIONS
import { getUser } from "@/features/auth/actions/verifyAuth";
import { fetchMatch } from "../../actions/fetchMatch";

// TYPES
import type { typesMatch } from "../../types/typesMatch";
import type { typesUser } from "@/features/players/types/typesPlayer";

type MatchInstructionsProps = {
    matchIdFromParams: string;
}

export const MatchInstructions = async ({
    matchIdFromParams
}: MatchInstructionsProps) => {
    const [t, serverUserData, serverMatchData] = await Promise.all([
        getTranslations("MatchPage"),
        getUser() as Promise<typesUser>,
        fetchMatch(matchIdFromParams)
    ]);
    
    const match = serverMatchData.data?.match as typesMatch;

    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="whitespace-pre-wrap break-words">
                            {match.match_instructions || t('noInstructions')}
                        </div>
                    </div>

                    {serverUserData.isAdmin && (
                        <EditMatchInstructionsDialog
                            matchIdFromParams={matchIdFromParams}
                            matchInstructions={match.match_instructions}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};