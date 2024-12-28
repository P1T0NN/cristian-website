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
import { 
    formatMatchType, 
    calculateMatchPlaces, 
    getPlacesLeftText, 
    getPlacesLeftColor 
} from '@/utils/matchCalculations';

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
    
    const translatedGender = await getGenderLabel(match.match_gender);
    const format = `${formatMatchType(match.match_type)} ${translatedGender}`;
    const formattedTime = formatTime(match.starts_at_hour);
    const formattedDate = await formatDate(match.starts_at_day);

    const { placesLeft } = calculateMatchPlaces(match);
    const placesLeftText = getPlacesLeftText(placesLeft, serverUserData.isAdmin, t);
    const placesLeftColor = getPlacesLeftColor(placesLeft);

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
                                <span className={`flex text-xs px-2 py-1 rounded-full items-center ${placesLeft < 3 ? 'text-white' : 'text-blue-600'} ${placesLeftColor}`}>
                                    <Users className="w-3 h-3 mr-1" />
                                    {placesLeftText}
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