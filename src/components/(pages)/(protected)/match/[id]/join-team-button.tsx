"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { managePlayer } from "@/actions/server_actions/mutations/match/managePlayer";

type JoinTeamButtonProps = {
    teamNumber: 1 | 2
    matchId: string
    currentUserId: string
    authToken: string
}

export const JoinTeamButton = ({
    teamNumber,
    matchId,
    currentUserId,
    authToken
}: JoinTeamButtonProps) => {
    const t = useTranslations("MatchPage")

    const [isPending, startTransition] = useTransition()

    const handleJoinTeam = () => {
        startTransition(async () => {
            const response = await managePlayer(
                authToken,
                matchId,
                currentUserId,
                teamNumber,
                'join'
            )

            if (response.success) {
                toast.success(response.message)
            } else {
                toast.error(response.message)
            }
        })
    }

    return (
        <Button 
            onClick={handleJoinTeam}
            disabled={isPending}
            className="w-full"
        >
            {isPending ? t('joiningTeam') : t('joinTeam')}
        </Button>
    )
}