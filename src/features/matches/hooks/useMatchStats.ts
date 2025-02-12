// REACTJS IMPORTS
import { useMemo } from 'react';

// TYPES
import type { typesPlayer } from '@/features/matches/types/typesMatch';

export const useMatchStats = (matchPlayers: typesPlayer[]) => {
    return useMemo(() => ({
        playersPaid: matchPlayers.filter(p => p.hasPaid),
        playersWithDiscount: matchPlayers.filter(p => p.hasDiscount),
        playersWithGratis: matchPlayers.filter(p => p.hasGratis),
        playersEnteredWithBalance: matchPlayers.filter(p => p.hasEnteredWithBalance),
        playersNotPaid: matchPlayers.filter(p => !p.hasPaid)
    }), [matchPlayers]);
};