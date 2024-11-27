// COMPONENTS
import { LocationField } from "./location-field";
import { FormInputField } from "@/components/ui/forms/form-input-field";
import { FormSelectField } from "@/components/ui/forms/form-select-field";
import { Button } from "@/components/ui/button";

// TYPES
import type { typesAddMatchForm } from "@/types/forms/AddMatchForm";

// LUCIDE ICONS
import { Check, X } from 'lucide-react';

type MatchDetailsSectionProps = {
    formData: typesAddMatchForm;
    errors: Record<string, string>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (name: string) => (value: string) => void;
    handleLocationChange: (locationName: string, locationUrl: string) => void;
    setFieldValue: (name: string, value: unknown) => void;
    authToken: string;
    t: (key: string) => string;
}

export const MatchDetailsSection = ({
    formData,
    errors,
    handleInputChange,
    handleSelectChange,
    handleLocationChange,
    setFieldValue,
    authToken,
    t
}: MatchDetailsSectionProps) => {
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

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("matchDetails")}</h3>
            <LocationField
                locationName={formData.location}
                locationUrl={formData.location_url}
                onLocationChange={handleLocationChange}
                error={errors.location}
                urlError={errors.location_url}
                authToken={authToken}
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
                    name="match_type"
                    value={formData.match_type}
                    onChange={handleSelectChange('match_type')}
                    options={matchTypeOptions}
                    placeholder={t('matchTypePlaceholder')}
                    error={errors.match_type}
                />
            </div>
            <FormSelectField
                label={t("matchGender")}
                name="match_gender"
                value={formData.match_gender}
                onChange={handleSelectChange('match_gender')}
                options={matchGenderOptions}
                placeholder={t('matchGenderPlaceholder')}
                error={errors.match_gender}
            />
            <FormInputField
                label={t("matchDuration")}
                name="match_duration"
                type="number"
                value={formData.match_duration}
                onChange={handleInputChange}
                placeholder={t('matchDurationPlaceholder')}
                error={errors.match_duration}
            />
            <FormInputField
                label={t("matchLevel")}
                name="match_level"
                type="text"
                value={formData.match_level}
                onChange={handleInputChange}
                placeholder={t('matchLevelPlaceholder')}
                error={errors.match_level}
            />
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t("hasTeams")}
                </label>
                <div className="flex space-x-2">
                    <Button
                        type="button"
                        variant={formData.has_teams ? "default" : "outline"}
                        onClick={() => setFieldValue('has_teams', true)}
                    >
                        <Check className="mr-2 h-4 w-4" />
                        {t("yes")}
                    </Button>
                    <Button
                        type="button"
                        variant={!formData.has_teams ? "default" : "outline"}
                        onClick={() => setFieldValue('has_teams', false)}
                    >
                        <X className="mr-2 h-4 w-4" />
                        {t("no")}
                    </Button>
                </div>
                {errors.has_teams && (
                    <p className="text-sm text-red-500 mt-1">{errors.has_teams}</p>
                )}
            </div>
        </div>
    );
};