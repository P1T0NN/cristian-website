"use client"

// REACTJS IMPORTS
import React, { useState } from 'react';

// COMPONENTS
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// LUCIDE ICONS
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CustomTimeInputProps {
    label: string
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    error?: string
}

export const FormTimeField: React.FC<CustomTimeInputProps> = ({
    label,
    name,
    value,
    onChange,
    error
}) => {
    const [hours, setHours] = useState(value.split(':')[0] || '00')
    const [minutes, setMinutes] = useState(value.split(':')[1] || '00')

    const handleHoursChange = (newHours: string) => {
        const parsedHours = parseInt(newHours)
        if (parsedHours >= 0 && parsedHours <= 23) {
            setHours(parsedHours.toString().padStart(2, '0'))
            updateValue(parsedHours.toString().padStart(2, '0'), minutes)
        }
    }

    const handleMinutesChange = (newMinutes: string) => {
        const parsedMinutes = parseInt(newMinutes)
        if (parsedMinutes >= 0 && parsedMinutes <= 59) {
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
    const incrementMinutes = () => handleMinutesChange((parseInt(minutes) + 1).toString())
    const decrementMinutes = () => handleMinutesChange((parseInt(minutes) - 1).toString())

  return (
        <div className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <div className="flex items-center space-x-2">
                <div className="flex flex-col items-center">
                    <Button type="button" size="sm" variant="outline" onClick={incrementHours}>
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Input
                        type="text"
                        id={`${name}-hours`}
                        value={hours}
                        onChange={(e) => handleHoursChange(e.target.value)}
                        className="w-14 text-center"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={decrementHours}>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>

                <span className="text-2xl">:</span>

                <div className="flex flex-col items-center">
                    <Button type="button" size="sm" variant="outline" onClick={incrementMinutes}>
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Input
                        type="text"
                        id={`${name}-minutes`}
                        value={minutes}
                        onChange={(e) => handleMinutesChange(e.target.value)}
                        className="w-14 text-center"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={decrementMinutes}>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
    )
}