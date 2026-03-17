import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';

// GET /api/servers
export async function getAllServers(): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getAllServers());
}

// GET /api/servers/:id
export async function getServerById(id: number): Promise<ApiResult<any>> {
  return mockApiCall(() => {
    const server = appStore.getServerById(id);
    if (!server) throw new Error('Server not found');
    return server;
  });
}

// GET /api/servers?tierId=xxx
export async function getServersByTier(tierId: number): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getServersByTier(tierId));
}

// GET /api/servers?serverType=xxx
export async function getServersByType(serverType: string): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getServersByType(serverType));
}

// GET /api/servers/available
export async function getAvailableServers(): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getAvailableServers());
}

// POST /api/servers
export async function createServer(data: {
  serverName: string;
  serverType: string;
  tierId: number;
  maxEntities?: number;
  maxTemplates?: number;
  maxUsers?: number;
  ipAddress?: string;
  location?: string;
  status?: string;
  notes?: string;
}): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.createServer(data));
}

// PUT /api/servers/:id
export async function updateServer(id: number, data: any): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.updateServer(id, data));
}

// DELETE /api/servers/:id
export async function deleteServer(id: number): Promise<ApiResult<boolean>> {
  return mockApiCall(() => appStore.deleteServer(id));
}

// GET /api/servers/:id/clients
export async function getServerClients(id: number): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getServerClients(id));
}

// GET /api/servers/:id/capacity
export async function getServerCapacity(id: number): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.getServerCapacity(id));
}

// POST /api/servers/assign
export async function assignClientToServer(data: { clientId: number; serverId: number }): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.assignClientToServer(data));
}

// POST /api/servers/unassign
export async function unassignClientFromServer(data: { clientId: number; serverId: number }): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.unassignClientFromServer(data));
}

// GET /api/servers/statistics
export async function getServerStatistics(): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.getServerStatistics());
}

// PUT /api/servers/:id/status
export async function updateServerStatus(id: number, status: string): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.updateServer(id, { status }));
}

// PUT /api/servers/:id/load
export async function updateServerLoad(id: number, data: any): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.updateServer(id, data));
}