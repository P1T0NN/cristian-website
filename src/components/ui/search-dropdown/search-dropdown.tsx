"use client";

// REACTJS IMPORTS
import { useRef, useEffect } from "react";

// LIBRARIES
import { useQuery } from "@tanstack/react-query";

// COMPONENTS
import { Card } from "@/components/ui/card";

// ACTIONS
import { client_fetchUsers } from "@/actions/functions/data/client/debt/client_fetchUsers";

// TYPES
import { APIResponse } from '@/types/responses/APIResponse';

type SearchDropdownProps = {
    authToken: string;
    searchTerm: string;
    isDropdownOpen: boolean;
    setIsDropdownOpen: (value: boolean) => void;
    onSelect: (value: string) => void;
};

type User = {
    fullName: string;
};

export const SearchDropdown = ({
    authToken,
    searchTerm,
    isDropdownOpen,
    setIsDropdownOpen,
    onSelect,
}: SearchDropdownProps) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, isLoading, error } = useQuery<APIResponse>({
        queryKey: ['users', searchTerm],
        queryFn: () => client_fetchUsers(authToken, searchTerm),
        enabled: searchTerm.length > 0 && isDropdownOpen,
        staleTime: 30000,
        gcTime: 300000,
    });

    // Extract users array from the API response
    const users = (data?.data as User[]) || [];
    const filteredUsers = users.filter(user => 
        user.fullName.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsDropdownOpen]);

    if (!isDropdownOpen) return null;

    return (
        <Card 
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 max-h-60 overflow-auto shadow-lg"
        >
            {isLoading ? (
                <div className="p-2 text-sm text-gray-500">Loading...</div>
            ) : error ? (
                <div className="p-2 text-sm text-red-500">Error loading users</div>
            ) : filteredUsers.length > 0 ? (
                <div className="py-1">
                    {filteredUsers.map((user, index) => (
                        <div
                            key={index}
                            className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => onSelect(user.fullName)}
                        >
                            {user.fullName}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-2 text-sm text-gray-500">No users found</div>
            )}
        </Card>
    );
};