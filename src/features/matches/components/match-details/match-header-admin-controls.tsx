// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import { FinishMatchButton } from "./finish-match-button";
import { EditMatchButton } from "./edit-match-button";
import { DeleteMatchButton } from "./delete-match-button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

// LUCIDE ICONS
import { ShieldAlert, MoreVertical } from "lucide-react";

interface MatchHeaderAdminControlsProps {
    matchIdFromParams: string;
}

export const MatchHeaderAdminControls = async ({
    matchIdFromParams
}: MatchHeaderAdminControlsProps) => {
    const t = await getTranslations('MatchPage');

    return (
        <div className="bg-yellow-50 border-b border-yellow-100">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-yellow-800">
                        <ShieldAlert className="w-5 h-5" />
                        <span className="font-medium">{t('adminControls')}</span>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:flex gap-3">
                        <FinishMatchButton matchIdFromParams={matchIdFromParams} />

                        <EditMatchButton matchIdFromParams={matchIdFromParams} />

                        <DeleteMatchButton matchIdFromParams={matchIdFromParams} />
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="flex flex-col gap-y-3 w-48">
                                <FinishMatchButton matchIdFromParams={matchIdFromParams} />

                                <EditMatchButton matchIdFromParams={matchIdFromParams} />

                                <DeleteMatchButton matchIdFromParams={matchIdFromParams} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
};
