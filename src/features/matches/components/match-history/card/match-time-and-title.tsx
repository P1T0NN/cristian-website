"use client"

// LIBRARIES
import { useTranslations } from 'next-intl';
import { format as dateFormat } from "date-fns";

// COMPONENTS
import { Badge } from "@/shared/components/ui/badge";
import { useFormatMatchType } from "@/features/matches/hooks/useFormatMatchType";

// UTILS
import { formatTime } from '@/shared/utils/dateUtils';

// LUCIDE ICONS
import { XCircle } from 'lucide-react';

// TYPES
import type { typesMatch } from '@/features/matches/types/typesMatch';

interface MatchTimeAndTitleProps {
    match: typesMatch;
}

export const MatchTimeAndTitle = ({ match }: MatchTimeAndTitleProps) => {
    const t = useTranslations('MatchHistoryPage');
    
    const title = `${match.team1Name} vs ${match.team2Name}`;
    const format = useFormatMatchType(match.matchType, match.matchGender);
    const formattedTime = formatTime(match.startsAtHour);
    const formattedDate = dateFormat(new Date(match.startsAtDay), 'dd/MM/yyyy');
    
    const isCancelled = match.status === 'cancelled';

    return (
        <div className="flex mb-4 sm:mb-0">
            <div>
                <div className="flex items-center gap-2">
                    <div className="text-xl font-bold">{formattedTime}</div>
                    <div className="text-sm text-muted-foreground">{formattedDate}</div>
                    
                    {isCancelled && (
                        <Badge variant="destructive" className="uppercase font-bold">
                            <XCircle className="w-4 h-4 mr-1" />
                            {t('cancelled')}
                        </Badge>
                    )}
                </div>
                <h2 className="text-lg font-semibold mt-1">{title}</h2>
                {format && (
                    <p className="text-sm text-muted-foreground">
                        {format}
                    </p>
                )}
            </div>
        </div>
    );
};