// LIBRARIES
import { format as dateFormat } from 'date-fns';

// COMPONENTS
import { Card, CardContent } from "@/shared/components/ui/card";
import { MatchTimeAndTitle } from './match-time-and-title';
import { PriceAndDelete } from './price-and-delete';
import { HistoryMatchStats } from './history-match-stats';
import { HistoryMatchFooter } from './history-match-footer';

// HOOKS
import { useFormatMatchType } from '@/features/matches/hooks/useFormatMatchType';

// UTILS
import { formatTime } from "@/shared/utils/dateUtils";

// TYPES
import type { typesMatch } from '@/features/matches/types/typesMatch';
import type { typesBaseMatchPlayer } from '@/features/players/types/typesPlayer';

type HistoryMatchCardProps = {
    match: typesMatch & { 
        match_players: typesBaseMatchPlayer[] 
    };
}

export const HistoryMatchCard = ({ 
    match 
}: HistoryMatchCardProps) => {
    const title = `${match.team1_name} vs ${match.team2_name}`;
    const format = useFormatMatchType(match.match_type, match.match_gender);
    const formattedTime = formatTime(match.starts_at_hour);
    const formattedDate = dateFormat(new Date(match.starts_at_day), 'dd/MM/yyyy');

    return (
        <Card className="w-full transition-shadow hover:shadow-md">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start justify-between">
                    <MatchTimeAndTitle 
                        formattedTime={formattedTime}
                        formattedDate={formattedDate}
                        title={title}
                        format={format}
                        match={match}
                    />
                    
                    <PriceAndDelete match={match} />
                </div>

                <HistoryMatchStats match={match} />
            </CardContent>
            
            <HistoryMatchFooter match={match} />
        </Card>
    );
};