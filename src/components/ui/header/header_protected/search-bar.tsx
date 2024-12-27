'use client'

// REACTJS IMPORTS
import { useState, useEffect, useRef } from 'react';

// NEXTJS IMPORTS
import Link from 'next/link';

// LIBRARIES
import { useDebounce } from 'use-debounce';

// CONFIG
import { ADMIN_PAGE_ENDPOINTS, PROTECTED_PAGE_ENDPOINTS } from '@/config';

// COMPONENTS
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// SERVER ACTIONS
import { searchBar } from '@/actions/server_actions/mutations/header/searchBar';

// LUCIDE ICONS
import { Search } from 'lucide-react';

type SearchResult = {
    users: { id: string; fullName: string }[];
    teams: { id: string; team_name: string }[];
}

export function SearchBar() {
    const searchRef = useRef<HTMLDivElement>(null);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult>({ users: [], teams: [] });
    const [isOpen, setIsOpen] = useState(false);

    const [debouncedQuery] = useDebounce(query, 300);

    useEffect(() => {
        if (debouncedQuery) {
            searchBar({ query: debouncedQuery }).then(result => {
                if (result.success && result.data) {
                    setResults(result.data)
                    setIsOpen(true)
                } else {
                    setResults({ users: [], teams: [] })
                }
            }).catch(() => {
                setResults({ users: [], teams: [] })
            })
        } else {
            setResults({ users: [], teams: [] })
            setIsOpen(false)
        }
    }, [debouncedQuery])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
        if (e.target.value) {
            setIsOpen(true)
        }
    }

    const handleItemClick = () => {
        setQuery('');
        setIsOpen(false);
    }

    return (
        <div ref={searchRef} className="relative w-full">
            <div className="relative">
                <Input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search players or teams..."
                    className="pr-10 h-9 sm:h-10"
                    aria-expanded={isOpen}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {isOpen && (results.users.length > 0 || results.teams.length > 0) && (
                <div className="absolute z-10 w-full mt-1 bg-popover rounded-md shadow-md max-h-60 overflow-auto border border-border">
                    {results.users.length > 0 && (
                        <div>
                            <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">Players</h3>
                            {results.users.map((user) => (
                                <Button
                                    key={user.id}
                                    variant="ghost"
                                    className="w-full justify-start font-normal text-sm"
                                    asChild
                                >
                                    <Link 
                                        href={`${PROTECTED_PAGE_ENDPOINTS.PLAYER_PAGE}/${user.id}`}
                                        onClick={handleItemClick}
                                    >
                                        {user.fullName}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    )}
                    {results.teams.length > 0 && (
                        <div>
                            <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">Teams</h3>
                            {results.teams.map((team) => (
                                <Button
                                    key={team.id}
                                    variant="ghost"
                                    className="w-full justify-start font-normal text-sm"
                                    asChild
                                >
                                    <Link 
                                        href={`${ADMIN_PAGE_ENDPOINTS.TEAM_PAGE}/${team.id}`}
                                        onClick={handleItemClick}
                                    >
                                        {team.team_name}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}