// COMPONENTS
import { FormInputField } from "@/shared/components/ui/forms/form-input-field";
import { Button } from "@/shared/components/ui/button";

type TeamNamesSectionProps = {
    team1Query: string;
    setTeam1Query: (query: string) => void;
    team2Query: string;
    setTeam2Query: (query: string) => void;
    team1Results: { id: string; team_name: string }[];
    team2Results: { id: string; team_name: string }[];
    isTeam1Open: boolean;
    isTeam2Open: boolean;
    handleTeamSelect: (team: string, teamName: string) => void;
    errors: Record<string, string>;
    t: (key: string) => string;
}

export const TeamNamesSection = ({
    team1Query,
    setTeam1Query,
    team2Query,
    setTeam2Query,
    team1Results,
    team2Results,
    isTeam1Open,
    isTeam2Open,
    handleTeamSelect,
    errors,
    t
}: TeamNamesSectionProps) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("teamNames")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <FormInputField
                        label={t("team1Name")}
                        name="team1_name"
                        type="text"
                        value={team1Query}
                        onChange={(e) => setTeam1Query(e.target.value)}
                        placeholder={t('team1NamePlaceholder')}
                        error={errors.team1_name}
                    />
                    {isTeam1Open && team1Results.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-popover rounded-md shadow-md max-h-60 overflow-auto border border-border">
                            {team1Results.map((team) => (
                                <Button
                                    key={team.id}
                                    variant="ghost"
                                    className="w-full justify-start font-normal"
                                    onClick={() => handleTeamSelect('team1_name', team.team_name)}
                                >
                                    {team.team_name}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="relative">
                    <FormInputField
                        label={t("team2Name")}
                        name="team2_name"
                        type="text"
                        value={team2Query}
                        onChange={(e) => setTeam2Query(e.target.value)}
                        placeholder={t('team2NamePlaceholder')}
                        error={errors.team2_name}
                    />
                    {isTeam2Open && team2Results.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-popover rounded-md shadow-md max-h-60 overflow-auto border border-border">
                            {team2Results.map((team) => (
                                <Button
                                    key={team.id}
                                    variant="ghost"
                                    className="w-full justify-start font-normal"
                                    onClick={() => handleTeamSelect('team2_name', team.team_name)}
                                >
                                    {team.team_name}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};