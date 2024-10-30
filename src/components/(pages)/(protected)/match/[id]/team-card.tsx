"use client"

// REACT IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerItem } from "./player-item";
import { toast } from "sonner";

// TYPES
import type { typesUser } from "@/types/typesUser";
import type { APIResponse } from "@/types/responses/APIResponse";

type TeamCardProps = {
    teamName: string;
    players: typesUser[] | undefined;
    teamNumber: 1 | 2;
    currentUserId: string;
    userTeamNumber: number | null;
    onTogglePlayer: (teamNumber: 1 | 2, action: 'join' | 'leave') => Promise<APIResponse>;
}

export const TeamCard = ({
    teamName,
    players,
    teamNumber,
    currentUserId,
    userTeamNumber,
    onTogglePlayer
}: TeamCardProps) => {
    const t = useTranslations("MatchPage");
    const [isPending, startTransition] = useTransition();

    const handleTogglePlayer = (action: 'join' | 'leave') => {
        startTransition(async () => {
            const result = await onTogglePlayer(teamNumber, action);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{teamName}</CardTitle>
                <CardDescription>{t('players')} {players?.length ?? 0}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
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
                            variant="outline"
                            className="w-full"
                            onClick={() => handleTogglePlayer('join')}
                            disabled={isPending}
                        >
                            {isPending ? t('joiningTeam') : t('joinTeam')}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};