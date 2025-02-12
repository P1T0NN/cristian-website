// REACTJS IMPORTS
import { useState, useEffect } from "react";

// LIBRARIES
import { useDebounce } from "use-debounce";

// ACTIONS
import { searchTeams } from "../actions/server_actions/searchTeams";

export const useTeamSearch = (handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => {
    const [team1QueryState, setTeam1QueryState] = useState('Equipo 1');
    const [team2QueryState, setTeam2QueryState] = useState('Equipo 2');
    const [team1Results, setTeam1Results] = useState<{ id: string; team_name: string }[]>([]);
    const [team2Results, setTeam2Results] = useState<{ id: string; team_name: string }[]>([]);
    const [isTeam1Open, setIsTeam1Open] = useState(false);
    const [isTeam2Open, setIsTeam2Open] = useState(false);

    const [debouncedTeam1Query] = useDebounce(team1QueryState, 300);
    const [debouncedTeam2Query] = useDebounce(team2QueryState, 300);

    useEffect(() => {
        if (debouncedTeam1Query) {
            searchTeams({ query: debouncedTeam1Query }).then(result => {
                if (result.success && result.data) {
                    setTeam1Results(result.data.teams)
                    setIsTeam1Open(true)
                } else {
                    setTeam1Results([])
                }
            }).catch(() => {
                setTeam1Results([])
            })
        } else {
            setTeam1Results([])
            setIsTeam1Open(false)
        }
    }, [debouncedTeam1Query])

    useEffect(() => {
        if (debouncedTeam2Query) {
            searchTeams({ query: debouncedTeam2Query }).then(result => {
                if (result.success && result.data) {
                    setTeam2Results(result.data.teams)
                    setIsTeam2Open(true)
                } else {
                    setTeam2Results([])
                }
            }).catch(() => {
                setTeam2Results([])
            })
        } else {
            setTeam2Results([])
            setIsTeam2Open(false)
        }
    }, [debouncedTeam2Query])

    const setTeam1Query = (query: string) => {
        setTeam1QueryState(query);
        setIsTeam1Open(query.length > 0);
        setIsTeam2Open(false);
        handleInputChange({ target: { name: 'team1Name', value: query } } as React.ChangeEvent<HTMLInputElement>);
    };

    const setTeam2Query = (query: string) => {
        setTeam2QueryState(query);
        setIsTeam2Open(query.length > 0);
        setIsTeam1Open(false);
        handleInputChange({ target: { name: 'team2Name', value: query } } as React.ChangeEvent<HTMLInputElement>);
    };

    useEffect(() => {
        handleInputChange({ target: { name: 'team1Name', value: 'Equipo 1' } } as React.ChangeEvent<HTMLInputElement>);
        handleInputChange({ target: { name: 'team2Name', value: 'Equipo 2' } } as React.ChangeEvent<HTMLInputElement>);
    }, []);

    const handleTeamSelect = (team: string, teamName: string) => {
        handleInputChange({
            target: { name: team, value: teamName }
        } as React.ChangeEvent<HTMLInputElement>);
        if (team === 'team1Name') {
            setTeam1Query(teamName);
            setIsTeam1Open(false);
        } else {
            setTeam2Query(teamName);
            setIsTeam2Open(false);
        }
    };

    return {
        team1Query: team1QueryState,
        setTeam1Query,
        team2Query: team2QueryState,
        setTeam2Query,
        team1Results,
        team2Results,
        isTeam1Open,
        isTeam2Open,
        handleTeamSelect
    };
};