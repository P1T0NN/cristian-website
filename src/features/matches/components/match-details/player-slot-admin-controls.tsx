"use client"

// REACTJS IMPORTS
import { useCallback } from "react";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { HasPaidButton } from "./has-paid-button";
import { HasGratisButton } from "./has-gratis-button";
import { HasDiscountButton } from "./has-discount-button";
import { SwapPlayerTeamButton } from "./swap-player-team-button";
import { AdminRemovePlayerFromMatchButton } from "./admin-remove-player-from-match-button";
import { MatchAdminButton } from "./match-admin-button";

// LUCIDE ICONS
import { MoreVertical } from "lucide-react";

interface AdminControlsProps {
    id: string;
    matchIdFromParams: string;
    currentUserIsAdmin: boolean;
    playerType: 'regular' | 'temporary';
    hasMatchAdmin: boolean;
    hasPaid: boolean;
    hasGratis: boolean;
    hasDiscount: boolean;
}

export const PlayerSlotAdminControls = ({
    id,
    matchIdFromParams,
    currentUserIsAdmin,
    playerType,
    hasMatchAdmin,
    hasPaid,
    hasGratis,
    hasDiscount,
}: AdminControlsProps) => {
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation(); // Prevent event bubbling
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleClick}>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" onClick={handleClick}>
                {currentUserIsAdmin && playerType=== 'regular' && (
                    <MatchAdminButton 
                        id={id}
                        matchIdFromParams={matchIdFromParams}
                        isMatchAdmin={hasMatchAdmin as boolean}
                    />
                )}
                <SwapPlayerTeamButton 
                    id={id}
                    matchIdFromParams={matchIdFromParams}
                    playerType={playerType as 'regular' | 'temporary'}
                />
                <AdminRemovePlayerFromMatchButton 
                    id={id}
                    matchIdFromParams={matchIdFromParams}
                    playerType={playerType as 'regular' | 'temporary'}
                />
                <HasPaidButton 
                    id={id}
                    matchIdFromParams={matchIdFromParams}
                    hasPaid={hasPaid as boolean}
                />
                <HasGratisButton
                    id={id}
                    matchIdFromParams={matchIdFromParams}
                    hasGratis={hasGratis as boolean}
                />
                <HasDiscountButton
                    id={id}
                    matchIdFromParams={matchIdFromParams}
                    hasDiscount={hasDiscount as boolean}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
