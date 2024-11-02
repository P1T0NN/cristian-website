// COMPONENTS
import { CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const UserDetailsLoading = () => {
    return (
        <CardHeader>
            <div className="space-y-2">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-5 w-full" />
            </div>
        </CardHeader>
    );
};