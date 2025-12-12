'use client';

import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

function useMerchant() {
    return useQuery({
        queryKey: ['merchant', 'me'],
        queryFn: async () => {
            const response = await api.get('/merchant/me');
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

export default useMerchant
