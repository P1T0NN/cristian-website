// REACTJS IMPORTS
import { useMemo } from 'react';

// TYPES
import type { typesBaseMatchPlayer } from '@/features/players/types/typesPlayer';

export const useCalculateTotalMoney = (price: number, matchPlayers: typesBaseMatchPlayer[]) => {
    return useMemo(() => {
        // Filter players who paid but don't have gratis
        const paidNonGratisPlayers = matchPlayers.filter(p => 
            p.has_paid && !p.has_gratis
        );
    
        // Count players who paid full price (no discount)
        const fullPricePaidCount = paidNonGratisPlayers.filter(p => 
            !p.has_discount
        ).length;
        
        // Count players who paid with discount
        const discountedPaidCount = paidNonGratisPlayers.filter(p => 
            p.has_discount
        ).length;
    
        // Calculate totals
        const fullPriceTotal = fullPricePaidCount * price;
        const discountedTotal = discountedPaidCount * 3; // Fixed 3€ for discounted players
    
        return (fullPriceTotal + discountedTotal).toFixed(2);
    }, [price, matchPlayers]);
};