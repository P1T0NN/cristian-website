// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// LUCIDE ICONS;
import { AlertCircle, Shirt, Users, CloudRain, Calendar, ShowerHeadIcon as Shower, Clock, Mail, MessageCircle } from 'lucide-react';

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
                    <AccordionItem value="start-time-duration">
                        <AccordionTrigger className="text-left">
                            <span className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {t('startTimeDuration.question')}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                <p>{t('startTimeDuration.answer1')}</p>
                                <p className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-md font-medium">
                                    {t('startTimeDuration.answer2')}
                                </p>
                                <p>{t('startTimeDuration.answer3')}</p>
                                <p className="bg-red-100 dark:bg-red-900 p-2 rounded-md text-red-600 dark:text-red-400 font-medium">
                                    {t('startTimeDuration.answer4')}
                                </p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

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
                                <p className="bg-red-100 dark:bg-red-900 p-2 rounded-md text-red-600 dark:text-red-400 font-medium">
                                    {t('cancellation.answer5')}
                                </p>
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

                <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold">{t('contact.title')}</h3>
                    <p>{t('contact.message')}</p>
                    <div className="space-y-2">
                        <p className="flex items-center">
                            <Mail className="mr-2 h-4 w-4" />
                            <span className="font-medium">{t('contact.email')}:</span> nitageorge89@gmail.com
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <Button asChild variant="outline">
                            <a href="https://wa.me/+34661180764" target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                WhatsApp
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <a href="mailto:nitageorge89@gmail.com">
                                <Mail className="mr-2 h-4 w-4" />
                                {t('contact.emailButton')}
                            </a>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}