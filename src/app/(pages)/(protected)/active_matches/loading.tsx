// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default async function loading() {
    const t = await getTranslations("ActiveMatchesPage");
    
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{t('activeMatches')}</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                    <Card key={index} className="w-full">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center">
                                    <Skeleton className="h-8 w-16 mb-1" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <Skeleton className="h-5 w-16" />
                                        <Skeleton className="h-5 w-16" />
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-full mt-2" />
                                    <Skeleton className="h-4 w-3/4 mt-1" />
                                </div>
                                <div className="text-right">
                                    <Skeleton className="h-6 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-full mt-3" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}