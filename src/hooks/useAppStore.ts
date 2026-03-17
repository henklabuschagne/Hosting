import { useState, useEffect, useMemo } from 'react';
import { appStore, type Slice } from '../lib/appStore';
import { api } from '../lib/api';

export type { Slice } from '../lib/appStore';

export function useAppStore(...subscribeTo: Slice[]) {
  // Force re-render when subscribed slices change
  const [, bump] = useState(0);

  useEffect(() => {
    const unsubscribes = subscribeTo.map(slice =>
      appStore.subscribe(slice, () => bump(v => v + 1))
    );
    return () => unsubscribes.forEach(unsub => unsub());
    // subscribeTo is expected to be static per component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeTo.join(',')]);

  // ─── Reactive State ──────────────────────────────────
  const currentUser = appStore.currentUser;
  const isAuthenticated = appStore.isAuthenticated;
  const isAdmin = appStore.isAdmin;
  const isAuthLoading = appStore.isAuthLoading;
  const users = appStore.users;
  const tiers = appStore.tiers;
  const servers = appStore.servers;
  const clients = appStore.clients;
  const clientHistoryData = appStore.clientHistory;
  const requests = appStore.requests;
  const healthThresholds = appStore.healthThresholds;
  const healthMetrics = appStore.healthMetrics;
  const healthAlerts = appStore.healthAlerts;

  // ─── Sync Read Helpers ───────────────────────────────
  const reads = useMemo(() => ({
    getUserById: (id: number) => appStore.getUserById(id),
    getTierById: (id: number) => appStore.getTierById(id),
    getTierByName: (name: string) => appStore.getTierByName(name),
    getServerById: (id: number) => appStore.getServerById(id),
    getServersByTier: (tierId: number) => appStore.getServersByTier(tierId),
    getServersByType: (type: string) => appStore.getServersByType(type),
    getAvailableServers: () => appStore.getAvailableServers(),
    getServerClients: (id: number) => appStore.getServerClients(id),
    getServerCapacity: (id: number) => appStore.getServerCapacity(id),
    getServerStatistics: () => appStore.getServerStatistics(),
    getClientById: (id: number) => appStore.getClientById(id),
    getClientsByServer: (serverId: number) => appStore.getClientsByServer(serverId),
    getClientsByTier: (tierId: number) => appStore.getClientsByTier(tierId),
    getClientServers: (id: number) => appStore.getClientServers(id),
    getClientHistory: (id: number) => appStore.getClientHistory(id),
    getClientStatistics: () => appStore.getClientStatistics(),
    getRequestById: (id: number) => appStore.getRequestById(id),
    getRecommendedTier: (data: { requestedEntities: number; requestedTemplates: number; requestedUsers: number }) =>
      appStore.getRecommendedTier(data),
    getHealthThresholds: (serverId: number) => appStore.getHealthThresholds(serverId),
    getLatestHealthMetrics: (serverId?: number) => appStore.getLatestHealthMetrics(serverId),
    getHealthHistory: (serverId: number, startDate?: string, endDate?: string, maxRecords?: number) =>
      appStore.getHealthHistory(serverId, startDate, endDate, maxRecords),
    getHealthAlerts: (serverId?: number, severity?: string) => appStore.getHealthAlerts(serverId, severity),
    getHealthAnalytics: (serverId: number, daysBack?: number) => appStore.getHealthAnalytics(serverId, daysBack),
    getDashboardStats: () => appStore.getDashboardStats(),
    getServerUtilization: () => appStore.getServerUtilization(),
    getRevenueByTier: () => appStore.getRevenueByTier(),
    getClientDistribution: () => appStore.getClientDistribution(),
    getTopClients: (topN?: number) => appStore.getTopClients(topN),
    getAllRoles: () => appStore.getAllRoles(),
  }), []);

  // ─── Async Actions (routed through API layer) ───────
  const actions = useMemo(() => ({
    // Auth
    login: (username: string, password: string) => api.auth.login(username, password),
    register: (data: Parameters<typeof api.auth.register>[0]) => api.auth.register(data),
    logout: () => api.auth.logout(),
    restoreAuth: () => api.auth.restoreAuth(),

    // Users
    getAllUsers: () => api.users.getAllUsers(),
    getUserById: (id: number) => api.users.getUserById(id),
    updateUser: (id: number, data: Parameters<typeof api.users.updateUser>[1]) => api.users.updateUser(id, data),
    assignRole: (userId: number, roleId: number) => api.users.assignRole(userId, roleId),
    removeRole: (userId: number, roleId: number) => api.users.removeRole(userId, roleId),
    getAllRoles: () => api.users.getAllRoles(),

    // Tiers
    getAllTiers: () => api.tiers.getAllTiers(),
    getTierById: (id: number) => api.tiers.getTierById(id),
    getTierByName: (name: string) => api.tiers.getTierByName(name),
    createTier: (data: Parameters<typeof api.tiers.createTier>[0]) => api.tiers.createTier(data),
    updateTier: (id: number, data: any) => api.tiers.updateTier(id, data),
    updateTierSpec: (specId: number, data: any) => api.tiers.updateTierSpec(specId, data),
    getRecommendedTier: (data: Parameters<typeof api.tiers.getRecommendedTier>[0]) => api.tiers.getRecommendedTier(data),

    // Servers
    getAllServers: () => api.servers.getAllServers(),
    getServerById: (id: number) => api.servers.getServerById(id),
    createServer: (data: Parameters<typeof api.servers.createServer>[0]) => api.servers.createServer(data),
    updateServer: (id: number, data: any) => api.servers.updateServer(id, data),
    deleteServer: (id: number) => api.servers.deleteServer(id),
    getServerClients: (id: number) => api.servers.getServerClients(id),
    getServerCapacity: (id: number) => api.servers.getServerCapacity(id),
    assignClientToServer: (data: { clientId: number; serverId: number }) => api.servers.assignClientToServer(data),
    unassignClientFromServer: (data: { clientId: number; serverId: number }) => api.servers.unassignClientFromServer(data),
    getServerStatistics: () => api.servers.getServerStatistics(),
    updateServerStatus: (id: number, status: string) => api.servers.updateServerStatus(id, status),

    // Clients
    getAllClients: () => api.clients.getAllClients(),
    getClientById: (id: number) => api.clients.getClientById(id),
    createClient: (data: Parameters<typeof api.clients.createClient>[0]) => api.clients.createClient(data),
    updateClient: (id: number, data: any) => api.clients.updateClient(id, data),
    deleteClient: (id: number) => api.clients.deleteClient(id),
    getClientServers: (id: number) => api.clients.getClientServers(id),
    getClientHistory: (id: number) => api.clients.getClientHistory(id),
    moveClientToServer: (id: number, data: Parameters<typeof api.clients.moveClientToServer>[1]) => api.clients.moveClientToServer(id, data),
    updateClientUsage: (id: number, data: Parameters<typeof api.clients.updateClientUsage>[1]) => api.clients.updateClientUsage(id, data),
    getClientStatistics: () => api.clients.getClientStatistics(),

    // Requests
    getAllRequests: () => api.requests.getAllRequests(),
    createRequest: (data: Parameters<typeof api.requests.createRequest>[0]) => api.requests.createRequest(data),
    updateRequestStatus: (id: number, data: Parameters<typeof api.requests.updateRequestStatus>[1]) => api.requests.updateRequestStatus(id, data),
    deleteRequest: (id: number) => api.requests.deleteRequest(id),

    // Health
    getServerHealthThresholds: (serverId: number) => api.health.getServerHealthThresholds(serverId),
    upsertServerHealthThresholds: (serverId: number, data: any) => api.health.upsertServerHealthThresholds(serverId, data),
    getLatestHealthMetrics: (serverId?: number) => api.health.getLatestHealthMetrics(serverId),
    getServerHealthHistory: (serverId: number, startDate?: string, endDate?: string, maxRecords?: number) =>
      api.health.getServerHealthHistory(serverId, startDate, endDate, maxRecords),
    collectServerHealth: (serverId: number) => api.health.collectServerHealth(serverId),
    collectAllServersHealth: () => api.health.collectAllServersHealth(),
    getHealthAlerts: (serverId?: number, severity?: string) => api.health.getHealthAlerts(serverId, severity),
    acknowledgeHealthAlert: (alertId: number) => api.health.acknowledgeHealthAlert(alertId),
    resolveHealthAlert: (alertId: number) => api.health.resolveHealthAlert(alertId),
    getServerHealthAnalytics: (serverId: number, daysBack?: number) => api.health.getServerHealthAnalytics(serverId, daysBack),

    // Analytics
    getDashboardStats: () => api.analytics.getDashboardStats(),
    getServerUtilization: () => api.analytics.getServerUtilization(),
    getRevenueByTier: () => api.analytics.getRevenueByTier(),
    getClientDistribution: () => api.analytics.getClientDistribution(),
    getTopClients: (topN?: number) => api.analytics.getTopClients(topN),

    // Reset
    resetAllData: () => appStore.resetAllData(),

    // Persistence
    clearAllPersistence: () => appStore.clearAllPersistence(),
    getStorageStats: () => appStore.getStorageStats(),
    hasPersistedData: () => appStore.hasPersistedData(),
  }), []);

  return {
    // Reactive state
    currentUser,
    isAuthenticated,
    isAdmin,
    isAuthLoading,
    users,
    tiers,
    servers,
    clients,
    clientHistory: clientHistoryData,
    requests,
    healthThresholds,
    healthMetrics,
    healthAlerts,
    // Sync reads
    reads,
    // Async writes
    actions,
  };
}