// COMPONENTS
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export const MatchInstructionsLoading = () => {
    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </CardContent>
        </Card>
    );
};