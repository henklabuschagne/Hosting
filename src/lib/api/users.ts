import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';

// GET /api/auth/users
export async function getAllUsers(): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getAllUsers());
}

// GET /api/users/:id
export async function getUserById(id: number): Promise<ApiResult<any>> {
  return mockApiCall(() => {
    const user = appStore.getUserById(id);
    if (!user) throw new Error('User not found');
    return user;
  });
}

// PUT /api/users/:id
export async function updateUser(id: number, data: {
  email?: string;
  firstName?: string;
  lastName?: string;
}): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.updateUser(id, data));
}

// POST /api/users/:userId/roles/:roleId
export async function assignRole(userId: number, roleId: number): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.assignRole(userId, roleId));
}

// DELETE /api/users/:userId/roles/:roleId
export async function removeRole(userId: number, roleId: number): Promise<ApiResult<any>> {
  return mockApiCall(() => appStore.removeRole(userId, roleId));
}

// GET /api/users/roles
export async function getAllRoles(): Promise<ApiResult<any[]>> {
  return mockApiCall(() => appStore.getAllRoles());
}

// GET /api/auth/me
export async function getCurrentUser(): Promise<ApiResult<any>> {
  return mockApiCall(() => {
    const user = appStore.currentUser;
    if (!user) throw new Error('Not authenticated');
    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
    };
  });
}
