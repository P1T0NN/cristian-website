// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/components/ui/tooltip";

// LUCIDE ICONS
import { Info } from "lucide-react";

export const SubstituteNeededButton = async () => {
    const t = await getTranslations("MatchPage");
    
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        disabled
                        className="flex items-center gap-1"
                    >
                        <Info className="h-4 w-4" />
                        <span>{t('substituteNeeded')}</span>
                    </Button>
                </TooltipTrigger>
                
                <TooltipContent>
                    <p>{t('substituteNeededTooltip')}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};