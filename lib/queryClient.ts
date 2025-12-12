import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 30, // 30 seconds
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    });
}

let clientQueryClient: QueryClient | undefined;

export function getQueryClient() {
    if (typeof window === 'undefined') {
        // Server: always make a new query client
        return makeQueryClient();
    } else {
        // Browser: make a single query client per page
        if (!clientQueryClient) {
            clientQueryClient = makeQueryClient();
        }
        return clientQueryClient;
    }
}
