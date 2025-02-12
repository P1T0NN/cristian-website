// COMPONENTS
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/shared/components/ui/card";

export const MatchTeamsLoading = () => {
    const TeamCardLoading = () => (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-9 w-28" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="flex items-center p-4 border rounded-lg"
                        >
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="ml-4 space-y-2 flex-1">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-8 w-8" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <TeamCardLoading />
            <TeamCardLoading />
        </div>
    );
};