"use client"

// REACTJS IMPORTS
import { useCallback } from "react";

// COMPONENTS
import { HasPaidButton } from "./has-paid-button";
import { HasGratisButton } from "./has-gratis-button";
import { HasDiscountButton } from "./has-discount-button";
import { SwapPlayerTeamButton } from "./swap-player-team-button";
import { AdminRemovePlayerFromMatchButton } from "./admin-remove-player-from-match-button";
import { MatchAdminButton } from "./match-admin-button";

interface PlayerSlotAdminActionsProps {
    id: string;
    matchIdFromParams: string;
    currentUserIsAdmin: boolean;
    playerType: 'regular' | 'temporary';
    hasMatchAdmin: boolean;
    hasPaid: boolean;
    hasGratis: boolean;
    hasDiscount: boolean;
}

export const PlayerSlotAdminActions = ({
    id,
    matchIdFromParams,
    currentUserIsAdmin,
    playerType,
    hasMatchAdmin,
    hasPaid,
    hasGratis,
    hasDiscount
}: PlayerSlotAdminActionsProps) => {
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation(); // Prevent event bubbling
    }, []);

    return (
        <div className="inline-flex flex-wrap gap-2 mt-2" onClick={handleClick}>
            {/* Action buttons */}
            <HasPaidButton 
                id={id}
                matchIdFromParams={matchIdFromParams}
                hasPaid={hasPaid}
            />
            
            <HasGratisButton
                id={id}
                matchIdFromParams={matchIdFromParams}
                hasGratis={hasGratis}
            />
            
            <HasDiscountButton
                id={id}
                matchIdFromParams={matchIdFromParams}
                hasDiscount={hasDiscount}
            />
            
            <SwapPlayerTeamButton 
                id={id}
                matchIdFromParams={matchIdFromParams}
                playerType={playerType}
            />

            <AdminRemovePlayerFromMatchButton 
                id={id}
                matchIdFromParams={matchIdFromParams}
                playerType={playerType}
            />

            {currentUserIsAdmin && playerType === 'regular' && (
                <MatchAdminButton 
                    id={id}
                    matchIdFromParams={matchIdFromParams}
                    isMatchAdmin={hasMatchAdmin}
                />
            )}
        </div>
    );
};