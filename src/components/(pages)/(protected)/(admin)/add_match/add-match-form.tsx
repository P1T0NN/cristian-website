"use client";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Separator } from "@/components/ui/separator";
import { MatchDetailsSection } from "./match-details-section";
import { TeamNamesSection } from "./team-names-section";
import { DateTimeSection } from "./date-time-section";
import { useTeamSearch } from "./hooks/use-team-search";

// TYPES
import type { typesAddMatchForm } from "@/types/forms/AddMatchForm";
import type { typesLocation } from "@/types/typesLocation";

type AddMatchFormProps = {
    formData: typesAddMatchForm;
    errors: Record<string, string>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setFieldValue: (name: string, value: unknown) => void;
    locationsData: typesLocation[];
    defaultLocationsData: typesLocation[];
}

export const AddMatchForm = ({
    formData,
    errors,
    handleInputChange,
    setFieldValue,
    locationsData,
    defaultLocationsData
}: AddMatchFormProps) => {
    const t = useTranslations("AddMatchPage");

    const {
        team1Query,
        setTeam1Query,
        team2Query,
        setTeam2Query,
        team1Results,
        team2Results,
        isTeam1Open,
        isTeam2Open,
        handleTeamSelect
    } = useTeamSearch(handleInputChange);

    const handleSelectChange = (name: string) => (value: string) => {
        handleInputChange({
            target: { name, value }
        } as React.ChangeEvent<HTMLInputElement>);
    };

    const handleLocationChange = (locationName: string, locationUrl: string, defaultPrice: string | null) => {
        setFieldValue('location', locationName);
        setFieldValue('location_url', locationUrl);
        if (defaultPrice) {
            setFieldValue('price', defaultPrice);
        }
    };

    return (
        <div className="space-y-8">
            <MatchDetailsSection
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                handleLocationChange={handleLocationChange}
                setFieldValue={setFieldValue}
                locationsData={locationsData}
                defaultLocationsData={defaultLocationsData}
            />

            <Separator />

            <TeamNamesSection
                team1Query={team1Query}
                setTeam1Query={setTeam1Query}
                team2Query={team2Query}
                setTeam2Query={setTeam2Query}
                team1Results={team1Results}
                team2Results={team2Results}
                isTeam1Open={isTeam1Open}
                isTeam2Open={isTeam2Open}
                handleTeamSelect={handleTeamSelect}
                errors={errors}
                t={t}
            />

            <Separator />

            <DateTimeSection
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                t={t}
            />
        </div>
    );
};