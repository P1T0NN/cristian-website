// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlayerItem } from './player-item';
import { JoinTeamButton } from "./join-team-button";
import { AddFriendButton } from './add-friend-button';
import { BlockSpotsButton } from './block-spots-button';

// ACTIONS
import { serverFetchCurrentUserMatchAdmin } from '@/actions/functions/data/server/server_fetchCurrentUserMatchAdmin';

// UTILS
import { getTeamStatus } from '@/utils/getMaxPlayers';

// TYPES
import type { typesUser } from "@/types/typesUser";
import type { typesMatch } from '@/types/typesMatch';

type PlayerListProps = {
    players: typesUser[];
    currentUserId: string;
    matchId: string;
    authToken: string;
    isUserInMatch: boolean;
    isAdmin: boolean;
    match: typesMatch;
};

export const PlayerList = async ({ 
    players, 
    currentUserId, 
    matchId, 
    authToken, 
    isUserInMatch,
    isAdmin,
    match,
}: PlayerListProps) => {
    const t = await getTranslations('MatchPage');

    const serverCurrentUserMatchAdmin = await serverFetchCurrentUserMatchAdmin(matchId);
    const currentUserMatchAdmin = serverCurrentUserMatchAdmin.data as boolean;

    const { maxPlayers, currentPlayers, isFull, blockedSpots } = getTeamStatus(players, match.match_type, match.block_spots_team1, match.block_spots_team2);

    // We have to add this, because if we dont and we make player has_paid to true or any payment action, player will be moved from his current index position in team to the bottom
    // because of react rerender when using .map in here: {isDefaultTeam && players?.map((player) => (
    const sortedPlayers = players.sort((a, b) => (a.id).localeCompare(b.id));

    const currentUserPlayer = players.find(player => player.id === currentUserId);
    const canAddFriend = (isUserInMatch || isAdmin) && 
                         !isFull && 
                         (isAdmin || !currentUserPlayer || !currentUserPlayer.matchPlayer?.has_added_friend);

    return (
        <Card>
            <CardHeader className="flex flex-col">
                <div className="flex w-full justify-between items-center">
                    <div className="flex flex-col space-y-1">
                        <CardTitle>{t('players')}</CardTitle>
                        <CardDescription className='flex flex-col space-y-1'>
                            {t('players')} {currentPlayers}/{maxPlayers}
                            {blockedSpots > 0 && (
                                <span className="text-muted-foreground text-red-500">
                                    {isAdmin 
                                        ? t('blockedSpotsAdmin', { count: blockedSpots })
                                        : t('blockedSpotsUser', { count: blockedSpots })
                                    }
                                </span>
                            )}
                        </CardDescription>
                    </div>
                    {!isUserInMatch && currentPlayers < maxPlayers && (
                        <div className="mt-4">
                            <JoinTeamButton
                                teamNumber={0}
                                matchId={matchId}
                                currentUserId={currentUserId}
                                authToken={authToken}
                            />
                        </div>
                    )}
                </div>

                {canAddFriend && (
                    <div className="mt-4">
                        <AddFriendButton
                            matchId={matchId}
                            teamNumber={0}
                            authToken={authToken}
                            isAdmin={isAdmin}
                        />
                    </div>
                )}

                {isAdmin && (
                    <div>
                        <BlockSpotsButton
                            authToken={authToken}
                            matchId={matchId}
                            teamNumber={1}
                        />
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {sortedPlayers.map((player) => (
                        <PlayerItem
                            key={player.id}
                            player={player}
                            isCurrentUser={player.id === currentUserId}
                            teamNumber={0}
                            matchId={matchId}
                            isAdmin={isAdmin}
                            authToken={authToken}
                            currentUserMatchAdmin={currentUserMatchAdmin}
                            isUserInMatch={isUserInMatch}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};