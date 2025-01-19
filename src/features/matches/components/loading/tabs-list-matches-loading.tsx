// COMPONENTS
import { Skeleton } from "@/shared/components/ui/skeleton";
import { TabsList } from "@/shared/components/ui/tabs";

export const TabsListMatchesLoading = () => {
    return (
        <TabsList className="grid w-full grid-cols-3">
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
        </TabsList>
    )
}

