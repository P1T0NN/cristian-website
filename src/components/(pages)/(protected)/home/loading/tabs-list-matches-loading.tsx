// COMPONENTS
import { Skeleton } from "@/components/ui/skeleton";
import { TabsList } from "@/components/ui/tabs";

export const TabsListMatchesLoading = () => {
    return (
        <TabsList className="grid w-full grid-cols-3">
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
        </TabsList>
    )
}