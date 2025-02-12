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
import { LocationField } from "../add-match/location-field";
import { FormInputField } from "@/shared/components/ui/forms/form-input-field";
import { FormSelectField } from "@/shared/components/ui/forms/form-select-field";
import { FormDateField } from "@/shared/components/ui/forms/form-date-field";
import { FormTimeField } from "@/shared/components/ui/forms/form-time-field";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

// HOOKS
import { useForm } from "@/shared/hooks/useForm";
import { useZodSchemas } from "@/shared/hooks/useZodSchema";

// ACTIONS
import { editMatch } from "../../actions/server_actions/editMatch";

// TYPES
import type { typesAddMatchForm } from "../../types/AddMatchForm";
import type { typesLocation } from "@/features/locations/types/typesLocation";

type EditMatchFormProps = {
    matchData: typesAddMatchForm;
    matchIdFromParams: string;
    locationsData: typesLocation[];
    defaultLocationsData: typesLocation[];
}

export const EditMatchForm = ({
    matchData,
    matchIdFromParams,
    locationsData,
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
            locationUrl: matchData.locationUrl || "",
            price: matchData.price?.toString() || "",
            team1Name: matchData.team1Name || "",
            team2Name: matchData.team2Name || "",
            startsAtDay: matchData.startsAtDay || "",
            startsAtHour: matchData.startsAtHour || "",
            matchType: matchData.matchType || "",
            matchGender: matchData.matchGender || "Male",
            matchDuration: matchData.matchDuration || 60,
            addedBy: matchData.addedBy || "",
            matchLevel: matchData.matchLevel || "",
            hasTeams: false,
            status: matchData.status || "active"
        },
        validationSchema: addMatchSchema,
        onSubmit: async (values) => {
            startTransition(async () => {
                const result = await editMatch({
                    matchIdFromParams: matchIdFromParams, 
                    editMatchData: values
                });
                
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
            target: { name: 'locationUrl', value: locationUrl }
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

    const toggleMatchLevel = (level: string) => {
        const currentLevels = formData.matchLevel.split('');
        const updatedLevels = currentLevels.includes(level)
            ? currentLevels.filter(l => l !== level)
            : [...currentLevels, level].sort();
        handleInputChange({
            target: { name: 'match_level', value: updatedLevels.join('') }
        } as React.ChangeEvent<HTMLInputElement>);
    };

    const isLevelActive = (level: string) => formData.matchLevel.includes(level);

    return (
        <div className="flex flex-col space-y-4">
            <LocationField
                locationName={formData.location}
                locationUrl={formData.locationUrl}
                onLocationChange={handleLocationChange}
                error={errors.location}
                urlError={errors.locationUrl}
                locationsData={locationsData}
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
                        {['A', 'B', 'C', 'D'].map((level) => (
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInputField
                    label={t("team1Name")}
                    name="team1Name"
                    type="text"
                    value={formData.team1Name}
                    onChange={handleInputChange}
                    placeholder={t('team1NamePlaceholder')}
                    error={errors.team1Name}
                />

                <FormInputField
                    label={t("team2Name")}
                    name="team2Name"
                    type="text"
                    value={formData.team2Name}
                    onChange={handleInputChange}
                    placeholder={t('team2NamePlaceholder')}
                    error={errors.team2Name}
                />
            </div>
    
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormDateField
                    label={t("date")}
                    name="startsAtDay"
                    value={formData.startsAtDay}
                    onChange={(date) => handleInputChange({
                        target: { name: "startsAtDay", value: date as string }
                    } as React.ChangeEvent<HTMLInputElement>)}
                    error={errors.startsAtDay}
                />

                <FormTimeField
                    label={t("time")}
                    name="startsAtHour"
                    value={formData.startsAtHour}
                    onChange={handleInputChange}
                    error={errors.startsAtHour}
                    disableArrows={false}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelectField
                    label={t("matchType")}
                    name="matchType"
                    value={formData.matchType}
                    onChange={handleSelectChange('matchType')}
                    options={matchTypeOptions}
                    placeholder={t('matchTypePlaceholder')}
                    error={errors.matchType}
                />

                <FormSelectField
                    label={t("matchGender")}
                    name="matchGender"
                    value={formData.matchGender}
                    onChange={handleSelectChange('matchGender')}
                    options={matchGenderOptions}
                    placeholder={t('matchGenderPlaceholder')}
                    error={errors.matchGender}
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