"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu";
import { toast } from "sonner";

// SERVER ACTIONS
import { leaveMatch } from "../../actions/server_actions/leaveTeam";

// LUCIDE ICONS
import { UserX } from "lucide-react";

interface AdminRemovePlayerFromMatchButtonProps {
    id: string;
    matchIdFromParams: string;
    playerType: 'regular' | 'temporary';
}

export const AdminRemovePlayerFromMatchButton = ({
    id,
    matchIdFromParams,
    playerType
}: AdminRemovePlayerFromMatchButtonProps) => {
    const t = useTranslations('MatchPage');

    const [isPending, startTransition] = useTransition();

    const handleRemovePlayer = () => {
        startTransition(async () => {
            const result = await leaveMatch({
                matchIdFromParams,
                currentUserId: id,
                isRemovingFriend: playerType === 'temporary',
                adminOverride: true
            });

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <DropdownMenuItem
            onClick={handleRemovePlayer}
            disabled={isPending}
        >
            <UserX className="mr-2 h-4 w-4" />
            <span>{isPending ? t('removingPlayer') : t('removePlayer')}</span>
        </DropdownMenuItem>
    );
};
