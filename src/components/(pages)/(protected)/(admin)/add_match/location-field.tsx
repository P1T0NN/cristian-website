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
        <div className="relative w-[450px] h-[80px] space-y-1">
            <div className="flex items-center space-x-3">
                <Label htmlFor="location">{t("location")}</Label>
                <Button 
                    variant="outline" 
                    className="w-[30px] h-[30px]"
                    onClick={handleRedirectToAddLocation}
                >
                    <Plus />
                </Button>
            </div>

            <Input
                type="text"
                name="location"
                value={value}
                onChange={handleLocationSearch}
                placeholder={t('locationPlaceholder')}
                autoComplete="off"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}

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
    );
};