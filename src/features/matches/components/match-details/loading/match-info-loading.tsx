// COMPONENTS
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardTitle } from "@/shared/components/ui/card";

export const MatchInfoLoading = () => {
    return (
        <div className="space-y-6">
            {/* Match Details Card Loading */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-6 w-32" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Date and Time Loading */}
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-start gap-3">
                            <Skeleton className="h-5 w-5 mt-1" />
                            <div className="flex-1">
                                <Skeleton className="h-5 w-24 mb-1" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Instructions Card Loading */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-6 w-32" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-5 w-5 mt-1" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4 mt-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};