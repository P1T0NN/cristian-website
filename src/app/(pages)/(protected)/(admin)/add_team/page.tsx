// REACTJS IMPORTS
import { Suspense } from "react";

// NEXTJS IMPORTS
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { AddTeamDialog } from "@/components/(pages)/(protected)/(admin)/add_team/add-team-dialog";
import { TeamTable } from "@/components/(pages)/(protected)/(admin)/add_team/team-table";
import { TeamTableLoading } from "@/components/(pages)/(protected)/(admin)/add_team/loading/add-team-table-loading";

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from "@/types/typesUser";

export default async function AddTeamPage() {
    const t = await getTranslations("AddTeamPage");

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const serverUserData = await server_fetchUserData();
    const userData = serverUserData.data as typesUser;

    if (!userData.isAdmin) {
        redirect(PAGE_ENDPOINTS.HOME_PAGE);
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{t("teams")}</h1>
                <AddTeamDialog authToken={authToken} />
            </div>
            
            <Suspense fallback={<TeamTableLoading />}>
                <TeamTable authToken={authToken} />
            </Suspense>
        </div>
    )
}