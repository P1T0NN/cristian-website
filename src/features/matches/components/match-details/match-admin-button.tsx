"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";
import { toast } from "sonner";

// COMPONENTS
import {
    DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";

// LUCIDE ICONS
import { ShieldCheck } from "lucide-react";

// SERVER ACTIONS
import { toggleMatchAdmin } from "../../actions/server_actions/toggleMatchAdmin";

interface MatchAdminButtonProps {
    id: string;
    matchIdFromParams: string;
    isMatchAdmin: boolean;
}

export const MatchAdminButton = ({
    id,
    matchIdFromParams,
    isMatchAdmin
}: MatchAdminButtonProps) => {
    const t = useTranslations('MatchPage');
    const [isPending, startTransition] = useTransition();

    const handleToggleMatchAdmin = () => {
        startTransition(async () => {
            const result = await toggleMatchAdmin({
                matchPlayerId: id,
                matchIdFromParams,
                isMatchAdmin: !isMatchAdmin
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
            onClick={handleToggleMatchAdmin}
            disabled={isPending}
        >
            <ShieldCheck className="h-4 w-4 mr-2" />
            <span>
                {isMatchAdmin ? t('removeMatchAdmin') : t('addMatchAdmin')}
            </span>
        </DropdownMenuItem>
    );
};