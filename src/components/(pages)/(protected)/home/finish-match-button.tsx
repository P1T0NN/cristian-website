"use client"

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/components/ui/button";

export const FinishMatchButton = () => {
    const t = useTranslations("MatchPage");

    const handleFinishMatch = () => {

    };

    return (
        <Button 
            className="w-full bg-green-500 hover:bg-green-500/80"
            onClick={handleFinishMatch}
        >
            {t('finishMatch')}
        </Button>
    )
}