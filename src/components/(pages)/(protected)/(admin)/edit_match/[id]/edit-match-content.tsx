"use client"

// REACTJS IMPORTS
import { useTransition } from "react";
import { useTranslations } from "next-intl";

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// LIBRARIES
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

// COMPONENTS
import { Card, CardTitle, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditMatchLoadingSkeleton } from "./edit-match-loading-skeleton";
import { EditMatchForm } from "./edit-match-form";
import { toast } from "sonner";

// ACTIONS
import { client_fetchMatch } from "@/actions/functions/data/client/match/client_fetchMatch";
import { editMatch } from "@/actions/functions/queries/edit-match";

// TYPES
import type { typesAddMatchForm } from "@/types/forms/AddMatchForm";

type EditMatchContentProps = {
    matchId: string;
    authToken: string;
}

export const EditMatchContent = ({
    matchId,
    authToken
}: EditMatchContentProps) => {
    const t = useTranslations("EditMatchPage");
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isPending, startTransition] = useTransition();

    const { data: matchData, isLoading } = useQuery({
        queryKey: ['match', matchId],
        queryFn: () => client_fetchMatch(authToken, matchId),
        enabled: !!matchId && !!authToken,
    });

    const handleSubmit = async (values: typesAddMatchForm) => {
        startTransition(async () => {
            const result = await editMatch(matchId, values);
            
            if (result.success) {
                router.push(PAGE_ENDPOINTS.HOME_PAGE);
                queryClient.invalidateQueries({ queryKey: ["matches"] });
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    if (isLoading) {
        return <EditMatchLoadingSkeleton />;
    }

    if (!matchData) {
        return <p>{t('noMatchFound')}</p>;
    }

    return (
        <div className="flex w-full h-full py-10 justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>{t('editMatch')}</CardTitle>
                </CardHeader>

                <CardContent>
                    <EditMatchForm
                        authToken={authToken}
                        matchData={matchData}
                        onSubmit={handleSubmit}
                        isPending={isPending}
                    />
                </CardContent>

                <CardFooter className="flex w-full">
                    <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push(PAGE_ENDPOINTS.HOME_PAGE)}
                        disabled={isPending}
                    >
                        {t('cancel')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};