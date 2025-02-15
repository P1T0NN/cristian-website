"use client"

// REACTJS IMPORTS
import { useState } from "react";

// NEXTJS IMPORTS
import { useTranslations } from "next-intl";

// LIBRARIES
import { cn } from "@/shared/lib/utils";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";

// LUCIDE ICONS
import { EuroIcon } from "lucide-react";

interface RevealMatchPriceButtonProps {
    price: string;
}

export const RevealMatchPriceButton = ({ 
    price 
}: RevealMatchPriceButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <div className="flex items-start gap-3">
            <div className="mt-1">
                <EuroIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
                <h3 className="font-medium">{t('pricePerPlayer')}</h3>
                {isRevealed ? (
                    <p className="text-muted-foreground animate-in fade-in slide-in-from-left-1">
                        {price}€
                    </p>
                ) : (
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsRevealed(true)}
                        className={cn(
                            "px-2 text-muted-foreground hover:text-primary",
                            "transition-colors duration-200"
                        )}
                    >
                        {t('showPrice')}
                    </Button>
                )}
            </div>
        </div>
    );
};