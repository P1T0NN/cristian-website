// NEXTJS IMPORTS
import Link from "next/link";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";

// ACTIONS
import { getUser } from "@/actions/auth/verifyAuth";

// UTILS
import { getGenderLabel } from "@/utils/next-intl/getGenderLabel";
import { formatTime, formatDate } from "@/utils/dateUtils";

// TYPES
import type { typesMatch } from "@/types/typesMatch";
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { MapPin, Users, Clock, User, Star, CheckCircle } from 'lucide-react';

type MatchCardProps = {
    match: typesMatch;
};

export const MatchCard = async ({ 
    match,
}: MatchCardProps) => {
    const t = await getTranslations("MatchPage");

    const serverUserData = await getUser() as typesUser;

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

    const totalPlaces = getTotalPlaces(match.match_type);
    const placesPerTeam = totalPlaces / 2;

    const getOccupiedPlaces = () => {
        let occupiedPlaces = match.places_occupied || 0;

        if (match.team1_name !== "Equipo 1") {
            occupiedPlaces += placesPerTeam;
        }
        if (match.team2_name !== "Equipo 2") {
            occupiedPlaces += placesPerTeam;
        }

        return Math.min(totalPlaces, occupiedPlaces);
    };

    const occupiedPlaces = getOccupiedPlaces();
    const placesLeft = Math.max(0, totalPlaces - occupiedPlaces);

    const getPlacesLeftText = () => {
        if (placesLeft === 0) {
            return t('matchCompleted');
        } else if (placesLeft <= 3) {
            return t('lastPlacesLeft');
        } else {
            return `${placesLeft} ${t('placesLeft')}`;
        }
    };

    const getPlacesLeftColor = () => {
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
                            {serverUserData.isAdmin && <h3 className="font-semibold text-lg truncate">{title}</h3>}
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
                                <span className={`text-xs px-2 py-1 rounded-full flex items-center ${getPlacesLeftColor()}`}>
                                    <Users className="w-3 h-3 mr-1" />
                                    {getPlacesLeftText()}
                                </span>
                                {serverUserData.isAdmin && match.match_level && (
                                    <span className="text-xs bg-yellow-100 px-2 py-1 rounded-full text-yellow-600 flex items-center">
                                        <Star className="w-3 h-3 mr-1" />
                                        {t('matchLevel')}: {match.match_level}
                                    </span>
                                )}
                                {match.isUserInMatch && (
                                    <span className="text-xs bg-green-100 px-2 py-1 rounded-full text-green-600 flex items-center">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        {t('youAreInThisMatch')}
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