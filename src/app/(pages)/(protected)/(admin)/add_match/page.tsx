// REACTJS IMPORTS
import { Suspense } from "react";

// NEXTJS IMPORTS
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Card } from "@/components/ui/card";
import { UserDetails } from "@/components/(pages)/(protected)/(admin)/add_match/user-details";
import { AddMatchDetails } from "@/components/(pages)/(protected)/(admin)/add_match/add-match-details";
import { UserDetailsLoading } from "@/components/(pages)/(protected)/(admin)/add_match/loading/user-details-loading";
import { AddMatchDetailsLoading } from "@/components/(pages)/(protected)/(admin)/add_match/loading/add-match-details-loading";

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from "@/types/typesUser";

export default async function AddMatchPage() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const serverUserData = await server_fetchUserData();
    const userData = serverUserData.data as typesUser;

    if (!userData.isAdmin) {
        redirect(PAGE_ENDPOINTS.HOME_PAGE);
    }

    return (
        <section className="flex w-full h-full py-10 justify-center">
            <Card>
                <Suspense fallback={<UserDetailsLoading />}>
                    <UserDetails serverUserData={userData} />
                </Suspense>

                <Suspense fallback={<AddMatchDetailsLoading />}>
                    <AddMatchDetails authToken={authToken} serverUserData={userData} />
                </Suspense>
            </Card>
        </section>
    );
}