"use client";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { LocationField } from "./location-field";
import { FormInputField } from "@/components/ui/forms/form-input-field";
import { FormSelectField } from "@/components/ui/forms/form-select-field";
import { FormDateField } from "@/components/ui/forms/form-date-field";
import { FormTimeField } from "@/components/ui/forms/form-time-field";
import { Separator } from "@/components/ui/separator";

// TYPES
import type { typesAddMatchForm } from "@/types/forms/AddMatchForm";

type AddMatchFormProps = {
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
}: AddMatchFormProps) => {
    const t = useTranslations("AddMatchPage");

    const handleSelectChange = (name: string) => (value: string) => {
        handleInputChange({
            target: { name, value }
        } as React.ChangeEvent<HTMLInputElement>);
    };

    const handleLocationChange = (locationName: string, locationUrl: string) => {
        handleInputChange({
            target: { name: 'location', value: locationName }
        } as React.ChangeEvent<HTMLInputElement>);
        handleInputChange({
            target: { name: 'location_url', value: locationUrl }
        } as React.ChangeEvent<HTMLInputElement>);
    };

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
        <div className="space-y-8">
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
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t("teamNames")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t("dateAndTime")}</h3>
                <FormDateField
                    label={t("date")}
                    name="starts_at_day"
                    value={formData.starts_at_day}
                    onChange={(date) => handleInputChange({
                        target: { name: "starts_at_day", value: date as string }
                    } as React.ChangeEvent<HTMLInputElement>)}
                    error={errors.starts_at_day}
                />
                <FormTimeField
                    label={t("time")}
                    name="starts_at_hour"
                    value={formData.starts_at_hour}
                    onChange={handleInputChange}
                    error={errors.starts_at_hour}
                />
            </div>
        </div>
    );
};