"use client"

// REACTJS IMPORTS
import { useState, useEffect } from 'react';

// NEXTJS IMPORTS
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// LIBRARIES
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from '@/config';

// COMPONENTS
import { Button } from "@/components/ui/button";

export const DisplayCalendar = () => {
    const searchParams = useSearchParams();

    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const dateParam = searchParams.get('date')
        if (dateParam) {
            setSelectedDate(parseISO(dateParam))
        }
    }, [searchParams])

    const days = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(new Date(), i)
        return {
            date,
            name: format(date, 'EEEEEE', { locale: es }),
            number: format(date, 'd'),
            isToday: i === 0,
        }
    })

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">
                {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
            </h2>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => (
                    <Link
                        key={day.number}
                        href={`${PROTECTED_PAGE_ENDPOINTS.HOME_PAGE}/?date=${format(day.date, 'yyyy-MM-dd')}`}
                        className="block"
                    >
                        <Button
                            variant={isSameDay(day.date, selectedDate) ? "default" : "outline"}
                            className={cn(
                                "w-full h-auto py-2",
                                day.isToday && "border-primary"
                            )}
                            onClick={() => setSelectedDate(day.date)}
                        >
                            <div className="text-center">
                                <div className="text-xs">{day.name}</div>
                                <div className="text-sm font-bold">{day.number}</div>
                            </div>
                        </Button>
                    </Link>
                ))}
            </div>
        </div>
    )
}