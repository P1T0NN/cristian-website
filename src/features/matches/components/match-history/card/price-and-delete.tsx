// NOTE: This component is client because our parent is already
"use client"

// COMPONENTS
import { DeleteMatchFromHistoryDialog } from '../delete-match-from-history-dialog';

// TYPES
import type { typesMatch, typesPlayer } from '@/features/matches/types/typesMatch';

interface PriceAndDeleteProps {
    match: typesMatch & { 
        matchPlayers: typesPlayer[] 
    };
}

export const PriceAndDelete = ({ 
    match 
}: PriceAndDeleteProps) => {
    return (
        <div className="text-right mt-2 sm:mt-0">
            <div className="font-semibold text-base sm:text-lg">
                {match.price}€
            </div>

            <DeleteMatchFromHistoryDialog match={match} />
        </div>
    );
};