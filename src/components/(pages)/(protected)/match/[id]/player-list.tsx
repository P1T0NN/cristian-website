// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlayerItem } from './player-item';
import { JoinTeamButton } from "./join-team-button";
import { AddFriendButton } from './add-friend-button';

// ACTIONS
import { serverFetchCurrentUserMatchAdmin } from '@/actions/functions/data/server/server_fetchCurrentUserMatchAdmin';

// TYPES
import type { typesUser } from "@/types/typesUser";

type PlayerListProps = {
    players: typesUser[];
    currentUserId: string;
    matchId: string;
    authToken: string;
    isUserInMatch: boolean;
    isAdmin: boolean;
    matchType: string;
};

export const PlayerList = async ({ 
    players, 
    currentUserId, 
    matchId, 
    authToken, 
    isUserInMatch,
    isAdmin,
    matchType,
}: PlayerListProps) => {
    const t = await getTranslations('MatchPage');

    const serverCurrentUserMatchAdmin = await serverFetchCurrentUserMatchAdmin(matchId);
    const currentUserMatchAdmin = serverCurrentUserMatchAdmin.data as boolean;

    // We have to add this, because if we dont and we make player has_paid to true or any payment action, player will be moved from his current index position in team to the bottom
    // because of react rerender when using .map in here: {isDefaultTeam && players?.map((player) => (
    const sortedPlayers = players.sort((a, b) => (a.id).localeCompare(b.id));

    const getMaxPlayers = (type: string) => {
        switch (type) {
            case 'F7':
                return 14;
            case 'F8':
                return 16;
            case 'F11':
                return 22;
            default:
                return 22;
        }
    };

    const maxPlayers = getMaxPlayers(matchType);
    const currentPlayers = players.length;

    const currentUserPlayer = players.find(player => player.id === currentUserId);
    const canAddFriend = (isUserInMatch || isAdmin) && 
                         currentPlayers < maxPlayers && 
                         (isAdmin || !currentUserPlayer || !currentUserPlayer.matchPlayer?.has_added_friend);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('players')}</CardTitle>
                <CardDescription>
                    {t('players')} {currentPlayers}/{maxPlayers}
                </CardDescription>
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
            </CardContent>
        </Card>
    );
};