// NEXTJS IMPORTS
import { redirect } from "next/navigation";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EditMatchDetails } from "@/components/(pages)/(protected)/(admin)/edit_match/[id]/edit-match-details";

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from "@/types/typesUser";

export default async function EditMatchPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const t = await getTranslations("EditMatchPage");

    const { id } = await params;

    const result = await server_fetchUserData();
    const userData = result.data as typesUser;

    if (!userData.isAdmin) {
        redirect(PAGE_ENDPOINTS.HOME_PAGE);
    };

    return (
        <div className="flex w-full h-full py-10 justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>{t('editMatch')}</CardTitle>
                </CardHeader>

                <EditMatchDetails matchId={id} />
            </Card>
        </div>
    );
}