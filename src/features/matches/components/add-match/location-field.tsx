"use client"

// REACTJS IMPORTS
import { useState, useRef } from "react";

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { ADMIN_PAGE_ENDPOINTS} from "@/config";

// COMPONENTS
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { SearchDropdown } from "@/shared/components/ui/search-dropdown/search-dropdown";

// TYPES
import type { typesLocation } from "@/features/locations/types/typesLocation";

// LUCIDE ICONS
import { Plus } from "lucide-react";

type LocationFieldProps = {
    locationName: string;
    locationUrl: string;
    onLocationChange: (locationName: string, locationUrl: string, defaultPrice: string | null) => void
    error?: string;
    urlError?: string;
    locationsData: typesLocation[];
    defaultLocationsData: typesLocation[];
};

export const LocationField = ({ 
    locationName, 
    locationUrl,
    onLocationChange, 
    error, 
    urlError,
    locationsData,
    defaultLocationsData
}: LocationFieldProps) => {
    const t = useTranslations("AddMatchPage");
    const router = useRouter();

    const [showDropdown, setShowDropdown] = useState(false);
    const [isLocationSelected, setIsLocationSelected] = useState(false);

    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    const handleRedirectToAddLocation = () => {
        router.push(ADMIN_PAGE_ENDPOINTS.ADD_LOCATION_PAGE);
    };

    const handleLocationSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        onLocationChange(event.target.value, locationUrl, null);
        setIsLocationSelected(false);
        
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

    const handleLocationUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onLocationChange(locationName, event.target.value, null);
    };

    const handleLocationSelect = (location: typesLocation) => {
        onLocationChange(location.location_name, location.location_url, location.default_price);
        setShowDropdown(false);
        setIsLocationSelected(true);
    };

    const handleDefaultLocationSelect = (location: typesLocation) => {
        onLocationChange(location.location_name, location.location_url, location.default_price);
        setIsLocationSelected(true);
    };

    return (
        <div className="relative space-y-4">
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

            {defaultLocationsData.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {defaultLocationsData.map((location) => (
                        <Button
                            key={location.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleDefaultLocationSelect(location)}
                        >
                            {location.location_name}
                        </Button>
                    ))}
                </div>
            )}

            <div className="relative">
                <Input
                    type="text"
                    id="location"
                    name="location"
                    value={locationName}
                    onChange={handleLocationSearch}
                    placeholder={t('locationPlaceholder')}
                    autoComplete="off"
                    className="w-full"
                />

                <SearchDropdown<typesLocation>
                    searchTerm={locationName}
                    isDropdownOpen={showDropdown}
                    setIsDropdownOpen={setShowDropdown}
                    onSelect={handleLocationSelect}
                    items={locationsData}
                    getDisplayValue={(location) => location.location_name}
                />
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

            <div>
                <Label htmlFor="locationUrl" className="text-sm font-medium">{t("locationUrl")}</Label>
                <Input
                    type="text"
                    id="locationUrl"
                    name="locationUrl"
                    value={locationUrl}
                    onChange={handleLocationUrlChange}

                    readOnly={isLocationSelected}
                    className={`w-full mt-1 ${isLocationSelected ? 'bg-gray-100' : ''}`}
                    placeholder={t('locationUrlPlaceholder')}
                />
                {urlError && <p className="text-sm text-red-500 mt-1">{urlError}</p>}
            </div>
        </div>
    );
};