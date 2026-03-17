import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';

// GET /api/serverhealth/thresholds/:serverId
export async function getServerHealthThresholds(serverId: number): Promise<ApiResult<any>> {
  return mockApiCall(() => {
    const t = appStore.getHealthThresholds(serverId);
    if (!t) throw new Error('Thresholds not found');
    return t;
  });
}

// POST /api/serverhealth/thresholds/:serverId
export async function upsertServerHealthThresholds(serverId: number, data: any): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.upsertHealthThresholds(serverId, data));
}

// GET /api/serverhealth/metrics/latest
export async function getLatestHealthMetrics(serverId?: number): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getLatestHealthMetrics(serverId));
}

// GET /api/serverhealth/metrics/:serverId/history
export async function getServerHealthHistory(
  serverId: number,
  startDate?: string,
  endDate?: string,
  maxRecords = 1000
): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getHealthHistory(serverId, startDate, endDate, maxRecords));
}

// POST /api/serverhealth/metrics/:serverId/collect
export async function collectServerHealth(serverId: number): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.collectServerHealth(serverId));
}

// POST /api/serverhealth/metrics/collect-all
export async function collectAllServersHealth(): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.collectAllServersHealth());
}

// GET /api/serverhealth/alerts
export async function getHealthAlerts(serverId?: number, severity?: string): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getHealthAlerts(serverId, severity));
}

// POST /api/serverhealth/alerts/:alertId/acknowledge
export async function acknowledgeHealthAlert(alertId: number): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.acknowledgeHealthAlert(alertId));
}

// POST /api/serverhealth/alerts/:alertId/resolve
export async function resolveHealthAlert(alertId: number): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.resolveHealthAlert(alertId));
}

// GET /api/serverhealth/analytics/:serverId
export async function getServerHealthAnalytics(serverId: number, daysBack = 7): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.getHealthAnalytics(serverId, daysBack));
}
