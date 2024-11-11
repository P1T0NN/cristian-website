// REACTJS IMPORTS
import { Suspense } from "react";

// COMPONENTS
import { DisplayCalendar } from "@/components/(pages)/(protected)/home/display-calendar";
import { DisplayMatches } from "@/components/(pages)/(protected)/home/display-matches";
import { DisplayMatchesLoading } from "@/components/(pages)/(protected)/home/loading/display-matches-loading";
import { DisplayCalendarLoading } from "@/components/(pages)/(protected)/home/loading/display-calendar-loading";

export default async function HomePage({ 
    searchParams 
}: { 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const awaitedSearchParams = await searchParams;

    const date = awaitedSearchParams.date;

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto p-4 space-y-4">
                <Suspense fallback={<DisplayCalendarLoading />} >
                    <DisplayCalendar />
                </Suspense>
        
                <Suspense fallback={<DisplayMatchesLoading />}>
                    <DisplayMatches date={date as string} />
                </Suspense>
            </main>
        </div>
    );
}