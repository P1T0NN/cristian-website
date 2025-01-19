// REACTJS IMPORTS
import { useMemo } from 'react';

// TYPES
import type { typesBaseMatchPlayer } from '@/features/players/types/typesPlayer';

export const useMatchStats = (matchPlayers: typesBaseMatchPlayer[]) => {
    return useMemo(() => ({
        playersPaid: matchPlayers.filter(p => p.has_paid),
        playersWithDiscount: matchPlayers.filter(p => p.has_discount),
        playersWithGratis: matchPlayers.filter(p => p.has_gratis),
        playersEnteredWithBalance: matchPlayers.filter(p => p.has_entered_with_balance),
        playersNotPaid: matchPlayers.filter(p => !p.has_paid)
    }), [matchPlayers]);
};