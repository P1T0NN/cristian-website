// COMPONENTS
import { Skeleton } from "@/components/ui/skeleton";

export const DisplayTeamDetailsLoading = () => {
    return (
        <div className="flex flex-col justify-center items-center space-x-4 mb-4">
            <div className="flex justify-center items-center space-x-4 mb-2">
                <div className="flex items-center space-x-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="w-6 h-6 rounded-full" />
                </div>
            </div>
            <Skeleton className="h-4 w-48" />
        </div>
    );
};

