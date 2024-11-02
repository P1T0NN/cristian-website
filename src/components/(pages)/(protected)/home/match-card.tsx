// NEXTJS IMPORTS
import { cookies } from 'next/headers';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DeleteMatchButton } from "./delete-match-button";
import { ViewMatchButton } from "./view-match-button";
import { FinishMatchButton } from "./finish-match-button";
import { EditMatchButton } from "./edit-match-button";

// UTILS
import { formatTime, formatDate } from "@/utils/dateUtils";
import { getGenderLabel } from "@/utils/next-intl/getGenderLable";

// TYPES
import type { typesMatch } from "@/types/typesMatch";
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { MapPin, Clock, Users, Dumbbell } from 'lucide-react';

type MatchCardProps = {
    match: typesMatch;
    serverUserData: typesUser;
};

export const MatchCard = async ({ 
    match,
    serverUserData,
}: MatchCardProps) => {
    const t = await getTranslations("MatchPage");

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

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
                            <span className="font-medium mr-1">{t("genderMatchCard")}</span>
                            <span>{getGenderLabel(match.match_gender)}</span>
                        </div>
                        <div className="flex items-center">
                            <Dumbbell className="w-4 h-4 mr-2" />
                            <span className="font-medium mr-1">{t("typeMatchCard")}</span>
                            <span>{match.match_type}</span>
                        </div>
                    </div>
                </div>
            </CardContent>

            {serverUserData.isAdmin ? (
                <CardFooter className="flex flex-col p-6 pt-0 space-y-2">
                    <ViewMatchButton matchId={match.id}/>
                    <FinishMatchButton />
                    <EditMatchButton matchId={match.id} />
                    <DeleteMatchButton authToken={authToken} match={match} />
                </CardFooter>
            ) : (
                <CardFooter className="p-6 pt-0">
                    <ViewMatchButton matchId={match.id}/>
                </CardFooter>
            )}
        </Card>
    );
};