"use client"

// REACTJS IMPORTS
import { useState, useRef, useEffect, useMemo, useCallback, useTransition } from "react";

// LIBRARIES
import debounce from 'lodash/debounce'; 

// COMPONENTS
import { Input } from "@/components/ui/input";
import { UserSearchResult } from "./user-search-result";

// HOOKS
import { useSearchUsers } from "@/hooks/data/useSearchUsers";

// LUCIDE ICONS
import { Search } from "lucide-react";

type SearchBarProps = {
    authToken: string | undefined;
}

type CachedResult = {
    term: string;
    results: any[];
}

export const SearchBar = ({
    authToken
}: SearchBarProps) => {
    const searchRef = useRef<HTMLDivElement | null>(null);

    const [isPending, startTransition] = useTransition();

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);
    const [cachedResults, setCachedResults] = useState<CachedResult[]>([]);

    const getCachedResults = useCallback((term: string) => {
        const cachedEntry = cachedResults.find(cache => term.startsWith(cache.term));
        if (cachedEntry) {
            // Filter cached results based on the current search term
            return cachedEntry.results.filter(user => 
                user.username.toLowerCase().includes(term.toLowerCase())
            );
        }
        return null;
    }, [cachedResults]);

    const shouldFetch = !getCachedResults(debouncedSearchTerm) && debouncedSearchTerm.length > 1;

    const { data: searchResults, isLoading, error } = useSearchUsers(
        shouldFetch ? debouncedSearchTerm : '', 
        5, 
        authToken
    );

    const debouncedSetSearch = useMemo(
        () => debounce((value: string) => {
            startTransition(() => {
                setDebouncedSearchTerm(value);
            });
        }, 300),
        []
    );

    useEffect(() => {
        debouncedSetSearch(searchTerm);
        return () => debouncedSetSearch.cancel();
    }, [searchTerm, debouncedSetSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (searchResults && shouldFetch) {
            setCachedResults(prev => [...prev, { term: debouncedSearchTerm, results: searchResults.search_users }]);
        }
    }, [searchResults, debouncedSearchTerm, shouldFetch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
    };

    const handleResultClick = () => {
        setIsOpen(false);
        setSearchTerm('');
    };

    const displayResults = getCachedResults(debouncedSearchTerm) || (searchResults?.search_users || []);

    return (
        <div className="relative w-full xl:w-[450px]" ref={searchRef}>
            <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                size={25} 
            />

            <Input
                type="text"
                className="text-white text-md bg-gray-800 rounded-xl w-full h-[50px] pl-12 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-500"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
            />

            {isOpen && searchTerm.length > 1 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-md shadow-lg">
                    {isPending || isLoading ? (
                        <div className="p-2 text-white">Loading...</div>
                    ) : error ? (
                        <div className="p-2 text-red-500">Error: {error}</div>
                    ) : displayResults && displayResults.length > 0 ? (
                        displayResults.map((user) => (
                            <UserSearchResult 
                                key={user.id} 
                                user={user} 
                                onClick={handleResultClick} 
                            />
                        ))
                    ) : ( 
                        !isLoading && debouncedSearchTerm.length >= 2 ? ( 
                            <div className="p-2 text-white">No results found</div>
                        ) : null
                    )}
                </div>
            )}
        </div>
    );
};