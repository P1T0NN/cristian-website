// NEXTJS IMPORTS
import Link from "next/link";

// LIBRARIES
import { getTranslations } from 'next-intl/server';

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS} from "@/config";

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";

// ACTIONS
import { serverFetchMyActiveMatches } from "@/actions/functions/data/server/server_fetchMyActiveMatches";

// UTILS
import { getGenderLabel } from "@/utils/next-intl/getGenderLabel";
import { formatTime, formatDate } from "@/utils/dateUtils";

// TYPES
import type { typesMatch } from "@/types/typesMatch";

// LUCIDE ICONS
import { MapPin, Users, Clock } from 'lucide-react';

type DisplayActiveMatchesProps = {
    currentUserId: string;
}

export const DisplayActiveMatches = async ({
    currentUserId
}: DisplayActiveMatchesProps) => {
    const t = await getTranslations('ActiveMatchesPage');

    const serverActiveMatchesData = await serverFetchMyActiveMatches(currentUserId);
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

    const formatMatchType = (type: string) => {
        switch (type) {
            case "F8": return "8v8"
            case "F7": return "7v7"
            case "F11": return "11v11"
            default: return type
        }
    };

    const getTotalPlaces = (matchType: string) => {
        switch (matchType) {
            case "F8": return 16;
            case "F7": return 14;
            case "F11": return 22;
            default: return 0;
        }
    };

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeMatchesData.map(async (match) => {
                const title = `${match.team1_name} vs ${match.team2_name}`;
                const translatedGender = await getGenderLabel(match.match_gender);
                const format = `${formatMatchType(match.match_type)} ${translatedGender}`;
                const formattedTime = formatTime(match.starts_at_hour);
                const formattedDate = await formatDate(match.starts_at_day);
                const totalPlaces = getTotalPlaces(match.match_type);
                const placesLeft = Math.max(0, totalPlaces - (match.places_occupied || 0));

                return (
                    <Link href={`${PROTECTED_PAGE_ENDPOINTS.MATCH_PAGE}/${match.id}`} key={match.id} className="block w-full">
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
                                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">{format}</span>
                                        <div className="flex items-center gap-1">
                                            <span className={`w-2.5 h-2.5 rounded-full ${match.team1_color ? 'bg-black' : 'bg-white border border-gray-300'}`} />
                                            <span className={`w-2.5 h-2.5 rounded-full ${match.team2_color ? 'bg-black' : 'bg-white border border-gray-300'}`} />
                                        </div>
                                        <span className="text-xs bg-blue-100 px-2 py-1 rounded-full text-blue-600 flex items-center">
                                            <Users className="w-3 h-3 mr-1" />
                                            {placesLeft} {t('placesLeft')}
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