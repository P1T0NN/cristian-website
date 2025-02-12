"use client"

// COMPONENTS
import { Card, CardContent } from "@/shared/components/ui/card";
import { MatchTimeAndTitle } from './match-time-and-title';
import { PriceAndDelete } from './price-and-delete';
import { HistoryMatchStats } from './history-match-stats';
import { HistoryMatchFooter } from './history-match-footer';

// TYPES
import type { typesMatch, typesPlayer } from '@/features/matches/types/typesMatch';

type HistoryMatchCardProps = {
    match: typesMatch & { 
        matchPlayers: typesPlayer[] 
    };
}

export const HistoryMatchCard = ({ 
    match 
}: HistoryMatchCardProps) => {
    return (
        <Card className="w-full transition-shadow hover:shadow-md">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start justify-between">
                    <MatchTimeAndTitle match={match} />
                    
                    <PriceAndDelete match={match} />
                </div>

                <HistoryMatchStats match={match} />
            </CardContent>
            
            <HistoryMatchFooter match={match} />
        </Card>
    );
};