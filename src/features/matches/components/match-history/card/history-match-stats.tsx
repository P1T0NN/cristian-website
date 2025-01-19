// COMPONENTS
import { StatsItem } from './stats-item';

// HOOKS
import { useMatchStats } from '@/features/matches/hooks/useMatchStats';

// TYPES
import type { typesMatch } from "../../../types/typesMatch";
import type { typesBaseMatchPlayer } from "@/features/players/types/typesPlayer";

interface HistoryMatchStatsProps {
    match: typesMatch & { 
        match_players: typesBaseMatchPlayer[] 
    };
}

export const HistoryMatchStats = ({ 
    match 
}: HistoryMatchStatsProps) => {
    const stats = useMatchStats(match.match_players);

    return (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
            <StatsItem 
                icon="users"
                label="paid"
                players={stats.playersPaid}
            />
            <StatsItem 
                icon="ticket"
                label="discount"
                players={stats.playersWithDiscount}
            />
            <StatsItem 
                icon="gift"
                label="gratis"
                players={stats.playersWithGratis}
            />
            <StatsItem 
                icon="credit-card"
                label="balance"
                players={stats.playersEnteredWithBalance}
            />
            <StatsItem 
                icon="x-circle"
                label="notPaid"
                players={stats.playersNotPaid}
            />
        </div>
    );
};