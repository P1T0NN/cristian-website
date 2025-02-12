// LIBRARIES
import { cn } from "@/shared/lib/utils";
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";

// LUCIDE ICONS
import { Lock } from "lucide-react";

interface MatchTeamsPlayerSlotEmptyProps {
    teamColor: "red" | "blue";
    isBlocked: boolean;
}

export const MatchTeamsPlayerSlotEmpty = async ({
    teamColor,
    isBlocked
}: MatchTeamsPlayerSlotEmptyProps) => {
    const t = await getTranslations("MatchPage");

    return (
        <div
            className={cn(
                "flex items-center p-4 rounded-xl border-2",
                isBlocked 
                    ? cn(
                        "border-solid",
                        teamColor === "red" 
                            ? "border-red-200 bg-red-50/5" 
                            : "border-blue-200 bg-blue-50/5"
                    )
                    : cn(
                        "border-dashed",
                        teamColor === "red" 
                            ? "border-red-200/20" 
                            : "border-blue-200/20"
                    )
            )}
        >
            <div className="flex items-center space-x-4">
                <Avatar className={cn(
                    isBlocked ? "opacity-100" : "opacity-30",
                    teamColor === "red" 
                        ? "bg-red-100 text-red-600" 
                        : "bg-blue-100 text-blue-600"
                )}>
                    <AvatarFallback>
                        {isBlocked ? <Lock className="h-4 w-4" /> : "?"}
                    </AvatarFallback>
                </Avatar>

                <div>
                    <p className={cn(
                        "text-sm font-medium",
                        isBlocked
                            ? teamColor === "red" 
                                ? "text-red-500" 
                                : "text-blue-500"
                            : teamColor === "red" 
                                ? "text-red-600/40" 
                                : "text-blue-600/40"
                    )}>
                        {isBlocked ? t('reservedSpot') : t('availableSpot')}
                    </p>
                </div>
            </div>
        </div>
    );
};


