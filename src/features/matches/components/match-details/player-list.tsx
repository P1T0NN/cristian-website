// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { PlayerItem } from './player-item';
import { JoinTeamButton } from './join-team-button';
import { AddFriendButton } from './add-friend-button';
import { BlockSpotsButton } from './block-spots-button';

// ACTIONS
import { getUser } from '@/features/auth/actions/verifyAuth';

// UTILS
import { getTeamStatus } from '@/shared/utils/getMaxPlayers';
import { isRegularPlayer, hasAddedFriend } from '@/features/players/utils/playerUtils';

// TYPES
import type { typesUser } from '@/features/players/types/typesPlayer';
import type { typesMatch } from '../../types/typesMatch';
import type { typesMatchWithPlayers } from '../../types/typesMatchWithPlayers';

type PlayerListProps = {
    players: typesMatchWithPlayers['players'];
    matchIdFromParams: string;
    match: typesMatch;
};

export const PlayerList = async ({ 
    players, 
    matchIdFromParams, 
    match,
}: PlayerListProps) => {
    const [t, currentUserData] = await Promise.all([
        getTranslations('MatchPage'),
        getUser() as Promise<typesUser>
    ]);

    const actualPlayers = players.map(wrapper => wrapper.player);

    const { maxPlayers, currentPlayers, isFull, blockedSpots } = getTeamStatus(
        actualPlayers, 
        match.match_type, 
        match.block_spots_team1, 
        match.block_spots_team2
    );

    // Sort by id for consistent ordering
    const sortedPlayers = [...players].sort((a, b) => 
        a.player.id.localeCompare(b.player.id)
    );

    const isUserInMatch = players.some(wrapper => 
        isRegularPlayer(wrapper.player) && wrapper.player.user.id === currentUserData.id
    );

    const currentUserPlayer = actualPlayers.find(player => 
        isRegularPlayer(player) && player.user.id === currentUserData.id
    );

    const canAddFriend = (isUserInMatch || currentUserData.isAdmin) && 
                         !isFull && 
                         (currentUserData.isAdmin || !currentUserPlayer || !hasAddedFriend(currentUserPlayer));

    // This is passed to PlayerItem and onto PlayerActions so we can see when user has_match_admin to true, he can see for everyone
    // payment options
    const hasMatchAdminPlayer = players.some(wrapper => 
        wrapper.player.matchPlayer?.has_match_admin && 
        wrapper.player.matchPlayer?.userId === currentUserData.id
    );

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
                                    {currentUserData.isAdmin 
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
                                matchIdFromParams={matchIdFromParams}
                            />
                        </div>
                    )}
                </div>

                {canAddFriend && (
                    <div className="mt-4">
                        <AddFriendButton
                            matchIdFromParams={matchIdFromParams}
                            teamNumber={0}
                            isAdmin={currentUserData.isAdmin}
                        />
                    </div>
                )}

                {currentUserData.isAdmin && (
                    <div>
                        <BlockSpotsButton
                            matchIdFromParams={matchIdFromParams}
                            teamNumber={1}
                        />
                    </div>
                )}
            </CardHeader>

            <CardContent>
                <div className="space-y-2">
                    {sortedPlayers.map(({ player }) => (
                        <PlayerItem
                            key={player.id}
                            player={player}
                            teamNumber={0}
                            matchIdFromParams={matchIdFromParams}
                            isUserInMatch={isUserInMatch}
                            userHasMatchAdmin={hasMatchAdminPlayer}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};