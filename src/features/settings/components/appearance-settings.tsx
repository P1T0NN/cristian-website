"use client"

// LIBRARIES
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { ToggleMode } from '@/shared/components/ui/toggle-mode/toggle-mode';

export const AppearanceSettings = () => {
    const t = useTranslations('SettingsPage');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('appearanceSettings')}</CardTitle>
                <CardDescription>{t('customizeAppearance')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>{t('theme')}</Label>
                    <ToggleMode />
                </div>
            </CardContent>
        </Card>
    )
}