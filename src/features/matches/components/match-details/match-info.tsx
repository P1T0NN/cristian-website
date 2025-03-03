// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardHeader, CardContent, CardTitle } from "@/shared/components/ui/card";
import { EditMatchInstructionsButton } from "./edit-match-instructions-button";
import { RevealMatchPriceButton } from "./reveal-match-price-button";

// ACTIONS
import { fetchMatch } from "../../actions/fetchMatch";
import { getUser } from "@/features/auth/actions/verifyAuth";

// UTILS
import { formatDate, formatTime } from "@/shared/utils/dateUtils";

// TYPES
import type { typesMatch } from "../../types/typesMatch";

// LUCIDE ICONS
import { Clock, MapPin, Info, Calendar } from "lucide-react";

interface MatchInfoProps {
    matchIdFromParams: string;
}

export const MatchInfo = async ({ 
    matchIdFromParams
}: MatchInfoProps) => {
    const [t, serverMatchData, currentUserData] = await Promise.all([
        getTranslations("MatchPage"),
        fetchMatch(matchIdFromParams),
        getUser()
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

                    {/* Client Component */}
                    <RevealMatchPriceButton price={match.price} />

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
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t('instructions')}</CardTitle>
                    {currentUserData?.isAdmin && (
                        <EditMatchInstructionsButton 
                            matchId={matchIdFromParams}
                            currentInstructions={match.matchInstructions || ''}
                        />
                    )}
                </CardHeader>

                <CardContent>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                            <Info className="h-5 w-5 text-muted-foreground" />
                        </div>
                        
                        <p className="text-muted-foreground whitespace-pre-wrap break-words overflow-auto max-h-[300px] text-sm sm:text-base">
                            {match.matchInstructions || t('noInstructions')}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="container mx-auto px-4 py-3 text-center bg-blue-50 border-b border-blue-100">
                <p className="text-blue-800 font-medium italic">
                    {t('teamsNotFixed')}
                </p>
            </div>
        </div>
    );
};