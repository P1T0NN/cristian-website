// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerItem } from "./player-item";
import { JoinTeamButton } from "./join-team-button";
import { AddFriendButton } from "./add-friend-button";
import { BlockSpotsButton } from "./block-spots-button";

// ACTIONS
import { getUser } from "@/actions/auth/verifyAuth";
import { fetchMatch } from "@/actions/match/fetchMatch";

// UTILS
import { getTeamStatus } from "@/utils/getMaxPlayers";

// TYPES
import type { typesUser } from "@/types/typesUser";
import type { typesMatch } from "@/types/typesMatch";

type TeamTwoCardProps = {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
}

export const TeamTwoCard = async ({
    matchIdFromParams,
    teamNumber,
}: TeamTwoCardProps) => {
    const t = await getTranslations("MatchPage");

    const currentUserData = await getUser() as typesUser;

    const serverMatchData = await fetchMatch(matchIdFromParams);
    const match = serverMatchData.data?.match as typesMatch;

    const { isDefaultTeam, maxPlayers, currentPlayers, isFull, blockedSpots } = getTeamStatus(serverMatchData.data?.team2Players, match.match_type, match.block_spots_team1, match.block_spots_team2, match.team2_name);

    const allPlayers = [
        ...(serverMatchData.data?.team1Players || []),
        ...(serverMatchData.data?.team2Players || []),
        ...(serverMatchData.data?.unassignedPlayers || [])
    ];

    const isUserInMatch = allPlayers.some(player => player.id === currentUserData.id);

    const isUserInTeam = (players: typesUser[] | undefined) => {
        return players?.some(player => player.id === currentUserData.id) ?? false
    }
    const userTeamNumber = isUserInTeam(serverMatchData.data?.team1Players) 
        ? 1 
        : isUserInTeam(serverMatchData.data?.team2Players) 
            ? 2 
            : null

    // We have to add this, because if we dont and we make player has_paid to true or any payment action, player will be moved from his current index position in team to the bottom
    // because of react rerender when using .map in here: {isDefaultTeam && players?.map((player) => (
    const sortedPlayers = serverMatchData.data?.team2Players?.sort((a, b) => (a.id).localeCompare(b.id)) || [];

    const currentUserPlayer = sortedPlayers.find(player => player.id === currentUserData.id);
    const canAddFriend = (isUserInMatch || currentUserData.isAdmin) && 
                         !isFull && 
                         (currentUserData.isAdmin || userTeamNumber === teamNumber) &&
                         (currentUserData.isAdmin || !currentUserPlayer || !currentUserPlayer.matchPlayer?.has_added_friend);

    return (
        <Card>
            <CardHeader>
                <div className="flex w-full justify-between items-center">
                    <div className="flex flex-col space-y-1">
                        <CardTitle>{match.team1_name}</CardTitle>
                        <CardDescription className="flex flex-col">
                            {t('players')} {currentPlayers}/{maxPlayers}

                            {isDefaultTeam && blockedSpots > 0 && (
                                <span className="text-muted-foreground text-red-500">
                                    {currentUserData.isAdmin
                                        ? t('blockedSpotsAdmin', { count: blockedSpots })
                                        : t('blockedSpotsUser', { count: blockedSpots })
                                    }
                                </span>
                            )}

                            {!isDefaultTeam && (
                                <span className="block text-red-500 mt-1">{t('teamIsFull')}</span>
                            )}
                        </CardDescription>
                    </div>

                    {isDefaultTeam && !isFull && !userTeamNumber && (
                        <JoinTeamButton
                            matchIdFromParams={matchIdFromParams}
                            teamNumber={teamNumber}
                        />
                    )}
                </div>
                {isDefaultTeam && canAddFriend && (
                    // Client component, thats why we pass isAdmin
                    <AddFriendButton
                        matchIdFromParams={matchIdFromParams}
                        teamNumber={teamNumber}
                        isAdmin={currentUserData.isAdmin}
                    />
                )}

                {currentUserData.isAdmin && isDefaultTeam && (
                    <BlockSpotsButton
                        matchIdFromParams={matchIdFromParams}
                        teamNumber={teamNumber}
                    />
                )}
            </CardHeader>
            <CardContent className="space-y-2">
                {isDefaultTeam && sortedPlayers.map((player) => (
                    <PlayerItem
                        key={player.id}
                        player={player}
                        matchIdFromParams={matchIdFromParams}
                        teamNumber={teamNumber}
                        isUserInMatch={isUserInMatch}
                    />
                ))}
            </CardContent>
        </Card>
    )
}