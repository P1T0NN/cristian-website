// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerItem } from "./player-item";
import { JoinTeamButton } from "./join-team-button";
import { AddFriendButton } from "./add-friend-button";

// ACTIONS
import { serverFetchCurrentUserMatchAdmin } from "@/actions/functions/data/server/server_fetchCurrentUserMatchAdmin";

// TYPES
import type { typesUser } from "@/types/typesUser";

type TeamCardProps = {
    teamName: string;
    players: typesUser[] | undefined;
    teamNumber: 1 | 2;
    currentUserId: string;
    userTeamNumber: number | null;
    matchId: string;
    matchType: string;
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
    matchType,
    isAdmin,
    authToken,
    isUserInMatch
}: TeamCardProps) => {
    const t = await getTranslations("MatchPage");

    const serverCurrentUserMatchAdmin = await serverFetchCurrentUserMatchAdmin(matchId);
    const currentUserMatchAdmin = serverCurrentUserMatchAdmin.data as boolean;

    const getMaxPlayers = (type: string) => {
        switch (type) {
            case 'F7':
                return 7;
            case 'F8':
                return 8;
            case 'F11':
                return 11;
            default:
                return 11; // Default to 11 if matchType is not recognized
        }
    };

    const isDefaultTeam = teamName === "Equipo 1" || teamName === "Equipo 2";
    const maxPlayers = getMaxPlayers(matchType);
    const currentPlayers = isDefaultTeam ? (players?.length ?? 0) : maxPlayers;
    const isFull = isDefaultTeam ? currentPlayers >= maxPlayers : true;

    // We have to add this, because if we dont and we make player has_paid to true or any payment action, player will be moved from his current index position in team to the bottom
    // because of react rerender when using .map in here: {isDefaultTeam && players?.map((player) => (
    const sortedPlayers = players?.sort((a, b) => (a.id).localeCompare(b.id)) || [];

    const currentUserPlayer = sortedPlayers.find(player => player.id === currentUserId);
    const canAddFriend = (isUserInMatch || isAdmin) && 
                         !isFull && 
                         (isAdmin || userTeamNumber === teamNumber) &&
                         (!currentUserPlayer || !currentUserPlayer.matchPlayer?.has_added_friend);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{teamName}</CardTitle>
                <CardDescription>
                    {t('players')} {currentPlayers}/{maxPlayers}
                    {!isDefaultTeam && (
                        <span className="block text-red-500 mt-1">{t('teamIsFull')}</span>
                    )}
                </CardDescription>
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
                    />
                ))}

                {isDefaultTeam && !isFull && !userTeamNumber && (
                    <JoinTeamButton
                        teamNumber={teamNumber}
                        matchId={matchId}
                        currentUserId={currentUserId}
                        authToken={authToken}
                    />
                )}

                {isDefaultTeam && canAddFriend && (
                    <AddFriendButton
                        matchId={matchId}
                        teamNumber={teamNumber}
                        authToken={authToken}
                        isAdmin={isAdmin}
                    />
                )}
            </CardContent>
        </Card>
    )
}