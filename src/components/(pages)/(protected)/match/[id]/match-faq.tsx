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

// LUCIDE ICONS
import { AlertCircle, Shirt, Users, CloudRain, Calendar, ShowerHeadIcon as Shower, Clock, Mail, MessageCircle, Info, UserPlus, UsersIcon } from 'lucide-react';

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
                    <AccordionItem value="about-us">
                        <AccordionTrigger className="text-left">
                            <span className="flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                {t('aboutUs.question')}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                <p>{t('aboutUs.answer1')}</p>
                                <p>{t('aboutUs.answer2')}</p>
                                <p>{t('aboutUs.answer3')}</p>
                                <p>{t('aboutUs.answer4')}</p>
                                <ul className="list-disc pl-5">
                                    <li>{t('aboutUs.sports.football')}</li>
                                    <li>{t('aboutUs.sports.futsal')}</li>
                                    <li>{t('aboutUs.sports.volleyball')}</li>
                                    <li>{t('aboutUs.sports.basketball')}</li>
                                    <li>{t('aboutUs.sports.multiple')}</li>
                                </ul>
                                <p>{t('aboutUs.answer5')}</p>
                                <p>{t('aboutUs.answer6')}</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="how-to-participate">
                        <AccordionTrigger className="text-left">
                            <span className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {t('howToParticipate.question')}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                <p>{t('howToParticipate.answer1')}</p>
                                <p>{t('howToParticipate.answer2')}</p>
                                <p>{t('howToParticipate.answer3')}</p>
                                <p>{t('howToParticipate.answer4')}</p>
                                <p className="font-medium">{t('howToParticipate.answer5')}</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="start-time">
                        <AccordionTrigger className="text-left">
                            <span className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {t('startTime.question')}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                <p>{t('startTime.answer1')}</p>
                                <p className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-md font-medium">
                                    {t('startTime.answer2')}
                                </p>
                                <p>{t('startTime.answer3')}</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="football-rules">
                        <AccordionTrigger className="text-left">
                            <span className="flex items-center gap-2">
                                <Shirt className="h-4 w-4" />
                                {t('footballRules.question')}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                <p>{t('footballRules.answer1')}</p>
                                <p>{t('footballRules.answer2')}</p>
                                <p>{t('footballRules.answer3')}</p>
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
                                <p>{t('equipment.answer1')}</p>
                                <ul className="list-disc pl-5">
                                    <li>{t('equipment.items.whiteShirt')}</li>
                                    <li>{t('equipment.items.blackShirt')}</li>
                                </ul>
                                <p>{t('equipment.answer2')}</p>
                                <p className="bg-red-100 dark:bg-red-900 p-2 rounded-md text-red-600 dark:text-red-400 font-medium">
                                    {t('equipment.answer3')}
                                </p>
                                <p>{t('equipment.answer4')}</p>
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
                                <p className="bg-red-100 dark:bg-red-900 p-2 rounded-md text-red-600 dark:text-red-400 font-medium">
                                    {t('cancellation.answer4')}
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
                                <p className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-md font-medium">
                                    {t('facilities.answer2')}
                                </p>
                                <p>{t('facilities.answer3')}</p>
                                <p className="bg-red-100 dark:bg-red-900 p-2 rounded-md text-red-600 dark:text-red-400 font-medium">
                                    {t('facilities.answer4')}
                                </p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="add-friend">
                        <AccordionTrigger className="text-left">
                            <span className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                {t('addFriend.question')}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                <p>{t('addFriend.answer1')}</p>
                                <p>{t('addFriend.answer2')}</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="add-multiple-friends">
                        <AccordionTrigger className="text-left">
                            <span className="flex items-center gap-2">
                                <UsersIcon className="h-4 w-4" />
                                {t('addMultipleFriends.question')}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                <p>{t('addMultipleFriends.answer')}</p>
                                <Button asChild variant="outline">
                                    <a href="https://wa.me/+34661180764" target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        {t('contact.whatsappButton')}
                                    </a>
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold">{t('contact.title')}</h3>
                    <p>{t('contact.message')}</p>
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