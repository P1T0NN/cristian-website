// COMPONENTS
import { Skeleton } from "@/components/ui/skeleton";

export const DisplayCalendarLoading = () => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-64" />
                <div className="flex gap-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 px-4">
                {Array.from({ length: 7 }).map((_, index) => (
                    <Skeleton key={index} className="flex-shrink-0 h-20 w-16 rounded-md" />
                ))}
            </div>
        </div>
    )
}