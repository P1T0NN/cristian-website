// COMPONENTS
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

// LUCIDE ICONS
import { RefreshCcw } from 'lucide-react';

export const DisplayMatchesLoading = () => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-7 w-40" />
                
                <Button variant="ghost" size="sm" disabled>
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    <Skeleton className="h-4 w-16" />
                </Button>
            </div>

            <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                    <Card key={index} className="w-full">
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-8 w-16" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>

                                    <Skeleton className="h-6 w-12" />
                                </div>
                                
                                <div>

                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <Skeleton className="h-6 w-20" />
                                        <Skeleton className="h-6 w-24" />
                                        <Skeleton className="h-6 w-16" />
                                    </div>
                                </div>

                                <Skeleton className="h-4 w-full" />

                                <div className="flex flex-col gap-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}