"use client"

// LIBRARIES
import { useTranslations } from 'next-intl';

// COMPONENTS
import { StatsItem } from './stats-item';
import { Badge } from '@/shared/components/ui/badge';

// HOOKS
import { useMatchStats } from '@/features/matches/hooks/useMatchStats';

// LUCIDE ICONS
import { AlertCircle } from 'lucide-react';

// TYPES
import type { typesMatch, typesPlayer } from "../../../types/typesMatch";


interface HistoryMatchStatsProps {
    match: typesMatch & { 
        matchPlayers: typesPlayer[] 
    };
}

export const HistoryMatchStats = ({ 
    match 
}: HistoryMatchStatsProps) => {
    const t = useTranslations('MatchHistoryPage');
    const stats = useMatchStats(match.matchPlayers);
    const isCancelled = match.status === 'cancelled';

    if (isCancelled) {
        // For cancelled matches, focus on whether players entered with balance (for refunds)
        return (
            <div className="mt-4">
                {stats.playersEnteredWithBalance > 0 ? (
                    <div className="flex flex-col gap-2">
                        <Badge variant="outline" className="w-fit flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {t('cancelledWithBalanceWarning')}
                        </Badge>
                        <StatsItem 
                            icon="credit-card"
                            label="refundedPlayers"
                            players={stats.playersEnteredWithBalanceArray}
                        />
                    </div>
                ) : (
                    <Badge variant="outline" className="w-fit flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {t('cancelledNoBalanceUsed')}
                    </Badge>
                )}
            </div>
        );
    }

    // Regular stats for finished matches
    return (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
            <StatsItem 
                icon="users"
                label="paid"
                players={stats.playersPaidArray}
            />
            <StatsItem 
                icon="ticket"
                label="discount"
                players={stats.playersWithDiscountArray}
            />
            <StatsItem 
                icon="gift"
                label="gratis"
                players={stats.playersWithGratisArray}
            />
            <StatsItem 
                icon="credit-card"
                label="balance"
                players={stats.playersEnteredWithBalanceArray}
            />
            <StatsItem 
                icon="x-circle"
                label="notPaid"
                players={stats.playersNotPaidArray}
            />
        </div>
    );
};