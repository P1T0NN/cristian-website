"use client";

// REACTJS IMPORTS
import { useState } from 'react';

// NEXTJS IMPORTS
import { useTranslations } from 'next-intl';

// COMPONENTS
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInputField } from '@/components/ui/forms/form-input-field';
import { FormSelectField } from '@/components/ui/forms/form-select-field';
import { FormDateField } from '@/components/ui/forms/form-date-field';

// LUCIDE ICONS
import { SlidersHorizontal } from 'lucide-react';

export type FilterValues = {
    location: string;
    price: string;
    date: string;
    timeFrom: string;
    timeTo: string;
    gender: string;
    matchType: string;
};

type FilterModalProps = {
    onFilterChange: (filters: FilterValues) => void;
    onClearFilters: () => void;
    children?: React.ReactNode;
};

export const FilterModal = ({ 
    onFilterChange, 
    onClearFilters,
    children
}: FilterModalProps) => {
    const t = useTranslations("FilterModalComponent");

    const [filters, setFilters] = useState<FilterValues>({
        location: '',
        price: '',
        date: '',
        timeFrom: '',
        timeTo: '',
        gender: '',
        matchType: '',
    });

    const handleFilterChange = (key: keyof FilterValues, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = () => {
        onFilterChange(filters);
    };

    const clearFilters = () => {
        setFilters({
            location: '',
            price: '',
            date: '',
            timeFrom: '',
            timeTo: '',
            gender: '',
            matchType: '',
        });
        onClearFilters();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" className="gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        {t("title")}
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("title")}</DialogTitle>
                    <DialogDescription>
                        {t("description")}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <FormInputField
                        label={t("location")}
                        name="location"
                        type="text"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        placeholder={t("enterLocationPlaceholder")}
                    />
                    <FormInputField
                        label={t("price")}
                        name="price"
                        type="number"
                        value={filters.price}
                        onChange={(e) => handleFilterChange('price', e.target.value)}
                        placeholder={t("enterMaxPricePlaceholder")}
                    />
                    
                    <FormDateField
                        label={t("date")}
                        name="date"
                        value={filters.date}
                        onChange={(date) => handleFilterChange('date', date as string)}
                    />
                    
                    <div className="flex items-center space-x-2">
                        <FormInputField
                            label={t("timeFrom")}
                            name="timeFrom"
                            type="time"
                            value={filters.timeFrom}
                            onChange={(e) => handleFilterChange('timeFrom', e.target.value)}
                            placeholder={t("timeFormatPlaceholder")}
                        />

                        <FormInputField
                            label={t("timeTo")}
                            name="timeTo"
                            type="time"
                            value={filters.timeTo}
                            onChange={(e) => handleFilterChange('timeTo', e.target.value)}
                            placeholder={t("timeFormatPlaceholder")}
                        />
                    </div>
                    
                    <FormSelectField
                        label={t("gender")}
                        name="gender"
                        value={filters.gender}
                        onChange={(value) => handleFilterChange('gender', value)}
                        options={[
                            { value: "Male", label: t("male") },
                            { value: "Female", label: t("female") },
                            { value: "Mixed", label: t("mixed") }
                        ]}
                        placeholder={t("selectGenderPlaceholder")}
                    />
                    <FormSelectField
                        label={t("matchType")}
                        name="matchType"
                        value={filters.matchType}
                        onChange={(value) => handleFilterChange('matchType', value)}
                        options={[
                            { value: "F7", label: t("f7") },
                            { value: "F8", label: t("f8") },
                            { value: "F11", label: t("f11") }
                        ]}
                        placeholder={t("selectMatchTypePlaceholder")}
                    />
                </div>
                
                <DialogFooter className='flex w-full justify-between'>
                    <Button variant="outline" onClick={clearFilters}>{t("clearFilters")}</Button>
                    <DialogClose asChild>
                        <Button onClick={handleSave}>{t("saveChanges")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};