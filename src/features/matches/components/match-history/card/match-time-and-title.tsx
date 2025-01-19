// COMPONENTS
import { Badge } from "@/shared/components/ui/badge";

// TYPES
import type { typesMatch } from '@/features/matches/types/typesMatch';

interface MatchTimeAndTitleProps {
    formattedTime: string;
    formattedDate: string;
    title: string;
    format: string;
    match: typesMatch;
}

export const MatchTimeAndTitle = ({
    formattedTime,
    formattedDate,
    title,
    format,
    match
}: MatchTimeAndTitleProps) => {
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
                        <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${match.team1_color ? 'bg-white border' : 'bg-black'}`} />
                        <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${match.team2_color ? 'bg-white border' : 'bg-black'}`} />
                    </div>
                </div>
                {match.match_instructions && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">
                        {match.match_instructions}
                    </p>
                )}
            </div>
        </div>
    );
};