// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlayerItem } from './player-item';
import { JoinTeamButton } from "./join-team-button";
import { AddFriendButton } from './add-friend-button';
import { BlockSpotsButton } from './block-spots-button';

// ACTIONS
import { getUser } from '@/actions/auth/verifyAuth';

// UTILS
import { getTeamStatus } from '@/utils/getMaxPlayers';

// TYPES
import type { typesUser } from "@/types/typesUser";
import type { typesMatch } from '@/types/typesMatch';

type PlayerListProps = {
    players: typesUser[];
    matchIdFromParams: string;
    isUserInMatch: boolean;
    match: typesMatch;
};

export const PlayerList = async ({ 
    players, 
    matchIdFromParams, 
    isUserInMatch,
    match,
}: PlayerListProps) => {
    const [t, currentUserData] = await Promise.all([
        getTranslations('MatchPage'),
        getUser() as Promise<typesUser>
    ]);

    const { maxPlayers, currentPlayers, isFull, blockedSpots } = getTeamStatus(players, match.match_type, match.block_spots_team1, match.block_spots_team2);

    // We have to add this, because if we dont and we make player has_paid to true or any payment action, player will be moved from his current index position in team to the bottom
    // because of react rerender when using .map in here: {isDefaultTeam && players?.map((player) => (
    const sortedPlayers = players.sort((a, b) => (a.id).localeCompare(b.id));

    const currentUserPlayer = players.find(player => player.id === currentUserData.id);
    const canAddFriend = (isUserInMatch || currentUserData.isAdmin) && 
                         !isFull && 
                         (currentUserData.isAdmin || !currentUserPlayer || !currentUserPlayer.matchPlayer?.has_added_friend);

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
                        {/* Client component, so we have to pass additional prop isAdmin */}
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
                    {sortedPlayers.map((player) => (
                        <PlayerItem
                            key={player.id}
                            player={player}
                            teamNumber={0}
                            matchIdFromParams={matchIdFromParams}
                            isUserInMatch={isUserInMatch}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};