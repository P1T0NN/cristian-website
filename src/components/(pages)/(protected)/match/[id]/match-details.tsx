"use client"

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// UTILS
import { formatDate, formatTime } from "@/utils/dateUtils";
import { getGenderLabel } from "@/utils/next-intl/getGenderLable";

// TYPES
import type { typesMatch } from "@/types/typesMatch";

// LUCIDE ICONS
import { MapPin, Calendar, Clock, Coins, ExternalLink } from 'lucide-react';

type MatchDetailsProps = {
    match: typesMatch;
    locale: string;
}

export const MatchDetails = ({ 
    match,
    locale 
}: MatchDetailsProps) => {
    const t = useTranslations("MatchPage");

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-center">{match.location}</CardTitle>
                <div className="text-center text-lg text-muted-foreground">
                    <div className="flex justify-center gap-2">
                        <Badge variant="secondary">
                            {match.match_type}
                        </Badge>
                        <Badge variant="secondary">
                            {getGenderLabel(locale, match.match_gender)}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="flex flex-col items-center">
                        <MapPin className="h-5 w-5 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">{match.location}</span>
                        {match.location_url && (
                            <a
                                href={match.location_url}
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
                        <Calendar className="h-5 w-5 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">{formatDate(locale, match.starts_at_day)}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Clock className="h-5 w-5 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">{formatTime(match.starts_at_hour)}h</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Coins className="h-5 w-5 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">{match.price}€</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};