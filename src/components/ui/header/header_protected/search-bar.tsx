"use client"

// REACTJS IMPORTS
import { useState, useRef, useEffect, useMemo, useCallback, useTransition } from "react";

// LIBRARIES
import debounce from 'lodash/debounce'; 
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Input } from "@/components/ui/input";
import { UserSearchResult } from "./user-search-result";

// HOOKS
import { useSearchUsers } from "@/hooks/useSearchUsers";

// TYPES
import { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Search } from "lucide-react";

type SearchBarProps = {
    authToken: string | undefined;
}

type CachedResult = {
    term: string;
    results: typesUser[];
}

export const SearchBar = ({
    authToken
}: SearchBarProps) => {
    const t = useTranslations('Header');
    const searchRef = useRef<HTMLDivElement | null>(null);

    const [isPending, startTransition] = useTransition();

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);
    const [cachedResults, setCachedResults] = useState<CachedResult[]>([]);

    const getCachedResults = useCallback((term: string) => {
        const lowerTerm = term.toLowerCase();
        const cachedEntry = cachedResults.find(cache => lowerTerm.startsWith(cache.term.toLowerCase()));
        if (cachedEntry) {
            return cachedEntry.results.filter(user => 
                user.fullName.toLowerCase().includes(lowerTerm)
            );
        }
        return null;
    }, [cachedResults]);

    const shouldFetch = !getCachedResults(debouncedSearchTerm) && debouncedSearchTerm.length > 1;

    const { data: searchResults, isLoading, error } = useSearchUsers(
        shouldFetch ? debouncedSearchTerm : '', 
        7, 
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
        if (searchResults && searchResults.success && shouldFetch) {
            setCachedResults(prev => [...prev, { term: debouncedSearchTerm, results: searchResults.data }]);
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

    const displayResults = getCachedResults(debouncedSearchTerm) || (searchResults?.success ? searchResults.data : []);

    return (
        <div ref={searchRef} className="relative w-full max-w-xl">
            <div className="flex items-center">
                <Input
                    type="search"
                    className="w-full pl-10 pr-4 py-2 text-sm md:text-base h-10 md:h-12"
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            </div>

            {isOpen && searchTerm.length > 1 && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
                    {isPending || isLoading ? (
                        <div className="p-3 text-sm">{t('loading')}</div>
                    ) : error ? (
                        <div className="p-3 text-sm text-destructive">{t('error')}</div>
                    ) : displayResults && displayResults.length > 0 ? (
                        displayResults.map((user: typesUser) => (
                            <UserSearchResult 
                                key={user.id} 
                                user={user} 
                                onClick={handleResultClick} 
                            />
                        ))
                    ) : ( 
                        !isLoading && debouncedSearchTerm.length >= 2 ? ( 
                            <div className="p-3 text-sm">{t('noResults')}</div>
                        ) : null
                    )}
                </div>
            )}
        </div>
    );
};