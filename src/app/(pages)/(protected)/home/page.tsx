// REACTJS IMPORTS
import { Suspense } from "react";

// COMPONENTS
import { DisplayCalendar } from "@/components/(pages)/(protected)/home/display-calendar";
import { DisplayMatches } from "@/components/(pages)/(protected)/home/display-matches";
import { DisplayMatchesLoading } from "@/components/(pages)/(protected)/home/loading/display-matches-loading";
import { DisplayCalendarLoading } from "@/components/(pages)/(protected)/home/loading/display-calendar-loading";

// ACTIONS
import { server_fetchUserData } from "@/actions/functions/data/server/server_fetchUserData";

// TYPES
import type { typesUser } from "@/types/typesUser";
import { MyActiveMatches } from "@/components/(pages)/(protected)/home/my-active-matches";

export default async function HomePage({ 
    searchParams 
}: { 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const serverUserData = await server_fetchUserData();
    const userData = serverUserData.data as typesUser;

    const awaitedSearchParams = await searchParams;

    const date = awaitedSearchParams.date;

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto p-4 space-y-4">
                <Suspense fallback={<DisplayCalendarLoading />} >
                    <div className="flex w-full justify-between">
                        <DisplayCalendar />
                        <MyActiveMatches currentUserId={userData.id} />
                    </div>
                </Suspense>
        
                <Suspense fallback={<DisplayMatchesLoading />}>
                    <DisplayMatches date={date as string} serverUserData={userData} />
                </Suspense>
            </main>
        </div>
    );
}