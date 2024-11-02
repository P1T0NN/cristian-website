// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerItem } from "./player-item";
import { JoinTeamButton } from "./join-team-button";

// TYPES
import type { typesUser } from "@/types/typesUser";

type TeamCardProps = {
    teamName: string
    players: typesUser[] | undefined
    teamNumber: 1 | 2
    currentUserId: string
    userTeamNumber: number | null
    matchId: string
    authToken: string
}

export const TeamCard = async ({
    teamName,
    players,
    teamNumber,
    currentUserId,
    userTeamNumber,
    matchId,
    authToken
}: TeamCardProps) => {
    const t = await getTranslations("MatchPage")

    return (
        <Card>
            <CardHeader>
                <CardTitle>{teamName}</CardTitle>
                <CardDescription>{t('players')} {players?.length ?? 0}/11</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {players?.map((player) => (
                    <PlayerItem
                        key={player.id}
                        player={player}
                        isCurrentUser={player.id === currentUserId}
                        teamNumber={teamNumber}
                        matchId={matchId}
                        authToken={authToken}
                    />
                ))}

                {(players?.length ?? 0) < 11 && !userTeamNumber && (
                    <JoinTeamButton
                        teamNumber={teamNumber}
                        matchId={matchId}
                        currentUserId={currentUserId}
                        authToken={authToken}
                    />
                )}
            </CardContent>
        </Card>
    )
}