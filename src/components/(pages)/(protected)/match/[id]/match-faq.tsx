// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// LUCIDE ICONS
import { AlertCircle, Shirt, Users, CloudRain, Calendar, ShowerHeadIcon as Shower } from 'lucide-react';

export const MatchFAQ = async () => {
    const t = await getTranslations('MatchPage.MatchFAQ');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {t('title')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="how-it-works">
                        <AccordionTrigger className="text-left">
                            <span className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {t('howItWorks.question')}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                <p>{t('howItWorks.answer1')}</p>
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                    {t('howItWorks.answer2')}
                                </p>
                                <p>{t('howItWorks.answer3')}</p>
                                <p className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md">
                                    {t('howItWorks.answer4')}
                                </p>
                                <p className="bg-orange-100 dark:bg-orange-900 p-2 rounded-md">
                                    {t('howItWorks.answer5')}
                                </p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="equipment">
                        <AccordionTrigger className="text-left">
                            <span className="flex items-center gap-2">
                                <Shirt className="h-4 w-4" />
                                {t('equipment.question')}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                <p className="font-medium">{t('equipment.answer1')}</p>
                                <p>{t('equipment.answer2')}</p>
                                <p className="text-red-600 dark:text-red-400">{t('equipment.answer3')}</p>
                                <p>{t('equipment.answer4')}</p>
                                <p className="bg-green-100 dark:bg-green-900 p-2 rounded-md">
                                    {t('equipment.answer5')}
                                </p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="weather">
                        <AccordionTrigger className="text-left">
                            <span className="flex items-center gap-2">
                                <CloudRain className="h-4 w-4" />
                                {t('weather.question')}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                <p>{t('weather.answer1')}</p>
                                <p>{t('weather.answer2')}</p>
                                <p className="bg-red-100 dark:bg-red-900 p-2 rounded-md">
                                    {t('weather.answer3')}
                                </p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="cancellation">
                        <AccordionTrigger className="text-left">
                            <span className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {t('cancellation.question')}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                <p>{t('cancellation.answer1')}</p>
                                <p>{t('cancellation.answer2')}</p>
                                <p>{t('cancellation.answer3')}</p>
                                <p>{t('cancellation.answer4')}</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="facilities">
                        <AccordionTrigger className="text-left">
                            <span className="flex items-center gap-2">
                                <Shower className="h-4 w-4" />
                                {t('facilities.question')}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                <p>{t('facilities.answer1')}</p>
                                <p className="font-medium">{t('facilities.answer2')}</p>
                                <p className="text-red-600 dark:text-red-400">{t('facilities.answer3')}</p>
                                <p>{t('facilities.answer4')}</p>
                                <p className="bg-green-100 dark:bg-green-900 p-2 rounded-md">
                                    {t('facilities.answer5')}
                                </p>
                                <p className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md">
                                    {t('facilities.answer6')}
                                </p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    )
}