"use client"

// LIBRARIES
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// COMPONENTS
import { MatchLoadingSkeleton } from "./match-loading-skeleton";

// ACTIONS
import { client_fetchMatch } from "@/actions/functions/data/client/match/client_fetchMatch";
import { client_managePlayer } from "@/actions/functions/data/client/match/client_managePlayer";

// UTILS
import { formatDate, formatTime } from "@/utils/dateUtils";

// TYPES
import type { typesUser } from "@/types/typesUser";
import type { typesMatchWithPlayers } from "@/types/typesMatchWithPlayers";

type MatchContentProps = {
    matchId: string;
    authToken: string;
    currentUserId: string;
}

export const MatchContent = ({
    matchId,
    authToken,
    currentUserId
}: MatchContentProps) => {
    const t = useTranslations("MatchPage");
    const queryClient = useQueryClient();

    const { data: matchData, isLoading } = useQuery<typesMatchWithPlayers>({
        queryKey: ['match', matchId],
        queryFn: () => client_fetchMatch(authToken, matchId),
        enabled: !!matchId && !!authToken,
    });

    const { mutate: togglePlayer } = useMutation({
        mutationFn: async ({ 
            teamNumber,
            action 
        }: { 
            teamNumber: 1 | 2;
            action: 'join' | 'leave';
        }) => {
            return client_managePlayer(
                authToken,
                matchId,
                currentUserId,
                teamNumber,
                action
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['match', matchId] });
        },
    });

    if (isLoading) {
        return <MatchLoadingSkeleton />;
    }

    if (!matchData) {
        return <p>{t('noMatchFound')}</p>;
    }

    const { match, team1Players, team2Players } = matchData;
    
    const isUserInTeam = (players: typesUser[]) => {
        return players.some(player => player.id === currentUserId);
    };

    const userTeamNumber = isUserInTeam(team1Players) 
        ? 1 
        : isUserInTeam(team2Players) 
            ? 2 
            : null;

    const renderTeam = (players: typesUser[], teamNumber: 1 | 2) => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">
                {teamNumber === 1 ? match.team1_name : match.team2_name}
            </h3>
            <div className="space-y-2">
                {players.map((player) => (
                    <div 
                        key={player.id} 
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                        <span>{player.fullName}</span>
                        {player.id === currentUserId && (
                            <button
                                onClick={() => togglePlayer({ 
                                    teamNumber, 
                                    action: 'leave' 
                                })}
                                className="text-red-600 text-sm"
                            >
                                {t('leaveTeam')}
                            </button>
                        )}
                    </div>
                ))}
                {players.length < 11 && !userTeamNumber && (
                    <button
                        onClick={() => togglePlayer({ 
                            teamNumber,
                            action: 'join'
                        })}
                        className="w-full p-2 text-sm text-gray-600 border border-dashed rounded hover:bg-gray-50"
                    >
                        {t('joinTeam')}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 p-4">
            <div className="space-y-2 text-center">
                <h1 className="text-center font-bold text-3xl">{match.location} - {match.price}e</h1>
                <p className="text-center text-xl">{formatDate(match.starts_at_day)} - {formatTime(match.starts_at_hour)}h</p>
                <p>{t('type')}: {match.match_type}</p>
                <p>{t('gender')}: {match.match_gender}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderTeam(team1Players, 1)}
                {renderTeam(team2Players, 2)}
            </div>
        </div>
    );
};