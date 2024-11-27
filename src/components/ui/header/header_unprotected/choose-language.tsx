"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// SERVICES
import { setUserLocale } from '@/services/server/locale';

// COMPONENTS
import { Button } from "../../button";

// TYPES
import type { Locale } from '@/i18n/config';

type ChooseLanguageProps = {
    locale: string;
}

export const ChooseLanguage = ({
    locale
}: ChooseLanguageProps) => {
    const [isPending, startTransition] = useTransition();

    const handleLanguageChange = (newLocale: string) => {
        startTransition(async () => {
            await setUserLocale(newLocale as Locale);
        });
    };

    return (
        <div className="flex space-x-2">
            <Button
                variant={locale === 'en' ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange('en')}
                disabled={isPending}
            >
                English
            </Button>
            <Button
                variant={locale === 'es' ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange('es')}
                disabled={isPending}
            >
                Español
            </Button>
        </div>
    )
}