// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerItem } from "./player-item";
import { JoinTeamButton } from "./join-team-button";
import { AddFriendButton } from "./add-friend-button";
import { BlockSpotsButton } from "./block-spots-button";

// ACTIONS
import { serverFetchCurrentUserMatchAdmin } from "@/actions/functions/data/server/server_fetchCurrentUserMatchAdmin";

// UTILS
import { getTeamStatus } from "@/utils/getMaxPlayers";

// TYPES
import type { typesUser } from "@/types/typesUser";
import type { typesMatch } from "@/types/typesMatch";

type TeamCardProps = {
    teamName: string;
    players: typesUser[] | undefined;
    teamNumber: 1 | 2;
    currentUserId: string;
    userTeamNumber: number | null;
    matchId: string;
    match: typesMatch;
    isAdmin: boolean;
    authToken: string;
    isUserInMatch: boolean;
}

export const TeamCard = async ({
    teamName,
    players,
    teamNumber,
    currentUserId,
    userTeamNumber,
    matchId,
    match,
    isAdmin,
    authToken,
    isUserInMatch
}: TeamCardProps) => {
    const t = await getTranslations("MatchPage");

    const serverCurrentUserMatchAdmin = await serverFetchCurrentUserMatchAdmin(matchId);
    const currentUserMatchAdmin = serverCurrentUserMatchAdmin.data as boolean;

    const { isDefaultTeam, maxPlayers, currentPlayers, isFull, blockedSpots } = getTeamStatus(players, match.match_type, match.block_spots_team1, match.block_spots_team2, teamName);

    // We have to add this, because if we dont and we make player has_paid to true or any payment action, player will be moved from his current index position in team to the bottom
    // because of react rerender when using .map in here: {isDefaultTeam && players?.map((player) => (
    const sortedPlayers = players?.sort((a, b) => (a.id).localeCompare(b.id)) || [];

    const currentUserPlayer = sortedPlayers.find(player => player.id === currentUserId);
    const canAddFriend = (isUserInMatch || isAdmin) && 
                         !isFull && 
                         (isAdmin || userTeamNumber === teamNumber) &&
                         (isAdmin || !currentUserPlayer || !currentUserPlayer.matchPlayer?.has_added_friend);

    return (
        <Card>
            <CardHeader>
                <div className="flex w-full justify-between items-center">
                    <div className="flex flex-col space-y-1">
                        <CardTitle>{teamName}</CardTitle>
                        <CardDescription className="flex flex-col">
                            {t('players')} {currentPlayers}/{maxPlayers}
                            {isDefaultTeam && blockedSpots > 0 && (
                                <span className="text-muted-foreground text-red-500">
                                    {isAdmin 
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
                            teamNumber={teamNumber}
                            matchId={matchId}
                            currentUserId={currentUserId}
                            authToken={authToken}
                        />
                    )}
                </div>
                {isDefaultTeam && canAddFriend && (
                    <AddFriendButton
                        matchId={matchId}
                        teamNumber={teamNumber}
                        authToken={authToken}
                        isAdmin={isAdmin}
                    />
                )}

                {isAdmin && (
                    <div>
                        <BlockSpotsButton
                            authToken={authToken}
                            matchId={matchId}
                            teamNumber={teamNumber}
                        />
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-2">
                {isDefaultTeam && sortedPlayers.map((player) => (
                     <PlayerItem
                        key={player.id}
                        player={player}
                        isCurrentUser={player.id === currentUserId}
                        teamNumber={teamNumber}
                        matchId={matchId}
                        isAdmin={isAdmin}
                        authToken={authToken}
                        currentUserMatchAdmin={currentUserMatchAdmin}
                        isUserInMatch={isUserInMatch}
                        currentUserId={currentUserId}
                        isDefaultTeam={isDefaultTeam}
                    />
                ))}
            </CardContent>
        </Card>
    )
}