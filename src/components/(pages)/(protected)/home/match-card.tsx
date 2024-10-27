"use client"

// REACTJS IMPORTS
import { memo } from "react";

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// LIBRARIES
import { useTranslations } from 'next-intl';
import { useQueryClient } from "@tanstack/react-query";

// COMPONENTS
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteMatchButton } from "./delete-match-button";
import { toast } from "sonner";

// ACTIONS
import { deleteMatch } from "@/actions/functions/queries/delete-match";

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

    const queryClient = useQueryClient();
    const router = useRouter();

    const handleViewMatch = () => {
        router.push(`${PAGE_ENDPOINTS.MATCH_PAGE}/${match.id}`);
    }

    const handleFinishMatch = () => {

    };
    
    const handleEditMatch = () => {
        router.push(`${PAGE_ENDPOINTS.EDIT_MATCH_PAGE}/${match.id}`);
    };
    
    const handleDeleteMatch = async () => {
        const result = await deleteMatch(match.id);
        
        if (result.success) {
            queryClient.invalidateQueries({ queryKey: ['matches'] });
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Card
            className="w-[250px] mb-4"
        >
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
                        className="w-full"
                        onClick={handleViewMatch}
                    >
                        {t('viewMatch')}
                    </Button>

                    <Button 
                        className="bg-green-500 hover:bg-green-500/80 w-full"
                        onClick={handleFinishMatch}
                    >
                        {t('finishMatch')}
                    </Button>

                    <Button
                        className="bg-blue-500 hover:bg-blue-500/80 w-full"
                        onClick={handleEditMatch}
                    >
                        {t('editMatch')}
                    </Button>

                    <DeleteMatchButton handleDeleteMatch={handleDeleteMatch} />
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