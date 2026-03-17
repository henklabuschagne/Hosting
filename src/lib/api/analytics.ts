import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';

// GET /api/analytics/dashboard
export async function getDashboardStats(): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.getDashboardStats());
}

// GET /api/analytics/server-utilization
export async function getServerUtilization(): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getServerUtilization());
}

// GET /api/analytics/revenue-by-tier
export async function getRevenueByTier(): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getRevenueByTier());
}

// GET /api/analytics/client-distribution
export async function getClientDistribution(): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getClientDistribution());
}

// GET /api/analytics/top-clients
export async function getTopClients(topN = 10): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getTopClients(topN));
}
