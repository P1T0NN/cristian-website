// REACTJS IMPORTS
import { Suspense } from "react";

// COMPONENTS
import { DisplayCalendar } from "@/components/(pages)/(protected)/home/display-calendar";
import { DisplayMatches } from "@/components/(pages)/(protected)/home/display-matches";
import { MyActiveMatches } from "@/components/(pages)/(protected)/home/my-active-matches";
import { DisplayMatchesLoading } from "@/components/(pages)/(protected)/home/loading/display-matches-loading";
import { DisplayCalendarLoading } from "@/components/(pages)/(protected)/home/loading/display-calendar-loading";

// SERVER ACTIONS
import { getUser } from "@/actions/actions/auth/verifyAuth";

// TYPES
import type { typesUser } from "@/types/typesUser";

export default async function HomePage({ 
    searchParams 
}: { 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const serverUserData = await getUser() as typesUser;

    const awaitedSearchParams = await searchParams;

    const date = awaitedSearchParams.date;

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto p-4 space-y-4">
                <Suspense fallback={<DisplayCalendarLoading />} >
                    <div className="flex w-full justify-between">
                        <DisplayCalendar />
                        <MyActiveMatches currentUserId={serverUserData.id} />
                    </div>
                </Suspense>
        
                <Suspense fallback={<DisplayMatchesLoading />}>
                    <DisplayMatches date={date as string} serverUserData={serverUserData} />
                </Suspense>
            </main>
        </div>
    );
}