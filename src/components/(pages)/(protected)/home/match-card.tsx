// NEXTJS IMPORTS
import Link from "next/link";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";

// UTILS
import { getGenderLabel } from "@/utils/next-intl/getGenderLabel";
import { formatTime, formatDate } from "@/utils/dateUtils";

// TYPES
import type { typesMatch } from "@/types/typesMatch";

// LUCIDE ICONS
import { MapPin, Users, Clock, User, Star } from 'lucide-react';

type MatchCardProps = {
    match: typesMatch;
    isAdmin: boolean;
};

export const MatchCard = async ({ 
    match,
    isAdmin
}: MatchCardProps) => {
    const t = await getTranslations("MatchPage");

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

    // Calculate total places and places left
    const getTotalPlaces = (matchType: string) => {
        switch (matchType) {
            case "F8": return 16;
            case "F7": return 14;
            case "F11": return 22;
            default: return 0;
        }
    };

    const getOccupiedPlaces = (matchType: string, team1Name: string, team2Name: string, placesOccupied: number) => {
        const totalPlaces = getTotalPlaces(matchType);
        let occupiedPlaces = 0;

        if (team1Name !== "Equipo 1" && team2Name !== "Equipo 2") {
            return totalPlaces; // All places are occupied if both teams are custom
        }

        if (team1Name !== "Equipo 1" || team2Name !== "Equipo 2") {
            occupiedPlaces = totalPlaces / 2; // Half of the places are occupied if one team is custom
        }

        // Add the places_occupied to the calculation
        return Math.min(totalPlaces, occupiedPlaces + placesOccupied);
    };

    const totalPlaces = getTotalPlaces(match.match_type);
    const occupiedPlaces = getOccupiedPlaces(match.match_type, match.team1_name, match.team2_name, match.places_occupied || 0);
    const placesLeft = Math.max(0, totalPlaces - occupiedPlaces);

    const getPlacesLeftText = (placesLeft: number) => {
        if (placesLeft === 0) {
            return t('matchCompleted');
        } else if (placesLeft <= 3) {
            return t('lastPlacesLeft');
        } else {
            return `${placesLeft} ${t('placesLeft')}`;
        }
    };

    const getPlacesLeftColor = (placesLeft: number) => {
        return placesLeft <= 3 ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-600';
    };

    return (
        <Link href={`/match/${match.id}`} className="block w-full">
            <Card className="w-full transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold leading-none">{formattedTime}</div>
                                <div className="text-sm text-muted-foreground">{formattedDate}</div>
                            </div>
                            <div className="font-semibold text-lg">{match.price}€</div>
                        </div>
                        <div>
                            {isAdmin && <h3 className="font-semibold text-lg truncate">{title}</h3>}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">{format}</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {match.match_duration} {t('minutes')}
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className={`w-2.5 h-2.5 rounded-full ${match.team1_color ? 'bg-black' : 'bg-white border border-gray-300'}`} />
                                    <span className={`w-2.5 h-2.5 rounded-full ${match.team2_color ? 'bg-black' : 'bg-white border border-gray-300'}`} />
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full flex items-center ${getPlacesLeftColor(placesLeft)}`}>
                                    <Users className="w-3 h-3 mr-1" />
                                    {getPlacesLeftText(placesLeft)}
                                </span>
                                {isAdmin && match.match_level && (
                                    <span className="text-xs bg-yellow-100 px-2 py-1 rounded-full text-yellow-600 flex items-center">
                                        <Star className="w-3 h-3 mr-1" />
                                        {t('matchLevel')}: {match.match_level}
                                    </span>
                                )}
                            </div>
                        </div>
                        {match.match_instructions && (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{match.match_instructions}</p>
                        )}
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                {t('organizer')}: {match.added_by}
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {match.location}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};