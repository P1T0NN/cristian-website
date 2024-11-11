// NEXTJS IMPORTS
import Link from "next/link";

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";

// UTILS
import { getGenderLabel } from "@/utils/next-intl/getGenderLabel";
import { formatTime, formatDate } from "@/utils/dateUtils";

// TYPES
import type { typesMatch } from "@/types/typesMatch";

// LUCIDE ICONS
import { MapPin } from "lucide-react";

type MatchCardProps = {
    match: typesMatch;
};

export const MatchCard = async ({ 
    match 
}: MatchCardProps) => {
    const title = `${match.team1_name} vs ${match.team2_name}`;
    
    const formatMatchType = (type: string) => {
        switch (type) {
            case "F8": return "8v8"
            case "F7": return "7v7"
            case "F11": return "11v11"
            default: return type
        }
    };
    
    const translatedGender = await getGenderLabel(match.match_gender);
    const format = `${formatMatchType(match.match_type)} ${translatedGender}`;
    const formattedTime = formatTime(match.starts_at_hour);
    const formattedDate = await formatDate(match.starts_at_day);

    return (
        <Link href={`/match/${match.id}`} className="block w-full">
            <Card className="w-full bg-white transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold leading-none">{formattedTime}</div>
                            <div className="text-sm text-muted-foreground mt-1">{formattedDate}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg truncate">{title}</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">{format}</span>
                                <div className="flex items-center gap-1">
                                    <span className={`w-2.5 h-2.5 rounded-full ${match.team1_color ? 'bg-black' : 'bg-white border border-gray-300'}`} />
                                    <span className={`w-2.5 h-2.5 rounded-full ${match.team2_color ? 'bg-black' : 'bg-white border border-gray-300'}`} />
                                </div>
                            </div>
                            {match.match_instructions && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{match.match_instructions}</p>
                            )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                            <div className="font-semibold text-lg">{match.price}€</div>
                        </div>
                    </div>
        
                    <div 
                        className="w-full mt-3 flex items-center justify-center py-2 px-4 text-sm font-medium rounded-md"
                    >
                        <MapPin className="w-4 h-4 mr-2" />
                        {match.location}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};