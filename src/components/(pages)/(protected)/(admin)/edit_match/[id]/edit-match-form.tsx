"use client";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { LocationField } from "@/components/(pages)/(protected)/(admin)/add_match/location-field";
import { FormInputField } from "@/components/ui/forms/form-input-field";
import { FormSelectField } from "@/components/ui/forms/form-select-field";
import { FormDateField } from "@/components/ui/forms/form-date-field";
import { Button } from "@/components/ui/button";

// HOOKS
import { useForm } from "@/hooks/useForm";
import { useZodSchemas } from "@/hooks/useZodSchema";

// TYPES
import { typesAddMatchForm } from "@/types/forms/AddMatchForm";

type EditMatchFormProps = {
    matchData: typesAddMatchForm;
    onSubmit: (values: typesAddMatchForm) => Promise<void>;
    isPending: boolean;
    authToken: string;
}

export const EditMatchForm = ({
    matchData,
    onSubmit,
    isPending,
    authToken
}: EditMatchFormProps) => {
    const t = useTranslations("AddMatchPage");
    const editMatchMessages = useTranslations("EditMatchPage");

    const { addMatchSchema } = useZodSchemas();

    const { formData, errors, handleInputChange, handleSubmit } = useForm({
        initialValues: {
            location: matchData.location || "",
            price: matchData.price || 0,
            team1_name: matchData.team1_name || "",
            team2_name: matchData.team2_name || "",
            starts_at_day: matchData.starts_at_day || "",
            starts_at_hour: matchData.starts_at_hour || "",
            match_type: matchData.match_type || "",
            match_gender: matchData.match_gender || "",
            added_by: matchData.added_by || ""
        },
        validationSchema: addMatchSchema,
        onSubmit: (values) => onSubmit(values),
    });
  
    const handleSelectChange = (name: string) => (value: string) => {
        handleInputChange({
            target: { name, value }
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
    
            <FormDateField
                label={t("date")}
                name="starts_at_day"
                value={formData.starts_at_day}
                onChange={(date) => handleInputChange({
                    target: { name: "starts_at_day", value: date as string }
                } as React.ChangeEvent<HTMLInputElement>)}
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

            <Button 
                onClick={handleSubmit}
                disabled={isPending}
                className="w-full font-bold mt-4"
            >
                {isPending ? editMatchMessages('updating') : editMatchMessages('updateMatch')}
            </Button>
        </div>
    );
};