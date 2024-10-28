// LIBRARIES
import { useQuery, UseQueryResult } from '@tanstack/react-query';

// TYPES
import type { typesUser } from '@/types/typesUser';

type SearchResults = {
    success: boolean;
    message: string;
    data: typesUser[];
}

async function fetchUsers(query: string, limit: number, authToken?: string): Promise<SearchResults> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/user/search_users?search=${encodeURIComponent(query)}&limit=${limit}`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    });

    const data = await response.json();
    return data;
}

export function useSearchUsers(
    query: string,
    limit: number = 7,
    authToken?: string
): UseQueryResult<SearchResults, unknown> {
    return useQuery<SearchResults, unknown>({
        queryKey: ['searchUsers', query, limit],
        queryFn: () => fetchUsers(query, limit, authToken),
        staleTime: 10 * 1000,
        gcTime: 5 * 60 * 1000,
        enabled: query.length > 1,
        retry: false,
    });
}