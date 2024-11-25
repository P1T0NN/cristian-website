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

type AddMatchFormProps = {
    formData: typesAddMatchForm;
    errors: Record<string, string>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    authToken: string;
    setFieldValue: (name: string, value: unknown) => void;
}

export const AddMatchForm = ({
    formData,
    errors,
    handleInputChange,
    authToken,
    setFieldValue
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
    } = useTeamSearch(authToken, handleInputChange);

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

    return (
        <div className="space-y-8">
            <MatchDetailsSection
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                handleLocationChange={handleLocationChange}
                setFieldValue={setFieldValue}
                authToken={authToken}
                t={t}
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