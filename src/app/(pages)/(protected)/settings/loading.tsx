// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default async function Loading() {
    const t = await getTranslations("SettingsPage");

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            
            <Tabs defaultValue="account" className="space-y-4">
                <TabsList>
                    {['account', 'appearance', 'notifications', 'security'].map((tab) => (
                        <TabsTrigger key={tab} value={tab}>
                            <Skeleton className="h-5 w-24" />
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="account">
                    <Card>
                        <CardContent className="space-y-6 pt-6">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                            <Skeleton className="h-10 w-1/4" />
                        </CardContent>
                    </Card>
                </TabsContent>

                {['appearance', 'notifications', 'security'].map((tab) => (
                    <TabsContent key={tab} value={tab}>
                        <Card>
                            <CardContent className="space-y-6 pt-6">
                                {[...Array(3)].map((_, index) => (
                                    <div key={index} className="space-y-2">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                                <Skeleton className="h-10 w-1/4" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}