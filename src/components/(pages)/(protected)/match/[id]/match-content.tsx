"use client"

// LIBRARIES
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";
import { MatchLoading } from "./match-loading";
import { MatchDetails } from "./match-details";
import { TeamCard } from "./team-card";
import { SwitchTeamColors } from "./switch-team-colors";
import { MatchInstructions } from "./match-instructions";

// ACTIONS
import { client_fetchMatch } from "@/actions/functions/data/client/match/client_fetchMatch";

// TYPES
import type { typesUser } from "@/types/typesUser";
import type { typesMatchWithPlayers } from "@/types/typesMatchWithPlayers";

type MatchContentProps = {
    matchId: string
    authToken: string
    serverUserData: typesUser;
    locale: string;
}

export const MatchContent = ({
    matchId,
    authToken,
    serverUserData,
    locale
}: MatchContentProps) => {
    const t = useTranslations("MatchPage");

    const { data: matchData, isLoading, error } = useQuery<typesMatchWithPlayers>({
        queryKey: ['match', matchId],
        queryFn: () => client_fetchMatch(authToken, matchId),
        enabled: !!matchId && !!authToken,
    })

    if (isLoading) return <MatchLoading />

    if (error) {
        return (
            <Card className="mt-10 w-full max-w-2xl mx-auto">
                <CardContent className="p-6">
                    <p>{t('errorFetchingMatch')}</p>
                </CardContent>
            </Card>
        )
    }

    if (!matchData || !matchData.match) {
        return (
            <Card className="mt-10 w-full max-w-2xl mx-auto">
                <CardContent className="p-6">
                    <p>{t('noMatchFound')}</p>
                </CardContent>
            </Card>
        )
    }

    const { match, team1Players, team2Players } = matchData
    
    const isUserInTeam = (players: typesUser[] | undefined) => {
        return players?.some(player => player.id === serverUserData.id) ?? false
    }

    const userTeamNumber = isUserInTeam(team1Players) 
        ? 1 
        : isUserInTeam(team2Players) 
            ? 2 
            : null

    return (
        <div className="space-y-6 p-4 max-w-4xl mx-auto">
            <MatchDetails match={match} locale={locale} />

            <MatchInstructions
                instructions={match.match_instructions}
                matchId={matchId}
                authToken={authToken}
                isAdmin={serverUserData.isAdmin}
            />

            {/* New section to display team colors */}
            <div className="flex justify-center items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                    <div 
                        className={`w-6 h-6 rounded-full ${match.team1_color ? 'bg-white border' : 'bg-black'}`}
                    />
                    <span>{match.team1_name} - {match.team1_color ? t('whiteShirt') : t('blackShirt')}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div 
                        className={`w-6 h-6 rounded-full ${match.team2_color ? 'bg-white border' : 'bg-black'}`}
                    />
                    <span>{match.team2_name} - {match.team2_color ? t('whiteShirt') : t('blackShirt')}</span>
                </div>
            </div>

            {/* Admin can switch team colors */}
            {serverUserData.isAdmin && (
                <div className="flex items-center">
                    <SwitchTeamColors
                        matchId={matchId}
                        authToken={authToken}
                        isAdmin={serverUserData.isAdmin}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TeamCard
                    teamName={match.team1_name}
                    players={team1Players}
                    teamNumber={1}
                    currentUserId={serverUserData.id}
                    userTeamNumber={userTeamNumber}
                    matchId={matchId}
                    authToken={authToken}
                />
                <TeamCard
                    teamName={match.team2_name}
                    players={team2Players}
                    teamNumber={2}
                    currentUserId={serverUserData.id}
                    userTeamNumber={userTeamNumber}
                    matchId={matchId}
                    authToken={authToken}
                />
            </div>
        </div>
    )
}