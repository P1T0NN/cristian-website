// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { JoinTeamButton } from "./join-team-button";
import { AddFriendButton } from "./add-friend-button";
import { BlockSpotsButton } from "./block-spots-button";
import { PlayerItem } from "./player-item";

// ACTIONS
import { getUser } from "@/features/auth/actions/verifyAuth";
import { fetchMatch } from "../../actions/fetchMatch";

// UTILS
import { getTeamStatus } from "@/shared/utils/getMaxPlayers";
import { isRegularPlayer, hasAddedFriend } from "@/features/players/utils/playerUtils";

// TYPES
import type { typesUser } from "@/features/players/types/typesPlayer";
import type { typesMatch } from "../../types/typesMatch";

interface TeamCardProps {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
}

export const TeamCard = async ({
    matchIdFromParams,
    teamNumber,
}: TeamCardProps) => {
    const [t, currentUserData, serverMatchData] = await Promise.all([
        getTranslations("MatchPage"),
        getUser() as Promise<typesUser>,
        fetchMatch(matchIdFromParams)
    ]);
    
    const match = serverMatchData.data?.match as typesMatch;
    const teamName = teamNumber === 1 ? match.team1_name : match.team2_name;
    
    const teamPlayers = (serverMatchData.data?.players || [])
        .filter(wrapper => wrapper.team_number === teamNumber)
        .map(wrapper => wrapper.player)
        .sort((a, b) => a.id.localeCompare(b.id));

    const { isDefaultTeam, maxPlayers, currentPlayers, isFull, blockedSpots } = getTeamStatus(
        teamPlayers, 
        match.match_type, 
        match.block_spots_team1, 
        match.block_spots_team2, 
        teamName
    );

    const isUserInMatch = Boolean(serverMatchData.data?.players.some(wrapper => 
        isRegularPlayer(wrapper.player) && wrapper.player.user.id === currentUserData.id
    ));

    const userTeamNumber = serverMatchData.data?.players.find(wrapper => 
        isRegularPlayer(wrapper.player) && wrapper.player.user.id === currentUserData.id
    )?.team_number ?? null;

    const currentUserPlayer = teamPlayers.find(player => 
        isRegularPlayer(player) && player.user.id === currentUserData.id
    );

    const canAddFriend = (isUserInMatch || currentUserData.isAdmin) && 
                         !isFull && 
                         (currentUserData.isAdmin || userTeamNumber === teamNumber) &&
                         (currentUserData.isAdmin || !currentUserPlayer || !hasAddedFriend(currentUserPlayer));

    const hasMatchAdminPlayer = serverMatchData.data?.players.some(wrapper => 
        wrapper.player.matchPlayer?.has_match_admin && 
        wrapper.player.matchPlayer?.userId === currentUserData.id
    );

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
                {isDefaultTeam && teamPlayers.map((player) => (
                    <PlayerItem
                        key={player.id}
                        player={player}
                        matchIdFromParams={matchIdFromParams}
                        teamNumber={teamNumber}
                        isUserInMatch={isUserInMatch}
                        userHasMatchAdmin={hasMatchAdminPlayer as boolean} 
                    />
                ))}
            </CardContent>
        </Card>
    );
};