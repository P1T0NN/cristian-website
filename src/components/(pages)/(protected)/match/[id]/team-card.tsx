"use client"

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerItem } from "./player-item";

// TYPES
import type { typesUser } from "@/types/typesUser";

type TeamCardProps = {
    teamName: string;
    players: typesUser[] | undefined;
    teamNumber: 1 | 2;
    currentUserId: string;
    userTeamNumber: number | null;
    onTogglePlayer: (teamNumber: 1 | 2, action: 'join' | 'leave') => void;
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
                            onLeave={() => onTogglePlayer(teamNumber, 'leave')}
                        />
                    ))}
                    {(players?.length ?? 0) < 11 && !userTeamNumber && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => onTogglePlayer(teamNumber, 'join')}
                        >
                            {t('joinTeam')}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};