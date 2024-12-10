// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// UTILS
import { formatDate, formatTime } from "@/utils/dateUtils";
import { getGenderLabel } from "@/utils/next-intl/getGenderLabel";
import { formatMatchType } from "@/utils/matchTypeFormatter";

// TYPES
import type { typesMatch } from "@/types/typesMatch";

// LUCIDE ICONS
import { MapPin, Calendar, Clock, Coins, ExternalLink } from 'lucide-react';

type MatchDetailsProps = {
    serverMatchData: typesMatch;
}

export const MatchDetails = async ({ 
    serverMatchData,
}: MatchDetailsProps) => {
    const t = await getTranslations("MatchPage");

    const formattedDate = await formatDate(serverMatchData.starts_at_day);
    const formattedMatchType = await formatMatchType(serverMatchData.match_type);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-center">{serverMatchData.location}</CardTitle>
                <div className="text-center text-lg text-muted-foreground">
                    <div className="flex justify-center gap-2">
                        <Badge variant="secondary" className="whitespace-pre-line">
                            {formattedMatchType}
                        </Badge>
                        <Badge variant="secondary">
                            {getGenderLabel(serverMatchData.match_gender)}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="flex flex-col items-center">
                        <Clock className="h-5 w-5 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">{formatTime(serverMatchData.starts_at_hour)}</span>
                        <span className="text-xs text-muted-foreground">{serverMatchData.match_duration} {t('minutes')}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Calendar className="h-5 w-5 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium uppercase">{formattedDate}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <MapPin className="h-5 w-5 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium uppercase">{serverMatchData.location}</span>
                        {serverMatchData.location_url && (
                            <a
                                href={serverMatchData.location_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:underline flex items-center mt-1"
                            >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                {t('viewMap')}
                            </a>
                        )}
                    </div>
                    <div className="flex flex-col items-center">
                        <Coins className="h-5 w-5 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">{serverMatchData.price}€</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};