import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';

// GET /api/tiers
export async function getAllTiers(): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getAllTiers());
}

// GET /api/tiers/:id
export async function getTierById(id: number): Promise<ApiResult<any>> {
  return mockApiCall(() => {
    const tier = appStore.getTierById(id);
    if (!tier) throw new Error('Tier not found');
    return tier;
  });
}

// GET /api/tiers?name=xxx
export async function getTierByName(name: string): Promise<ApiResult<any>> {
  return mockApiCall(() => {
    const tier = appStore.getTierByName(name);
    if (!tier) throw new Error('Tier not found');
    return tier;
  });
}

// POST /api/tiers
export async function createTier(data: {
  tierName: string;
  displayName: string;
  maxEntities: number;
  maxTemplates: number;
  maxUsers: number;
  pricePerMonth: number;
  description?: string;
}): Promise<ApiResult<any>> {
  if (!data.tierName.trim()) return errorResponse('VALIDATION_ERROR', 'Tier name is required');
  if (!data.displayName.trim()) return errorResponse('VALIDATION_ERROR', 'Display name is required');
  return mockApiCall(() => appStore.createTier(data));
}

// PUT /api/tiers/:id
export async function updateTier(id: number, data: any): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.updateTier(id, data));
}

// PUT /api/tiers/specs/:specId
export async function updateTierSpec(specId: number, data: any): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.updateTier(specId, {
    maxEntities: data.maxEntities,
    maxTemplates: data.maxTemplates,
    maxUsers: data.maxUsers,
    pricePerMonth: data.monthlyPrice,
  }));
}

// POST /api/tiers/recommend
export async function getRecommendedTier(data: {
  requestedEntities: number;
  requestedTemplates: number;
  requestedUsers: number;
}): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.getRecommendedTier(data));
}
