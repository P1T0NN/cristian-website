"use client"

// REACT IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";

// COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerItem } from "./player-item";
import { toast } from "sonner";

// ACTIONS
import { client_managePlayer } from "@/actions/functions/data/client/match/client_managePlayer";

// TYPES
import type { typesUser } from "@/types/typesUser";

type TeamCardProps = {
    teamName: string
    players: typesUser[] | undefined
    teamNumber: 1 | 2
    currentUserId: string
    userTeamNumber: number | null
    matchId: string
    authToken: string
}

export const TeamCard = ({
    teamName,
    players,
    teamNumber,
    currentUserId,
    userTeamNumber,
    matchId,
    authToken
}: TeamCardProps) => {
    const t = useTranslations("MatchPage");
    const queryClient = useQueryClient();

    const [isPending, startTransition] = useTransition();

    const handleTogglePlayer = (action: 'join' | 'leave') => {
        startTransition(async () => {
            const response = await client_managePlayer(
                authToken,
                matchId,
                currentUserId,
                teamNumber,
                action
            )

            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['match', matchId] });
                toast.success(response.message);
            } else {
                toast.error(response.message)
            };
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{teamName}</CardTitle>
                <div className="flex items-center justify-between">
                    <CardDescription>{t('players')} {players?.length ?? 0}/11</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {players?.map((player) => (
                    <PlayerItem
                        key={player.id}
                        player={player}
                        isCurrentUser={player.id === currentUserId}
                        onLeave={() => handleTogglePlayer('leave')}
                        isPending={isPending}
                    />
                ))}

                {(players?.length ?? 0) < 11 && !userTeamNumber && (
                    <Button 
                        onClick={() => handleTogglePlayer('join')}
                        disabled={isPending}
                        className="w-full"
                    >
                        {isPending ? t('joiningTeam') : t('joinTeam')}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}