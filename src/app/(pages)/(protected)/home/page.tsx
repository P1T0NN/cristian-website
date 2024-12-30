// REACTJS IMPORTS
import { Suspense } from "react";

// COMPONENTS
import { DisplayCalendar } from "@/components/(pages)/(protected)/home/display-calendar";
import { DisplayMatches } from "@/components/(pages)/(protected)/home/display-matches";
import { ActiveMatches } from "@/components/(pages)/(protected)/home/active-matches";
import { DisplayMatchesLoading } from "@/components/(pages)/(protected)/home/loading/display-matches-loading";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabsListMatches } from "@/components/(pages)/(protected)/home/tabs-list-matches";
import { OldMatches } from "@/components/(pages)/(protected)/home/old-matches";
import { TabsListMatchesLoading } from "@/components/(pages)/(protected)/home/loading/tabs-list-matches-loading";

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