// REACTJS IMPORTS
import { Suspense } from "react";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { DisplayCalendar } from "@/components/(pages)/(protected)/home/display-calendar";
import { DisplayMatches } from "@/components/(pages)/(protected)/home/display-matches";
import { ActiveMatches } from "@/components/(pages)/(protected)/home/active-matches";
import { DisplayMatchesLoading } from "@/components/(pages)/(protected)/home/loading/display-matches-loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyMatchesCount } from "@/components/(pages)/(protected)/home/my-matches-count";

export default async function HomePage({ 
    searchParams 
}: { 
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const t = await getTranslations("HomePage");

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
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="all-matches">{t('allMatches')}</TabsTrigger>
                        <Suspense fallback={<p>...</p>}>
                            <MyMatchesCount />
                        </Suspense>
                    </TabsList>

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
                </Tabs>
            </main>
        </div>
    );
}