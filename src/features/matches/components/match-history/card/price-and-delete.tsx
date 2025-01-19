// COMPONENTS
import { DeleteMatchFromHistoryDialog } from '../delete-match-from-history-dialog';

// TYPES
import type { typesMatch } from '@/features/matches/types/typesMatch';
import type { typesBaseMatchPlayer } from '@/features/players/types/typesPlayer';

interface PriceAndDeleteProps {
    match: typesMatch & { 
        match_players: typesBaseMatchPlayer[] 
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