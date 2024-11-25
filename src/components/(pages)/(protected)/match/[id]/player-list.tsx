// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlayerItem } from './player-item';
import { JoinTeamButton } from "./join-team-button";

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

    const sortedPlayers = players.sort((a, b) => (a.id).localeCompare(b.id));

    const getMaxPlayers = (type: string) => {
        switch (type) {
            case 'F7':
                return 14; // 7 players per team * 2 teams
            case 'F8':
                return 16; // 8 players per team * 2 teams
            case 'F11':
                return 22; // 11 players per team * 2 teams
            default:
                return 22; // Default to 22 if matchType is not recognized
        }
    };

    const maxPlayers = getMaxPlayers(matchType);
    const currentPlayers = players.length;

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
            </CardContent>
        </Card>
    );
};