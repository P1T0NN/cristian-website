"use client"

// REACTJS IMPORTS
import { useState, useEffect } from 'react';

// NEXTJS IMPORTS
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// LIBRARIES
import { format, addDays, isSameDay, parseISO, isWithinInterval, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/shared/lib/utils";

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from '@/config';

// COMPONENTS
import { Button } from "@/shared/components/ui/button";

// LUCIDE ICONS
import { ChevronRight, ChevronLeft } from 'lucide-react';

export const DisplayCalendar = () => {
    const searchParams = useSearchParams();
    const today = startOfDay(new Date());
    const twoWeeksLater = addDays(today, 13);

    const [selectedDate, setSelectedDate] = useState(today);
    const [startDate, setStartDate] = useState(today);

    useEffect(() => {
        const dateParam = searchParams.get('date')
        if (dateParam) {
            const parsedDate = parseISO(dateParam);
            if (isWithinInterval(parsedDate, { start: today, end: twoWeeksLater })) {
                setSelectedDate(parsedDate);
                setStartDate(parsedDate < addDays(today, 7) ? today : addDays(today, 7));
            }
        }
    }, [searchParams])

    const days = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(startDate, i)
        return {
            date,
            name: format(date, 'EEEEEE', { locale: es }),
            number: format(date, 'd'),
            isToday: isSameDay(date, today),
        }
    })

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newStartDate = direction === 'prev' ? today : addDays(today, 7);
        setStartDate(newStartDate);
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </h2>
                
                <div className="flex space-x-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => navigateWeek('prev')}
                        disabled={isSameDay(startDate, today)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous week</span>
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => navigateWeek('next')}
                        disabled={isSameDay(startDate, addDays(today, 7))}
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next week</span>
                    </Button>
                </div>
            </div>
            <div className="flex justify-between items-center gap-1 sm:gap-2">
                {days.map((day) => (
                    <Link
                        key={day.date.toISOString()}
                        href={`${PROTECTED_PAGE_ENDPOINTS.HOME_PAGE}/?date=${format(day.date, 'yyyy-MM-dd')}`}
                        className="flex-1"
                    >
                        <Button
                            variant={isSameDay(day.date, selectedDate) ? "default" : "outline"}
                            className={cn(
                                "w-full h-auto py-1 px-0.5 sm:py-2 sm:px-2",
                                day.isToday && "border-primary",
                                isSameDay(day.date, selectedDate) && "bg-primary text-primary-foreground"
                            )}
                            onClick={() => setSelectedDate(day.date)}
                        >
                            <div className="text-center">
                                <div className="text-[10px] sm:text-xs uppercase">{day.name}</div>
                                <div className="text-xs sm:text-sm font-bold">{day.number}</div>
                            </div>
                        </Button>
                    </Link>
                ))}
            </div>
        </div>
    )
}