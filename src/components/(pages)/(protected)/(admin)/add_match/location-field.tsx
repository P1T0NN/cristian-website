"use client"

// REACTJS IMPORTS
import { useState, useRef } from "react";

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchDropdown } from "@/components/ui/search-dropdown/search-dropdown";

// ACTIONS
import { client_fetchLocations } from "@/actions/functions/data/client/location/client_fetchLocations";

// TYPES
import type { typesLocation } from "@/types/typesLocation";

// LUCIDE ICONS
import { Plus } from "lucide-react";

type LocationFieldProps = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    authToken: string;
};

export const LocationField = ({ 
    value, 
    onChange, 
    error, 
    authToken, 
}: LocationFieldProps) => {
    const t = useTranslations("AddMatchPage");
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    const handleRedirectToAddLocation = () => {
        router.push(PAGE_ENDPOINTS.ADD_LOCATION_PAGE);
    };

    const handleLocationSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event);
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (event.target.value.length > 0) {
            searchTimeoutRef.current = setTimeout(() => {
                setShowDropdown(true);
            }, 500);
        } else {
            setShowDropdown(false);
        }
    };

    const handleLocationSelect = (locationName: string) => {
        const event = {
            target: {
                name: 'location',
                value: locationName
            }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(event);
        setShowDropdown(false);
    };

    return (
        <div className="relative space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="location" className="text-sm font-medium">{t("location")}</Label>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRedirectToAddLocation}
                    className="flex items-center space-x-1"
                >
                    <Plus className="w-4 h-4" />
                    <span>{t("addNewLocation")}</span>
                </Button>
            </div>

            <div className="relative">
                <Input
                    type="text"
                    id="location"
                    name="location"
                    value={value}
                    onChange={handleLocationSearch}
                    placeholder={t('locationPlaceholder')}
                    autoComplete="off"
                    className="w-full"
                />
                <SearchDropdown<typesLocation>
                    authToken={authToken}
                    searchTerm={value}
                    isDropdownOpen={showDropdown}
                    setIsDropdownOpen={setShowDropdown}
                    onSelect={handleLocationSelect}
                    fetchData={client_fetchLocations}
                    getDisplayValue={(location) => location.location_name}
                    queryKey="locations"
                />
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
    );
};