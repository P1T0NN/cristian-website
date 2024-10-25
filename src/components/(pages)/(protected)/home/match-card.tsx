// REACTJS IMPORTS
import { memo } from "react";

// LIBRARIES
import { format, isToday, isTomorrow } from 'date-fns';

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";

// TYPES
import type { typesMatch } from "@/types/typesMatch";

type MatchCardProps = {
    match: typesMatch;
};

export const MatchCard = memo(({ 
    match 
}: MatchCardProps) => {
    const formatTime = (timeStr: string) => {
        return format(new Date(`2000-01-01T${timeStr}`), 'HH:mm');
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return format(date, 'do MMMM'); // Will output like "22nd April"
    };

    return (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold text-lg">Match Details</h3>
                        <dl className="space-y-1">
                            <div>
                                <dt className="inline font-medium">Location:</dt>
                                <dd className="inline ml-2">{match.location}</dd>
                            </div>

                            <div>
                                <dt className="inline font-medium">Price:</dt>
                                <dd className="inline ml-2">{match.price}e</dd>
                            </div>

                            <div>
                                <dt className="inline font-medium">Type:</dt>
                                <dd className="inline ml-2">{match.match_type}</dd>
                            </div>

                            <div>
                                <dt className="inline font-medium">Date:</dt>
                                <dd className="inline ml-2">{formatDate(match.starts_at_day)}</dd>
                            </div>

                            <div>
                                <dt className="inline font-medium">Time:</dt>
                                <dd className="inline ml-2">{formatTime(match.starts_at_hour)}</dd>
                            </div>
                        </dl>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium">Team 1</h4>
                            <p>{match.team1_name}</p>
                            <p className="text-sm text-gray-600">{match.team1_players}</p>
                        </div>
                        <div>
                            <h4 className="font-medium">Team 2</h4>
                            <p>{match.team2_name}</p>
                            <p className="text-sm text-gray-600">{match.team2_players}</p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                    <p>Added by: {match.added_by}</p>
                    <p>Created: {format(new Date(match.created_at), 'PPP')}</p>
                </div>
            </CardContent>
        </Card>
    );
});

MatchCard.displayName = 'MatchCard';