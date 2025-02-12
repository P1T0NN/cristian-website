"use client"

// COMPONENTS
import { CardFooter } from "@/shared/components/ui/card";

// HOOKS
import { useCalculateTotalMoney } from "@/features/matches/hooks/useCalculateTotalMoney";

// TYPES
import type { typesMatch, typesPlayer } from "@/features/matches/types/typesMatch";

// LUCIDE ICONS
import { MapPin, EuroIcon } from 'lucide-react';

interface HistoryMatchFooterProps {
    match: typesMatch & { 
        matchPlayers: typesPlayer[] 
    };
}

export const HistoryMatchFooter = ({ 
    match 
}: HistoryMatchFooterProps) => {
    const totalMoney = useCalculateTotalMoney(Number(match.price), match.matchPlayers);

    return (
        <CardFooter className="bg-muted/50 py-2 px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center text-xs sm:text-sm font-medium mb-2 sm:mb-0">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {match.location}
            </div>
            
            <div className="flex items-center text-green-600 font-semibold text-sm sm:text-base">
                <EuroIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span>{totalMoney}€</span>
            </div>
        </CardFooter>
    );
};