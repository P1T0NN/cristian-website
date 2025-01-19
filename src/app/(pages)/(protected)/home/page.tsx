// REACTJS IMPORTS
import { Suspense } from "react";

// COMPONENTS
import { DisplayCalendar } from "@/features/matches/components/active-matches/display-calendar";
import { DisplayMatches } from "@/features/matches/components/active-matches/display-matches";
import { ActiveMatches } from "@/features/matches/components/active-matches/active-matches";
import { Tabs, TabsContent } from "@/shared/components/ui/tabs";
import { TabsListMatches } from "@/features/matches/components/active-matches/tabs-list-matches";
import { DisplayMatchesLoading } from "@/features/matches/components/loading/display-matches-loading";
import { TabsListMatchesLoading } from "@/features/matches/components/loading/tabs-list-matches-loading";
import { OldMatches } from "@/features/matches/components/active-matches/old-matches";

export default async function HomePage({ 
    searchParams 
}: { 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const awaitedSearchParams = await searchParams;

    const date = awaitedSearchParams.date;

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto p-4 space-y-6">
                <div className="flex flex-col gap-6">
                    <div className="w-full">
                        <DisplayCalendar />
                    </div>
                </div>
        
                <Tabs defaultValue="all-matches">
                    <Suspense fallback={<TabsListMatchesLoading />}>
                        <TabsListMatches />
                    </Suspense>

                    <TabsContent value="all-matches">
                        <Suspense fallback={<DisplayMatchesLoading />}>
                            <DisplayMatches date={date as string} />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="my-matches">
                        <Suspense fallback={<DisplayMatchesLoading />}>
                            <ActiveMatches />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="old-matches">
                        <Suspense fallback={<DisplayMatchesLoading />}>
                            <OldMatches />
                        </Suspense>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}