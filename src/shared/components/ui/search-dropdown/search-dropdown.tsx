"use client";

// REACTJS IMPORTS
import { useRef, useEffect, useMemo } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Card } from "@/shared/components/ui/card";

type SearchDropdownProps<T> = {
    searchTerm: string;
    isDropdownOpen: boolean;
    setIsDropdownOpen: (value: boolean) => void;
    onSelect: (value: T) => void;
    items: T[];
    getDisplayValue: (item: T) => string;
};

export const SearchDropdown = <T,>({
    searchTerm,
    isDropdownOpen,
    setIsDropdownOpen,
    onSelect,
    items,
    getDisplayValue,
}: SearchDropdownProps<T>) => {
    const t = useTranslations("AddMatchPage")

    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredItems = useMemo(() => {
        return searchTerm
            ? items.filter(item => 
                getDisplayValue(item).toLowerCase().startsWith(searchTerm.toLowerCase())
              )
            : [];
    }, [items, searchTerm, getDisplayValue]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsDropdownOpen]);

    if (!isDropdownOpen || !searchTerm) return null;

    return (
        <Card 
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 max-h-60 overflow-auto shadow-lg"
        >
            {filteredItems.length > 0 ? (
                <div className="py-1">
                    {filteredItems.map((item, index) => (
                        <div
                            key={index}
                            className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => onSelect(item)}
                        >
                            {getDisplayValue(item)}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-2 text-sm text-gray-500">{t('noItemsFound')}</div>
            )}
        </Card>
    );
};