"use client";

// REACTJS IMPORTS
import { useTransition } from "react";

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { LocationField } from "@/components/(pages)/(protected)/(admin)/add_match/location-field";
import { FormInputField } from "@/components/ui/forms/form-input-field";
import { FormSelectField } from "@/components/ui/forms/form-select-field";
import { FormDateField } from "@/components/ui/forms/form-date-field";
import { FormTimeField } from "@/components/ui/forms/form-time-field";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// HOOKS
import { useForm } from "@/hooks/useForm";
import { useZodSchemas } from "@/hooks/useZodSchema";

// ACTIONS
import { editMatch } from "@/actions/server_actions/mutations/match/editMatch";

// TYPES
import type { typesAddMatchForm } from "@/types/forms/AddMatchForm";
import type { typesLocation } from "@/types/typesLocation";

type EditMatchFormProps = {
    matchData: typesAddMatchForm;
    authToken: string;
    matchId: string;
    defaultLocationsData: typesLocation[];
}

export const EditMatchForm = ({
    matchData,
    authToken,
    matchId,
    defaultLocationsData
}: EditMatchFormProps) => {
    const t = useTranslations("AddMatchPage");
    const editMatchMessages = useTranslations("EditMatchPage");
    const router = useRouter();
    
    const [isPending, startTransition] = useTransition();

    const { addMatchSchema } = useZodSchemas();

    const { formData, errors, handleInputChange, handleSubmit } = useForm({
        initialValues: {
            location: matchData.location || "",
            location_url: matchData.location_url || "",
            price: matchData.price?.toString() || "",
            team1_name: matchData.team1_name || "",
            team2_name: matchData.team2_name || "",
            starts_at_day: matchData.starts_at_day || "",
            starts_at_hour: matchData.starts_at_hour || "",
            match_type: matchData.match_type || "",
            match_gender: matchData.match_gender || "Male",
            match_duration: matchData.match_duration || 60,
            added_by: matchData.added_by || "",
            match_level: matchData.match_level || "",
            has_teams: false
        },
        validationSchema: addMatchSchema,
        onSubmit: async (values) => {
            startTransition(async () => {
                const result = await editMatch(authToken, matchId, values);
                
                if (result.success) {
                    router.push(PROTECTED_PAGE_ENDPOINTS.HOME_PAGE);
                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            });
        },
    });
  
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
        <div className="flex flex-col space-y-4">
            <LocationField
                locationName={formData.location}
                locationUrl={formData.location_url}
                onLocationChange={handleLocationChange}
                error={errors.location}
                urlError={errors.location_url}
                authToken={authToken}
                defaultLocationsData={defaultLocationsData}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInputField
                    label={t("price")}
                    name="price"
                    type="text"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder={t('pricePlaceholder')}
                    error={errors.price}
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    disableArrows={false}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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