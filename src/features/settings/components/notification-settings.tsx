"use client"

// LIBRARIES
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";

export const NotificationSettings = () => {
    const t = useTranslations('SettingsPage');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('notificationSettings')}</CardTitle>
                <CardDescription>{t('manageNotifications')}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>{t('emailNotifications')}</Label>
                        <p className="text-sm text-muted-foreground">{t('receiveEmailNotifications')}</p>
                    </div>
                    <Switch />
                </div>
            </CardContent>
        </Card>
    )
}