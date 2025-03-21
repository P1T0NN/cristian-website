// REACTJS IMPORTS
import { useMemo } from 'react';

// TYPES
import type { typesPlayer } from '@/features/matches/types/typesMatch';

export const useMatchStats = (matchPlayers: typesPlayer[]) => {
    return useMemo(() => {
        const playersPaidArray = matchPlayers.filter(p => p.hasPaid);
        const playersWithDiscountArray = matchPlayers.filter(p => p.hasDiscount);
        const playersWithGratisArray = matchPlayers.filter(p => p.hasGratis);
        const playersEnteredWithBalanceArray = matchPlayers.filter(p => p.hasEnteredWithBalance);
        const playersNotPaidArray = matchPlayers.filter(p => !p.hasPaid);

        return {
            // Arrays for display
            playersPaidArray,
            playersWithDiscountArray,
            playersWithGratisArray,
            playersEnteredWithBalanceArray,
            playersNotPaidArray,
            
            // Counts for comparisons
            playersPaid: playersPaidArray.length,
            playersWithDiscount: playersWithDiscountArray.length,
            playersWithGratis: playersWithGratisArray.length,
            playersEnteredWithBalance: playersEnteredWithBalanceArray.length,
            playersNotPaid: playersNotPaidArray.length
        };
    }, [matchPlayers]);
};