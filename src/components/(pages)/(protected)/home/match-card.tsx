// REACTJS IMPORTS
import { memo } from "react";

// LIBRARIES
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// UTILS
import { formatTime, formatDate } from "@/utils/dateUtils";

// TYPES
import type { typesMatch } from "@/types/typesMatch";
import type { typesUser } from "@/types/typesUser";

type MatchCardProps = {
    match: typesMatch;
    serverUserData: typesUser;
};

export const MatchCard = memo(({ 
    match,
    serverUserData
}: MatchCardProps) => {
    const t = useTranslations("MatchCardComponent");

    return (
        <Card className="w-[250px] mb-4">
            <CardContent className="py-4">
                <div className="flex flex-col space-y-5">
                    <div>
                        <h1 className="text-center font-bold text-xl">{match.location} - {match.price}e</h1>
                        <p className="text-center text-sm">{formatDate(match.starts_at_day)} - {formatTime(match.starts_at_hour)}h</p>
                    </div>

                    <div className="flex flex-col space-y-1">
                        <div className="flex">
                            <h1 className="inline font-medium">{t("gender")}</h1>
                            <p className="inline ml-2">{match.match_gender}</p>
                        </div>

                        <div className="flex">
                            <h1 className="inline font-medium">{t("type")}</h1>
                            <p className="inline ml-2">{match.match_type}</p>
                        </div>
                    </div>
                </div>
            </CardContent>

            {serverUserData.isAdmin ? (
                <CardFooter className="flex flex-col mt-5 space-y-2">
                    <Button 
                        className="bg-green-500 hover:bg-green-500/80 w-full"
                    >
                        Finish match
                    </Button>

                    <Button 
                        className="bg-red-500 hover:bg-red-500/80 w-full"
                    >
                        Delete match
                    </Button>
                </CardFooter>
            ): (
                <CardFooter className="flex flex-col mt-5 space-y-2">
                    <CardDescription>{t("checkAvailability")}</CardDescription>
                </CardFooter>
            )}
        </Card>
    );
});

MatchCard.displayName = 'MatchCard';