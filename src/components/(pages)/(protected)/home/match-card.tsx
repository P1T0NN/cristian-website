"use client"

// REACTJS IMPORTS
import { memo } from "react";

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// LIBRARIES
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteMatchButton } from "./delete-match-button";

// UTILS
import { formatTime, formatDate } from "@/utils/dateUtils";

// TYPES
import type { typesMatch } from "@/types/typesMatch";
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { MapPin, Clock, Users, Dumbbell } from 'lucide-react';

type MatchCardProps = {
    match: typesMatch;
    serverUserData: typesUser;
};

export const MatchCard = memo(({ 
    match,
    serverUserData
}: MatchCardProps) => {
    const t = useTranslations("MatchCardComponent");
    const router = useRouter();

    const handleViewMatch = () => {
        router.push(`${PAGE_ENDPOINTS.MATCH_PAGE}/${match.id}`);
    }

    const handleFinishMatch = () => {
        // Implement finish match logic
    };
    
    const handleEditMatch = () => {
        router.push(`${PAGE_ENDPOINTS.EDIT_MATCH_PAGE}/${match.id}`);
    };

    return (
        <Card className="w-full h-full hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-primary">{match.price}€</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{match.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{formatDate(match.starts_at_day)} - {formatTime(match.starts_at_hour)}h</span>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            <span className="font-medium mr-1">{t("gender")}</span>
                            <span>{match.match_gender}</span>
                        </div>
                        <div className="flex items-center">
                            <Dumbbell className="w-4 h-4 mr-2" />
                            <span className="font-medium mr-1">{t("type")}</span>
                            <span>{match.match_type}</span>
                        </div>
                    </div>
                </div>
            </CardContent>

            {serverUserData.isAdmin ? (
                <CardFooter className="flex flex-col p-6 pt-0 space-y-2">
                    <Button 
                        className="w-full"
                        onClick={handleViewMatch}
                    >
                        {t('viewMatch')}
                    </Button>
                    <Button 
                        className="w-full bg-green-500 hover:bg-green-600"
                        onClick={handleFinishMatch}
                    >
                        {t('finishMatch')}
                    </Button>
                    <Button
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        onClick={handleEditMatch}
                    >
                        {t('editMatch')}
                    </Button>
                    <DeleteMatchButton match={match} />
                </CardFooter>
            ) : (
                <CardFooter className="p-6 pt-0">
                    <Button className="w-full" onClick={handleViewMatch}>
                        {t("checkAvailability")}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
});

MatchCard.displayName = 'MatchCard';