"use client"

// LIBRARIES
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";
import { MatchLoading } from "./match-loading";
import { MatchDetails } from "./match-details";
import { TeamCard } from "./team-card";

// ACTIONS
import { client_fetchMatch } from "@/actions/functions/data/client/match/client_fetchMatch";
import { client_managePlayer } from "@/actions/functions/data/client/match/client_managePlayer";

// TYPES
import type { typesUser } from "@/types/typesUser";
import type { typesMatch } from "@/types/typesMatch";
import type { typesMatchWithPlayers } from "@/types/typesMatchWithPlayers";
import type { APIResponse } from "@/types/responses/APIResponse";

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

    const { data: matchData, isLoading, error } = useQuery<typesMatchWithPlayers>({
        queryKey: ['match', matchId],
        queryFn: async () => {
            const cachedMatches = queryClient.getQueryData<typesMatch[]>(['matches']);
            const cachedMatch = cachedMatches?.find(m => m.id === matchId);

            if (cachedMatch) {
                const playersData = await client_fetchMatch(authToken, matchId);
                return {
                    match: cachedMatch,
                    team1Players: playersData.team1Players,
                    team2Players: playersData.team2Players
                };
            }

            return client_fetchMatch(authToken, matchId);
        },
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
    
    const handleTogglePlayer = async (teamNumber: 1 | 2, action: 'join' | 'leave') => {
        return new Promise<APIResponse>((resolve) => {
            togglePlayer(
                { teamNumber, action },
                {
                    onSuccess: (response) => {
                        resolve(response);
                    },
                    onError: () => {
                        resolve({
                            success: false,
                            message: t('errorManagingPlayer'),
                            data: null
                        });
                    }
                }
            );
        });
    };

    if (isLoading) {
        return <MatchLoading />;
    }

    if (error) {
        return (
            <Card className="mt-10 w-full max-w-2xl mx-auto">
                <CardContent className="p-6">
                    <p>{t('errorFetchingMatch')}</p>
                </CardContent>
            </Card>
        );
    }

    if (!matchData || !matchData.match) {
        return (
            <Card className="mt-10 w-full max-w-2xl mx-auto">
                <CardContent className="p-6">
                    <p>{t('noMatchFound')}</p>
                </CardContent>
            </Card>
        );
    }

    const { match, team1Players, team2Players } = matchData;
    
    const isUserInTeam = (players: typesUser[] | undefined) => {
        return players?.some(player => player.id === currentUserId) ?? false;
    };

    const userTeamNumber = isUserInTeam(team1Players) 
        ? 1 
        : isUserInTeam(team2Players) 
            ? 2 
            : null;

    return (
        <div className="space-y-6 p-4 max-w-4xl mx-auto">
            <MatchDetails match={match} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TeamCard
                    teamName={match.team1_name}
                    players={team1Players}
                    teamNumber={1}
                    currentUserId={currentUserId}
                    userTeamNumber={userTeamNumber}
                    onTogglePlayer={handleTogglePlayer}
                />
                <TeamCard
                    teamName={match.team2_name}
                    players={team2Players}
                    teamNumber={2}
                    currentUserId={currentUserId}
                    userTeamNumber={userTeamNumber}
                    onTogglePlayer={handleTogglePlayer}
                />
            </div>
        </div>
    );
};