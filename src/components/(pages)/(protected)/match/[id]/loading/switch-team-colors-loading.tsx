// COMPONENTS
import { Skeleton } from "@/components/ui/skeleton";

export const SwitchTeamColorsLoading = () => {
    return (
        <div className="flex items-center justify-center">
            <Skeleton className="h-10 w-32" />
        </div>
    );
};