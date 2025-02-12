// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardHeader, CardContent, CardTitle } from "@/shared/components/ui/card";

// ACTIONS
import { fetchMatch } from "../../actions/fetchMatch";

// UTILS
import { formatDate, formatTime } from "@/shared/utils/dateUtils";

// TYPES
import type { typesMatch } from "../../types/typesMatch";

// LUCIDE ICONS
import { Clock, MapPin, Info, Calendar, EuroIcon } from "lucide-react";

interface MatchInfoProps {
    matchIdFromParams: string;
}

export const MatchInfo = async ({ 
    matchIdFromParams
}: MatchInfoProps) => {
    const [t, serverMatchData] = await Promise.all([
        getTranslations("MatchPage"),
        fetchMatch(matchIdFromParams)
    ]);

    const match = serverMatchData.data as typesMatch;

    return (
        <div className="space-y-6">
            {/* Match Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('matchDetails')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Date and Time */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-medium">{t('dateAndTime')}</h3>
                            <p className="text-muted-foreground">
                                {formatDate(match.startsAtDay)} {t('at')} {formatTime(match.startsAtHour)}
                            </p>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-medium">{t('duration')}</h3>
                            <p className="text-muted-foreground">{match.matchDuration} {t('minutes')}</p>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <EuroIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-medium">{t('pricePerPlayer')}</h3>
                            <p className="text-muted-foreground">{match.price}€</p>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-medium">{match.location}</h3>
                            {match.locationUrl && (
                                <a 
                                    href={match.locationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm"
                                >
                                    {t('viewMap')}
                                </a>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Instructions Card */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('instructions')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            <Info className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">
                            {match.matchInstructions || t('noInstructions')}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};