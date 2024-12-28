// NEXTJS IMPORTS
import Link from 'next/link';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from '@/config';

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";

// ACTIONS
import { fetchMyActiveMatches } from '@/actions/match/fetchMyActiveMatches';
import { getUser } from '@/actions/auth/verifyAuth';

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
import type { typesUser } from '@/types/typesUser';

// LUCIDE ICONS
import { MapPin, Users, Clock } from 'lucide-react';

export const ActiveMatches = async () => {
    const t = await getTranslations('HomePage');

    const serverUserData = await getUser() as typesUser;
    const serverActiveMatchesData = await fetchMyActiveMatches(serverUserData.id);
    const activeMatchesData = serverActiveMatchesData.data as typesMatch[];

    if (!activeMatchesData || activeMatchesData.length === 0) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">{t('noActiveMatches')}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeMatchesData.map(async (match) => {
                const title = `${match.team1_name} vs ${match.team2_name}`;
                const translatedGender = await getGenderLabel(match.match_gender);
                const format = `${formatMatchType(match.match_type)} ${translatedGender}`;
                const formattedTime = formatTime(match.starts_at_hour);
                const formattedDate = await formatDate(match.starts_at_day);
                
                const { placesLeft } = calculateMatchPlaces(match);
                const placesLeftText = getPlacesLeftText(placesLeft, serverUserData.isAdmin, t);
                const placesLeftColor = getPlacesLeftColor(placesLeft);

                return (
                    <Link key={match.id} href={`${PROTECTED_PAGE_ENDPOINTS.MATCH_PAGE}/${match.id}`}>
                        <Card className="w-full h-full transition-shadow hover:shadow-md">
                            <CardContent className="p-4">
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                                            <span className="text-sm font-medium">{formattedTime}</span>
                                        </div>
                                        
                                        <div className="text-sm text-muted-foreground">{formattedDate}</div>
                                    </div>

                                    {serverUserData.isAdmin && <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>}

                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">{format}</span>
                                        <div className="flex items-center gap-1">
                                            <span className={`w-2.5 h-2.5 rounded-full ${match.team1_color ? 'bg-black' : 'bg-white border border-gray-300'}`} />
                                            <span className={`w-2.5 h-2.5 rounded-full ${match.team2_color ? 'bg-black' : 'bg-white border border-gray-300'}`} />
                                        </div>
                                        <span className={`flex text-xs px-2 py-1 rounded-full items-center ${placesLeft < 3 ? 'text-white' : 'text-blue-600'} ${placesLeftColor}`}>
                                            <Users className="w-3 h-3 mr-1" />
                                            {placesLeftText}
                                        </span>
                                    </div>

                                    {match.match_instructions && (
                                        <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap break-words">{match.match_instructions}</p>
                                    )}

                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            <span className="truncate">{match.location}</span>
                                        </div>
                                        <div className="font-semibold">{match.price}€</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
    )
}