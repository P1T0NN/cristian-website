// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";
import { EditMatchInstructionsDialog } from "./edit-match-instructions-dialog";

// ACTIONS
import { getUser } from "@/actions/auth/verifyAuth";
import { fetchMatch } from "@/actions/match/fetchMatch";

// TYPES
import type { typesMatch } from "@/types/typesMatch";
import type { typesUser } from "@/types/typesUser";

type MatchInstructionsProps = {
    matchIdFromParams: string;
}

export const MatchInstructions = async ({
    matchIdFromParams
}: MatchInstructionsProps) => {
    const t = await getTranslations("MatchPage");

    const serverUserData = await getUser() as typesUser; 

    const serverMatchData = await fetchMatch(matchIdFromParams);
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