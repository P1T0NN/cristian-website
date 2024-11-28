"use client"

// REACTJS IMPORTS
import React, { useState, useEffect } from 'react';

// COMPONENTS
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// LUCIDE ICONS
import { ChevronUp, ChevronDown } from 'lucide-react';

type FormTimeFieldProps = {
    label: string
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    error?: string
    disableArrows?: boolean
    every15Min?: boolean
}

export const FormTimeField = ({
    label,
    name,
    value,
    onChange,
    error,
    disableArrows = false,
    every15Min = false
}: FormTimeFieldProps) => {
    const [hours, setHours] = useState(value.split(':')[0] || '00')
    const [minutes, setMinutes] = useState(value.split(':')[1] || '00')

    useEffect(() => {
        const [newHours, newMinutes] = value.split(':');
        setHours(newHours || '00');
        setMinutes(newMinutes || '00');
    }, [value]);

    const handleHoursChange = (newHours: string) => {
        const parsedHours = parseInt(newHours)
        if (parsedHours >= 0 && parsedHours <= 23) {
            setHours(parsedHours.toString().padStart(2, '0'))
            updateValue(parsedHours.toString().padStart(2, '0'), minutes)
        }
    }

    const handleMinutesChange = (newMinutes: string) => {
        let parsedMinutes = parseInt(newMinutes)
        if (parsedMinutes >= 0 && parsedMinutes <= 59) {
            if (every15Min) {
                parsedMinutes = Math.round(parsedMinutes / 15) * 15
                if (parsedMinutes === 60) parsedMinutes = 0
            }
            setMinutes(parsedMinutes.toString().padStart(2, '0'))
            updateValue(hours, parsedMinutes.toString().padStart(2, '0'))
        }
    }

    const updateValue = (newHours: string, newMinutes: string) => {
        const newValue = `${newHours}:${newMinutes}`
        onChange({ target: { name, value: newValue } } as React.ChangeEvent<HTMLInputElement>)
    }

    const incrementHours = () => handleHoursChange((parseInt(hours) + 1).toString())
    const decrementHours = () => handleHoursChange((parseInt(hours) - 1).toString())
    const incrementMinutes = () => {
        const increment = every15Min ? 15 : 1
        handleMinutesChange((parseInt(minutes) + increment).toString())
    }
    const decrementMinutes = () => {
        const decrement = every15Min ? 15 : 1
        handleMinutesChange((parseInt(minutes) - decrement).toString())
    }

    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</Label>
            <div className={`flex items-center justify-center ${disableArrows ? 'space-x-2' : 'space-x-4'}`}>
                <div className={`flex ${disableArrows ? 'flex-row space-x-2' : 'flex-col items-center space-y-2'}`}>
                    {!disableArrows && (
                        <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={incrementHours}
                            className="w-8 h-8 hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                    )}
                    <Input
                        type="text"
                        id={`${name}-hours`}
                        value={hours}
                        onChange={(e) => handleHoursChange(e.target.value)}
                        className={`${disableArrows ? 'w-12 h-10' : 'w-14 h-12'} text-center text-lg transition-all duration-200 ease-in-out focus:ring-2 focus:ring-primary focus:border-transparent`}
                    />
                    {!disableArrows && (
                        <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={decrementHours}
                            className="w-8 h-8 hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <span className="text-2xl font-semibold">:</span>

                <div className={`flex ${disableArrows ? 'flex-row space-x-2' : 'flex-col items-center space-y-2'}`}>
                    {!disableArrows && (
                        <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={incrementMinutes}
                            className="w-8 h-8 hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                    )}
                    <Input
                        type="text"
                        id={`${name}-minutes`}
                        value={minutes}
                        onChange={(e) => handleMinutesChange(e.target.value)}
                        className={`${disableArrows ? 'w-12 h-10' : 'w-14 h-12'} text-center text-lg transition-all duration-200 ease-in-out focus:ring-2 focus:ring-primary focus:border-transparent`}
                    />
                    {!disableArrows && (
                        <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={decrementMinutes}
                            className="w-8 h-8 hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
            {error && <p className="text-sm text-red-500 mt-1 animate-fadeIn">{error}</p>}
        </div>
    )
}