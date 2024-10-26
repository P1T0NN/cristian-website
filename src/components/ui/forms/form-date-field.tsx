"use client";

// LIBRARIES
import { format } from "date-fns";
import { useTranslations } from 'next-intl';

// COMPONENTS
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormFieldBase } from "./form-field-base";

// UTILS
import { cn } from "@/lib/utils";

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
        onChange(date ? date.toISOString() : undefined);
    };

    return (
        <FormFieldBase label={label} name={name} error={error}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "justify-start text-left font-normal",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon />
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