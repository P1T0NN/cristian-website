"use client"

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { LocationField } from "./location-field";
import { FormInputField } from "@/components/ui/forms/form-input-field";
import { FormSelectField } from "@/components/ui/forms/form-select-field";

// TYPES
import type { typesAddMatchForm } from "@/types/forms/AddMatchForm";

type AddMatchContentProps = {
    formData: typesAddMatchForm;
    errors: Record<string, string>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    authToken: string;
}

export const AddMatchForm = ({
  formData,
  errors,
  handleInputChange,
  authToken
}: AddMatchContentProps) => {
    const t = useTranslations("AddMatchPage");
  
    const handleSelectChange = (name: string) => (value: string) => {
        handleInputChange({
            target: { name, value }
        } as React.ChangeEvent<HTMLInputElement>);
    };

    // Example match type options
    const matchTypeOptions = [
        { value: 'f7', label: 'f7'},
        { value: 'f8', label: 'f8'},
        { value: 'f11', label: 'f11' },
    ];

    // Example match gender options
    const matchGenderOptions = [
        { value: 'Male', label: t('genderMale') },
        { value: 'Female', label: t('genderFemale') },
        { value: 'Mixed', label: t('genderMixed') }
    ];

    return (
        <div className="flex flex-col space-y-4">
            <LocationField
                value={formData.location}
                onChange={handleInputChange}
                error={errors.location}
                authToken={authToken}
            />

            <FormInputField
                label={t("price")}
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder={t('pricePlaceholder')}
                error={errors.price}
            />

            <FormInputField
                label={t("team1Name")}
                name="team1_name"
                type="text"
                value={formData.team1_name}
                onChange={handleInputChange}
                placeholder={t('team1NamePlaceholder')}
                error={errors.team1_name}
            />
    
            <FormInputField
                label={t("team2Name")}
                name="team2_name"
                type="text"
                value={formData.team2_name}
                onChange={handleInputChange}
                placeholder={t('team2NamePlaceholder')}
                error={errors.team2_name}
            />
    
            <FormInputField
                label={t("date")}
                name="starts_at_day"
                type="date"
                value={formData.starts_at_day}
                onChange={handleInputChange}
                error={errors.starts_at_day}
            />
    
            <FormInputField
                label={t("time")}
                name="starts_at_hour"
                type="time"
                value={formData.starts_at_hour}
                onChange={handleInputChange}
                error={errors.starts_at_hour}
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

            <FormSelectField
                label={t("matchGender")}
                name="match_gender"
                value={formData.match_gender}
                onChange={handleSelectChange('match_gender')}
                options={matchGenderOptions}
                placeholder={t('matchGenderPlaceholder')}
                error={errors.match_gender}
            />
        </div>
    );
};