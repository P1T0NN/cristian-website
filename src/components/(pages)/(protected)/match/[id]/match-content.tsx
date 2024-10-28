"use client"

// LIBRARIES
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MatchLoadingSkeleton } from "./match-loading-skeleton";

// ACTIONS
import { client_fetchMatch } from "@/actions/functions/data/client/match/client_fetchMatch";
import { client_managePlayer } from "@/actions/functions/data/client/match/client_managePlayer";

// UTILS
import { formatDate, formatTime } from "@/utils/dateUtils";

// TYPES
import type { typesUser } from "@/types/typesUser";
import type { typesMatchWithPlayers } from "@/types/typesMatchWithPlayers";

// LUCIDE ICONS
import { MapPin, Calendar, Clock, Coins } from 'lucide-react';

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
        return (
            <Card className="mt-10 w-full max-w-2xl mx-auto">
                <CardContent className="p-6">
                    <p>{t('noMatchFound')}</p>
                </CardContent>
            </Card>
        )
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
        <Card>
            <CardHeader>
                <CardTitle>{teamNumber === 1 ? match.team1_name : match.team2_name}</CardTitle>
                <CardDescription>{t('players')} {players.length}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {players.map((player) => (
                        <div 
                            key={player.id} 
                            className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                            <div className="flex items-center space-x-2">
                                <Avatar>
                                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${player.fullName}`} />
                                    <AvatarFallback>{player.fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{player.fullName}</span>
                            </div>
                            {player.id === currentUserId && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => togglePlayer({ 
                                        teamNumber, 
                                        action: 'leave' 
                                    })}
                                >
                                    {t('leaveTeam')}
                                </Button>
                            )}
                        </div>
                    ))}
                    {players.length < 11 && !userTeamNumber && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => togglePlayer({ 
                                teamNumber,
                                action: 'join'
                            })}
                        >
                            {t('joinTeam')}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 p-4 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">{match.location}</CardTitle>
                    <div className="text-center text-lg text-muted-foreground">
                        <div className="flex justify-center gap-2">
                            <Badge variant="secondary">
                                {match.match_type}
                            </Badge>
                            <Badge variant="secondary">
                                {match.match_gender}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="flex flex-col items-center">
                            <MapPin className="h-5 w-5 text-muted-foreground mb-2" />
                            <span className="text-sm font-medium">{match.location}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Calendar className="h-5 w-5 text-muted-foreground mb-2" />
                            <span className="text-sm font-medium">{formatDate(match.starts_at_day)}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Clock className="h-5 w-5 text-muted-foreground mb-2" />
                            <span className="text-sm font-medium">{formatTime(match.starts_at_hour)}h</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Coins className="h-5 w-5 text-muted-foreground mb-2" />
                            <span className="text-sm font-medium">{match.price}€</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderTeam(team1Players, 1)}
                {renderTeam(team2Players, 2)}
            </div>
        </div>
    );
};