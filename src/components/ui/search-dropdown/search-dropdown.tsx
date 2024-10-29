"use client";

// REACTJS IMPORTS
import { useRef, useEffect, useMemo } from "react";

// LIBRARIES
import { useQuery } from "@tanstack/react-query";

// COMPONENTS
import { Card } from "@/components/ui/card";

// TYPES
import { APIResponse } from '@/types/responses/APIResponse';

type SearchDropdownProps<T> = {
    authToken: string;
    searchTerm: string;
    isDropdownOpen: boolean;
    setIsDropdownOpen: (value: boolean) => void;
    onSelect: (value: T) => void;
    fetchData: (authToken: string, searchTerm: string) => Promise<APIResponse>;
    getDisplayValue: (item: T) => string;
    queryKey: string;
};

export const SearchDropdown = <T,>({
    authToken,
    searchTerm,
    isDropdownOpen,
    setIsDropdownOpen,
    onSelect,
    fetchData,
    getDisplayValue,
    queryKey,
}: SearchDropdownProps<T>) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, isLoading, error } = useQuery<APIResponse, Error>({
        queryKey: [queryKey, searchTerm && searchTerm.charAt(0)],
        queryFn: async () => {
            if (!searchTerm) {
                return { success: false, message: "No search term", data: [] };
            }
            return fetchData(authToken, searchTerm.charAt(0));
        },
        enabled: !!searchTerm && searchTerm.length > 0 && isDropdownOpen,
        staleTime: 30000,
        gcTime: 300000,
    });

    const filteredItems = useMemo(() => {
        const items = (data?.data as T[]) || [];
        return searchTerm
            ? items.filter(item => 
                getDisplayValue(item).toLowerCase().startsWith(searchTerm.toLowerCase())
              )
            : [];
    }, [data, searchTerm, getDisplayValue]);

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
            {isLoading ? (
                <div className="p-2 text-sm text-gray-500">Loading...</div>
            ) : error ? (
                <div className="p-2 text-sm text-red-500">Error loading items</div>
            ) : filteredItems.length > 0 ? (
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
                <div className="p-2 text-sm text-gray-500">No items found</div>
            )}
        </Card>
    );
};