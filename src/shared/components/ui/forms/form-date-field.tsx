"use client";

// LIBRARIES
import { format } from "date-fns";
import { useTranslations } from 'next-intl';

// COMPONENTS
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { FormFieldBase } from "./form-field-base";

// UTILS
import { cn } from "@/shared/lib/utils";

// LUCIDE ICONS
import { CalendarIcon } from "lucide-react";

type FormDateFieldProps = {
    label: string;
    name: string;
    value: string | undefined;
    onChange: (date: string | undefined) => void;
    error?: string;
};

export const FormDateField = ({ 
    label, 
    name, 
    value, 
    onChange,
    error
}: FormDateFieldProps) => {
    const t = useTranslations("FormDateFieldComponent");

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            const utcDate = new Date(Date.UTC(
                date.getFullYear(), 
                date.getMonth(), 
                date.getDate()
            ));
            onChange(utcDate.toISOString());
        } else {
            onChange(undefined);
        }
    };

    return (
        <FormFieldBase label={label} name={name} error={error}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal transition-all duration-200 ease-in-out",
                            !value && "text-muted-foreground",
                            "hover:bg-primary hover:text-primary-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(new Date(value), "PPP") : <span>{t("pickDate")}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={value ? new Date(value) : undefined}
                        onSelect={handleDateChange}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </FormFieldBase>
    );
};