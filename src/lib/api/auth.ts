import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';
import type { AuthUser } from '../appStore';

// POST /api/auth/login
export async function login(username: string, password: string): Promise<ApiResult<AuthUser>> {
  if (!username.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Username is required');
  }
  return mockApiCall(() => appStore.login(username, password));
}

// POST /api/auth/register
export async function register(data: {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<ApiResult<AuthUser>> {
  if (!data.username.trim()) return errorResponse('VALIDATION_ERROR', 'Username is required');
  if (!data.email.trim()) return errorResponse('VALIDATION_ERROR', 'Email is required');
  if (!data.password.trim()) return errorResponse('VALIDATION_ERROR', 'Password is required');
  return mockApiCall(() => appStore.register(data));
}

// Logout is synchronous - no API call needed
export function logout(): void {
  appStore.logout();
}

// Restore session from localStorage
export function restoreAuth(): AuthUser | null {
  return appStore.restoreAuth();
}
