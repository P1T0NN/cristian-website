// COMPONENTS
import { LocationField } from "./location-field";
import { FormInputField } from "@/components/ui/forms/form-input-field";
import { FormSelectField } from "@/components/ui/forms/form-select-field";

// TYPES
import type { typesAddMatchForm } from "@/types/forms/AddMatchForm";

type MatchDetailsSectionProps = {
    formData: typesAddMatchForm;
    errors: Record<string, string>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (name: string) => (value: string) => void;
    handleLocationChange: (locationName: string, locationUrl: string) => void;
    authToken: string;
    t: (key: string) => string;
}

export const MatchDetailsSection = ({
    formData,
    errors,
    handleInputChange,
    handleSelectChange,
    handleLocationChange,
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
                authToken={authToken}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInputField
                    label={t("price")}
                    name="price"
                    type="number"
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
                label={t("match_duration")}
                name="match_duration"
                type="number"
                value={formData.match_duration}
                onChange={handleInputChange}
                placeholder={t('matchDurationPlaceholder')}
                error={errors.match_duration}
            />
        </div>
    );
};