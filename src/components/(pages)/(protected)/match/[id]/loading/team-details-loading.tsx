// COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const TeamCardSkeleton = () => (
    <Card>
        <CardHeader>
            <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
        </CardHeader>
        <CardContent>
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);

export const TeamDetailsLoading = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TeamCardSkeleton />
            <TeamCardSkeleton />
        </div>
    );
};