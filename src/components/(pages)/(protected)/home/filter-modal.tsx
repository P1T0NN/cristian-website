"use client";

// REACTJS IMPORTS
import { useState } from 'react';

// NEXTJS IMPORTS
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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
import { FormTimeField } from '@/components/ui/forms/form-time-field';
import { Separator } from '@/components/ui/separator';

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
    children?: React.ReactNode;
};

export const FilterModal = ({ 
    children
}: FilterModalProps) => {
    const t = useTranslations("FilterModalComponent");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize filters from current URL search params
    const [filters, setFilters] = useState<FilterValues>({
        location: searchParams.get('location') || '',
        price: searchParams.get('price') || '',
        date: searchParams.get('date') || '',
        timeFrom: searchParams.get('timeFrom') || '',
        timeTo: searchParams.get('timeTo') || '',
        gender: searchParams.get('gender') || '',
        matchType: searchParams.get('matchType') || '',
    });

    const handleFilterChange = (key: keyof FilterValues, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = () => {
        // Create URL search params
        const params = new URLSearchParams();
        
        // Only add non-empty filters to the URL
        (Object.keys(filters) as Array<keyof FilterValues>).forEach(key => {
            if (filters[key]) {
                params.set(key, filters[key]);
            }
        });

        // Navigate with new search params
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleClearFilters = () => {
        // Reset local state
        setFilters({
            location: '',
            price: '',
            date: '',
            timeFrom: '',
            timeTo: '',
            gender: '',
            matchType: '',
        });
        
        // Remove all search params
        router.push(pathname);
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

                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">{t("locationAndPrice")}</h3>
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
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">{t("dateAndTime")}</h3>
                        <FormDateField
                            label={t("date")}
                            name="date"
                            value={filters.date}
                            onChange={(date) => handleFilterChange('date', date as string)}
                        />
                        <div className="flex items-end space-x-2 grid-cols-2 gap-4">
                            <FormTimeField
                                label={t("timeFrom")}
                                name="timeFrom"
                                value={filters.timeFrom}
                                onChange={(e) => handleFilterChange('timeFrom', e.target.value)}
                                disableArrows={true}
                            />
                            <span className="text-sm font-medium mb-3">-</span>
                            <FormTimeField
                                label={t("timeTo")}
                                name="timeTo"
                                value={filters.timeTo}
                                onChange={(e) => handleFilterChange('timeTo', e.target.value)}
                                disableArrows={true}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">{t("matchDetails")}</h3>
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
                </div>
                
                <DialogFooter className='flex w-full justify-between'>
                    <Button variant="outline" onClick={handleClearFilters}>{t("clearFilters")}</Button>
                    <DialogClose asChild>
                        <Button onClick={handleSave}>{t("applyFilters")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};