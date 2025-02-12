// REACTJS IMPORTS
import { useMemo } from 'react';

// TYPES
import type { typesPlayer } from '@/features/matches/types/typesMatch';

export const useCalculateTotalMoney = (price: number, matchPlayers: typesPlayer[]) => {
    return useMemo(() => {
        // Filter players who paid but don't have gratis
        const paidNonGratisPlayers = matchPlayers.filter(p => 
            p.hasPaid && !p.hasGratis
        );
    
        // Count players who paid full price (no discount)
        const fullPricePaidCount = paidNonGratisPlayers.filter(p => 
            !p.hasDiscount
        ).length;
        
        // Count players who paid with discount
        const discountedPaidCount = paidNonGratisPlayers.filter(p => 
            p.hasDiscount
        ).length;
    
        // Calculate totals
        const fullPriceTotal = fullPricePaidCount * price;
        const discountedTotal = discountedPaidCount * 3; // Fixed 3€ for discounted players
    
        return (fullPriceTotal + discountedTotal).toFixed(2);
    }, [price, matchPlayers]);
};