"use client"

// LIBRARIES
import { format as dateFormat } from "date-fns";

// COMPONENTS
import { Badge } from "@/shared/components/ui/badge";

// HOOKS
import { useFormatMatchType } from "@/features/matches/hooks/useFormatMatchType";

// UTILS
import { formatTime } from "@/shared/utils/dateUtils";

// TYPES
import type { typesMatch } from '@/features/matches/types/typesMatch';

interface MatchTimeAndTitleProps {
    match: typesMatch;
}

export const MatchTimeAndTitle = ({
    match
}: MatchTimeAndTitleProps) => {
    const title = `${match.team1Name} vs ${match.team2Name}`;

    const format = useFormatMatchType(match.matchType, match.matchGender);
    const formattedTime = formatTime(match.startsAtHour);
    const formattedDate = dateFormat(new Date(match.startsAtDay), 'dd/MM/yyyy');

    return (
        <div className="flex items-start gap-4 w-full sm:w-auto">
            <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-bold leading-none">
                    {formattedTime}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {formattedDate}
                </div>
            </div>

            <div className="flex-grow">
                <h3 className="font-semibold text-base sm:text-lg">{title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                        {format}
                    </Badge>

                    <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${match.team1Color ? 'bg-white border' : 'bg-black'}`} />
                        <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${match.team2Color ? 'bg-white border' : 'bg-black'}`} />
                    </div>
                </div>

                {match.matchInstructions && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">
                        {match.matchInstructions}
                    </p>
                )}
            </div>
        </div>
    );
};