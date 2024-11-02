// COMPONENTS
import { Skeleton } from "@/components/ui/skeleton";

export const DisplayTeamDetailsLoading = () => {
    return (
        <div className="flex justify-center items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center space-x-2">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
    )
}