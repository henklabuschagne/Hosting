import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';

// GET /api/clients
export async function getAllClients(): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getAllClients());
}

// GET /api/clients/:id
export async function getClientById(id: number): Promise<ApiResult<any>> {
  return mockApiCall(() => {
    const client = appStore.getClientById(id);
    if (!client) throw new Error('Client not found');
    return client;
  });
}

// GET /api/clients?serverId=xxx
export async function getClientsByServer(serverId: number): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getClientsByServer(serverId));
}

// GET /api/clients?tierId=xxx
export async function getClientsByTier(tierId: number): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getClientsByTier(tierId));
}

// POST /api/clients
export async function createClient(data: {
  clientName: string;
  tierId: number;
  hostingType: string;
  currentEntities?: number;
  currentTemplates?: number;
  currentUsers?: number;
  discussedMonthlyFee: number;
  actualMonthlyFee: number;
  status?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}): Promise<ApiResult<any>> {
  if (!data.clientName.trim()) return errorResponse('VALIDATION_ERROR', 'Client name is required');
  return mockApiCall(() => appStore.createClient(data));
}

// PUT /api/clients/:id
export async function updateClient(id: number, data: any): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.updateClient(id, data));
}

// DELETE /api/clients/:id
export async function deleteClient(id: number): Promise<ApiResult<boolean>> {
  return mockApiCall(() => appStore.deleteClient(id));
}

// GET /api/clients/:id/servers
export async function getClientServers(id: number): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getClientServers(id));
}

// GET /api/clients/:id/history
export async function getClientHistory(id: number): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getClientHistory(id));
}

// POST /api/clients/:id/move
export async function moveClientToServer(id: number, data: {
  newApplicationServerId: number;
  newDatabaseServerId: number;
  changeReason: string;
}): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.moveClientToServer(id, data));
}

// PUT /api/clients/:id/usage
export async function updateClientUsage(id: number, data: {
  currentEntities: number;
  currentTemplates: number;
  currentUsers: number;
}): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.updateClient(id, data));
}

// GET /api/clients/statistics
export async function getClientStatistics(): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.getClientStatistics());
}
