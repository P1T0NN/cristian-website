// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeleteTeamButton } from "./delete-team-button";

// ACTIONS
import { serverFetchTeams } from "@/actions/functions/data/server/server_fetchTeams";

// TYPES
import type { typesTeam } from "@/types/typesTeam";

type TeamTableProps = {
    authToken: string
}

export const TeamTable = async ({ 
    authToken 
}: TeamTableProps) => {
    const t = await getTranslations("AddTeamPage")

    const response = await serverFetchTeams();
    const teams = response.success ? (response.data as typesTeam[]) : []

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-1/3">{t("teamName")}</TableHead>
                    <TableHead className="w-1/4">{t("teamLevel")}</TableHead>
                    <TableHead className="w-1/4">{t("createdAt")}</TableHead>
                    <TableHead className="w-1/6">{t("actions")}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {teams.map((team) => (
                    <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.team_name}</TableCell>
                        <TableCell>{team.team_level}</TableCell>
                        <TableCell>{new Date(team.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <DeleteTeamButton 
                                authToken={authToken} 
                                teamId={team.id}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}