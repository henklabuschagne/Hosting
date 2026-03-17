import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';

// GET /api/requests
export async function getAllRequests(): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getAllRequests());
}

// GET /api/requests/:id
export async function getRequestById(id: number): Promise<ApiResult<any>> {
  return mockApiCall(() => {
    const req = appStore.getRequestById(id);
    if (!req) throw new Error('Request not found');
    return req;
  });
}

// POST /api/requests
export async function createRequest(data: {
  customerName: string;
  customerEmail?: string;
  requestedEntities: number;
  requestedTemplates: number;
  requestedUsers: number;
}): Promise<ApiResult<any>> {
  if (!data.customerName.trim()) return errorResponse('VALIDATION_ERROR', 'Customer name is required');
  return mockApiCall(() => appStore.createRequest(data));
}

// PUT /api/requests/:id/status
export async function updateRequestStatus(id: number, data: {
  status: string;
  notes?: string;
}): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.updateRequestStatus(id, data));
}

// DELETE /api/requests/:id
export async function deleteRequest(id: number): Promise<ApiResult<boolean>> {
  return mockApiCall(() => appStore.deleteRequest(id));
}
