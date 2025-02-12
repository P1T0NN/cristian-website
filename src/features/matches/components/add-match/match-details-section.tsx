"use client"

// LIBRARIESA
import { useTranslations } from "next-intl";

// COMPONENTS
import { LocationField } from "./location-field";
import { FormInputField } from "@/shared/components/ui/forms/form-input-field";
import { FormSelectField } from "@/shared/components/ui/forms/form-select-field";
import { Button } from "@/shared/components/ui/button";

// TYPES
import type { typesAddMatchForm } from "../../types/AddMatchForm";
import type { typesLocation } from "@/features/locations/types/typesLocation";

// LUCIDE ICONS
import { Check, X } from 'lucide-react';

type MatchDetailsSectionProps = {
    formData: typesAddMatchForm;
    errors: Record<string, string>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (name: string) => (value: string) => void;
    handleLocationChange: (locationName: string, locationUrl: string, defaultPrice: string | null) => void;
    setFieldValue: (name: string, value: unknown) => void;
    locationsData: typesLocation[];
    defaultLocationsData: typesLocation[];
}

export const MatchDetailsSection = ({
    formData,
    errors,
    handleInputChange,
    handleSelectChange,
    handleLocationChange,
    setFieldValue,
    locationsData,
    defaultLocationsData,
}: MatchDetailsSectionProps) => {
    const t = useTranslations("AddMatchPage");

    const matchTypeOptions = [
        { value: 'F7', label: 'F7'},
        { value: 'F8', label: 'F8'},
        { value: 'F11', label: 'F11' },
    ];

    const matchGenderOptions = [
        { value: 'Male', label: t('genderMale') },
        { value: 'Female', label: t('genderFemale') },
        { value: 'Mixed', label: t('genderMixed') }
    ];

    const handleLocationChangeWithPrice = (locationName: string, locationUrl: string, defaultPrice: string | null) => {
        handleLocationChange(locationName, locationUrl, defaultPrice);
        if (defaultPrice) {
            setFieldValue('price', defaultPrice);
        }
    };

    const toggleMatchLevel = (level: string) => {
        const currentLevels = formData.matchLevel.split('');
        const updatedLevels = currentLevels.includes(level)
            ? currentLevels.filter(l => l !== level)
            : [...currentLevels, level].sort();
        setFieldValue('matchLevel', updatedLevels.join(''));
    };
    
    const isLevelActive = (level: string) => formData.matchLevel.includes(level);

    // TODO: Fix matchLevel

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("matchDetails")}</h3>
            <LocationField
                locationName={formData.location}
                locationUrl={formData.locationUrl}
                onLocationChange={handleLocationChangeWithPrice}
                error={errors.location}
                urlError={errors.locationUrl}
                locationsData={locationsData}
                defaultLocationsData={defaultLocationsData}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInputField
                    label={t("price")}
                    name="price"
                    type="text"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder={t('pricePlaceholder')}
                    error={errors.price}
                />
                <FormSelectField
                    label={t("matchType")}
                    name="matchType"
                    value={formData.matchType}
                    onChange={handleSelectChange('matchType')}
                    options={matchTypeOptions}
                    placeholder={t('matchTypePlaceholder')}
                    error={errors.matchType}
                />
            </div>
            <FormSelectField
                label={t("matchGender")}
                name="matchGender"
                value={formData.matchGender}
                onChange={handleSelectChange('matchGender')}
                options={matchGenderOptions}
                placeholder={t('matchGenderPlaceholder')}
                error={errors.matchGender}
            />
            <FormInputField
                label={t("matchDuration")}
                name="matchDuration"
                type="number"
                value={formData.matchDuration}
                onChange={handleInputChange}
                placeholder={t('matchDurationPlaceholder')}
                error={errors.matchDuration}
            />
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t("matchLevel")}
                </label>

                <div className="flex space-x-2">
                    {['A', 'B', 'C', 'D', 'X'].map((level) => (
                        <Button
                            key={level}
                            type="button"
                            variant={isLevelActive(level) ? "default" : "outline"}
                            onClick={() => toggleMatchLevel(level)}
                        >
                            {level}
                        </Button>
                    ))}
                </div>
                {errors.matchLevel && (
                    <p className="text-sm text-red-500 mt-1">{errors.matchLevel}</p>
                )}
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t("hasTeams")}
                </label>
                <div className="flex space-x-2">
                    <Button
                        type="button"
                        variant={formData.hasTeams ? "default" : "outline"}
                        onClick={() => setFieldValue('hasTeams', true)}
                    >
                        <Check className="mr-2 h-4 w-4" />

                        {t("yes")}
                    </Button>
                    <Button
                        type="button"
                        variant={!formData.hasTeams ? "default" : "outline"}
                        onClick={() => setFieldValue('hasTeams', false)}
                    >
                        <X className="mr-2 h-4 w-4" />
                        {t("no")}
                    </Button>
                </div>
                {errors.hasTeams && (
                    <p className="text-sm text-red-500 mt-1">{errors.hasTeams}</p>
                )}
            </div>
        </div>
    );
};