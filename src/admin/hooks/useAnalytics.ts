/**
 * React Query hooks for Analytics & Reports
 */

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../utils/api';

export interface AnalyticsStats {
  totalUsers: number;
  totalBlogs: number;
  totalContacts: number;
  totalTokens: number;
  newUsersMonth: number;
  popularBlogs: Array<{
    title: string;
    views: number;
    likes: number;
  }>;
  recentContacts: Array<{
    name: string;
    email: string;
    service: string;
    created_at: string;
  }>;
  userGrowth: Array<{
    date: string;
    count: number;
  }>;
}

export interface ActivityItem {
  id: string;
  description: string;
  time: string;
  icon: string;
}

export function useAnalyticsStats(refetchInterval?: number) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'stats'],
    queryFn: async () => {
      const response = await adminApi.stats.getDashboard();
      return response as AnalyticsStats;
    },
    staleTime: 60000,
    refetchInterval: refetchInterval,
  });
}

export function useActivityFeed(limit: number = 10, refetchInterval?: number) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'activity', limit],
    queryFn: async () => {
      const response = await adminApi.activity.getRecent(limit);
      return (response as any) || [];
    },
    staleTime: 30000,
    refetchInterval: refetchInterval,
  });
}
