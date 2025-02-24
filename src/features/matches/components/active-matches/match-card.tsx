// NEXTJS IMPORTS
import Link from "next/link";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent } from "@/shared/components/ui/card";

// ACTIONS
import { getUser } from "@/features/auth/actions/verifyAuth";

// UTILS
import { getGenderLabel } from "@/shared/utils/next-intl/getGenderLabel";
import { formatTime, formatDate } from "@/shared/utils/dateUtils";
import { 
    calculateMatchPlaces, 
    getPlacesLeftText, 
    getPlacesLeftColor 
} from '@/features/matches/utils/matchCalculations';
import { formatMatchTypeShort } from "../../utils/matchTypeFormatter";

// TYPES
import type { typesMatch } from "../../types/typesMatch";
import type { typesUser } from "@/features/players/types/typesPlayer";

// LUCIDE ICONS
import { MapPin, Users, Clock, User, Star, CheckCircle } from 'lucide-react';

type MatchCardProps = {
    match: typesMatch;
};

export const MatchCard = async ({ 
    match
}: MatchCardProps) => {
    const t = await getTranslations("HomePage");
    const currentUserData = await getUser() as typesUser;

    const title = `${match.team1Name} vs ${match.team2Name}`;

    const translatedGender = await getGenderLabel(match.matchGender);
    const format = `${formatMatchTypeShort(match.matchType)} ${translatedGender}`;
    const formattedTime = formatTime(match.startsAtHour);
    const formattedDate = await formatDate(match.startsAtDay);

    const { placesLeft } = calculateMatchPlaces(match);
    const placesLeftText = getPlacesLeftText(placesLeft, currentUserData.isAdmin);
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
                            {/*<div className="font-semibold text-lg">{match.price}€</div>*/}
                        </div>
                        <div>
                            {currentUserData.isAdmin && <h3 className="font-semibold text-lg truncate">{title}</h3>}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">{format}</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {match.matchDuration} {t('minutes')}
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className={`w-2.5 h-2.5 rounded-full ${match.team1Color ? 'bg-black' : 'bg-white border border-gray-300'}`} />
                                    <span className={`w-2.5 h-2.5 rounded-full ${match.team2Color ? 'bg-black' : 'bg-white border border-gray-300'}`} />

                                </div>
                                <span className={`flex text-xs px-2 py-1 rounded-full items-center ${placesLeft < 3 ? 'text-white' : 'text-blue-600'} ${placesLeftColor}`}>
                                    <Users className="w-3 h-3 mr-1" />
                                    {placesLeftText}
                                </span>
                                {currentUserData.isAdmin && match.matchLevel && (
                                    <span className="text-xs bg-yellow-100 px-2 py-1 rounded-full text-yellow-600 flex items-center">
                                        <Star className="w-3 h-3 mr-1" />
                                        {t('matchLevel')}: {match.matchLevel}
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
                        {match.matchInstructions && (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{match.matchInstructions}</p>
                        )}

                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                {t('organizer')}: {match.addedBy}
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