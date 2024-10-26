"use client";

// REACTJS IMPORTS
import { useState } from 'react';

// LIBRARIES
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
};

export const FilterModal = ({ 
    onFilterChange, 
    onClearFilters 
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
                <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    {t("title")}
                </Button>
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
                            type="text"
                            value={filters.timeFrom}
                            onChange={(e) => handleFilterChange('timeFrom', e.target.value)}
                            placeholder={t("timeFormatPlaceholder")}
                        />

                        <FormInputField
                            label={t("timeTo")}
                            name="timeTo"
                            type="text"
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
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                            { value: "Mixed", label: "Mixed" }
                        ]}
                        placeholder={t("selectGenderPlaceholder")}
                    />
                    <FormSelectField
                        label={t("matchType")}
                        name="matchType"
                        value={filters.matchType}
                        onChange={(value) => handleFilterChange('matchType', value)}
                        options={[
                            { value: "F7", label: "F7" },
                            { value: "F8", label: "F8" },
                            { value: "F11", label: "F11" }
                        ]}
                        placeholder={t("selectMatchTypePlaceholder")}
                    />
                </div>
                
                <DialogFooter className='flex w-full justify-between'>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={clearFilters}>{t("clearFilters")}</Button>
                    </DialogClose>

                    <DialogClose asChild>
                        <Button onClick={handleSave}>{t("saveChanges")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};