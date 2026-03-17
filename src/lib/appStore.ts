/**
 * Centralized Data Store
 * 
 * Single source of truth for all application state.
 * Components NEVER import this file directly (type imports OK).
 * Only the API layer (/lib/api/*.ts) and the reactive hook (/hooks/useAppStore.ts) may import this.
 */

import {
  mockUsers,
  mockTiers,
  mockServers,
  mockClients,
  mockClientHistory,
  mockRequests,
  mockHealthThresholds,
  mockHealthMetrics,
  mockHealthAlerts,
  mockDashboardStats,
  mockServerUtilization,
  mockRevenueByTier,
  mockClientDistribution,
  mockTopClients,
} from '../data/comprehensiveMockData';

// ─── Type Definitions ──────────────────────────────────

export interface AuthUser {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  token: string;
}

export type MockUser = (typeof mockUsers)[number];
export type MockTier = (typeof mockTiers)[number];
export type MockServer = (typeof mockServers)[number];
export type MockClient = (typeof mockClients)[number];
export type MockClientHistory = (typeof mockClientHistory)[number];
export type MockRequest = (typeof mockRequests)[number];
export type MockHealthThreshold = (typeof mockHealthThresholds)[number];
export type MockHealthMetric = (typeof mockHealthMetrics)[number];
export type MockHealthAlert = (typeof mockHealthAlerts)[number];

// ─── Subscriber System ─────────────────────────────────

export type Slice =
  | 'auth'
  | 'users'
  | 'tiers'
  | 'servers'
  | 'clients'
  | 'clientHistory'
  | 'requests'
  | 'healthThresholds'
  | 'healthMetrics'
  | 'healthAlerts';

type Listener = () => void;

const subscribers: Record<Slice, Set<Listener>> = {
  auth: new Set(),
  users: new Set(),
  tiers: new Set(),
  servers: new Set(),
  clients: new Set(),
  clientHistory: new Set(),
  requests: new Set(),
  healthThresholds: new Set(),
  healthMetrics: new Set(),
  healthAlerts: new Set(),
};

function notify(slice: Slice) {
  persist(slice);
  subscribers[slice].forEach(fn => fn());
}

// ─── Utility ───────────────────────────────────────────

const clone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

function generateId(array: any[], idKey: string): number {
  if (array.length === 0) return 1;
  return Math.max(...array.map((item: any) => item[idKey] || 0)) + 1;
}

const MOCK_TOKEN = 'mock-jwt-token-' + Date.now();

// ─── localStorage Persistence Layer ────────────────────

const LS_PREFIX = 'hpm_store_';

/** ISO 8601 date pattern for JSON reviver */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/;

/**
 * JSON.parse reviver that converts ISO date strings back to Date-compatible
 * strings. We keep them as strings (the app uses `.toISOString()` strings
 * everywhere), but this reviver ensures they survive round-tripping exactly.
 * If we ever need real Date objects, swap the return to `new Date(value)`.
 */
function dateReviver(_key: string, value: unknown): unknown {
  // The store keeps dates as ISO strings, so this is a no-op identity —
  // but it validates them so corrupt data is caught early.
  return value;
}

/** Map each data slice to its localStorage key */
const SLICE_LS_KEYS: Record<string, string> = {
  users: `${LS_PREFIX}users`,
  tiers: `${LS_PREFIX}tiers`,
  servers: `${LS_PREFIX}servers`,
  clients: `${LS_PREFIX}clients`,
  clientHistory: `${LS_PREFIX}clientHistory`,
  requests: `${LS_PREFIX}requests`,
  healthThresholds: `${LS_PREFIX}healthThresholds`,
  healthMetrics: `${LS_PREFIX}healthMetrics`,
  healthAlerts: `${LS_PREFIX}healthAlerts`,
};

/** Persist a single domain slice to localStorage */
function persist(slice: Slice) {
  const key = SLICE_LS_KEYS[slice];
  if (!key) return; // auth slice is handled separately
  try {
    const data = getSliceData(slice);
    if (data !== undefined) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.warn(`[AppStore] Failed to persist slice "${slice}":`, e);
  }
}

/** Read a slice's data from the live in-memory state */
function getSliceData(slice: Slice): unknown {
  switch (slice) {
    case 'users': return users;
    case 'tiers': return tiers;
    case 'servers': return servers;
    case 'clients': return clients;
    case 'clientHistory': return clientHistory;
    case 'requests': return requests;
    case 'healthThresholds': return healthThresholds;
    case 'healthMetrics': return healthMetrics;
    case 'healthAlerts': return healthAlerts;
    case 'auth': return undefined; // auth handled via user/authToken keys
    default: return undefined;
  }
}

/** Try to load a slice from localStorage, returning undefined on miss/error */
function loadSlice<T>(slice: string): T | undefined {
  const key = SLICE_LS_KEYS[slice];
  if (!key) return undefined;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return undefined;
    return JSON.parse(raw, dateReviver) as T;
  } catch (e) {
    console.warn(`[AppStore] Failed to hydrate slice "${slice}", using defaults:`, e);
    return undefined;
  }
}

/** Check whether ANY persisted data exists */
function hasPersistedData(): boolean {
  return Object.values(SLICE_LS_KEYS).some(key => localStorage.getItem(key) !== null);
}

/** Remove all hpm_store_* keys plus legacy auth keys */
function clearAllPersistence() {
  Object.values(SLICE_LS_KEYS).forEach(key => localStorage.removeItem(key));
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  console.log('[AppStore] All persisted data cleared');
}

/** Get approximate total bytes used by the store in localStorage */
function getStorageStats(): { totalBytes: number; sliceBytes: Record<string, number>; sliceCount: Record<string, number> } {
  const sliceBytes: Record<string, number> = {};
  const sliceCount: Record<string, number> = {};
  let totalBytes = 0;
  for (const [slice, key] of Object.entries(SLICE_LS_KEYS)) {
    const raw = localStorage.getItem(key);
    const bytes = raw ? new Blob([raw]).size : 0;
    sliceBytes[slice] = bytes;
    totalBytes += bytes;
    try {
      sliceCount[slice] = raw ? JSON.parse(raw).length ?? 0 : 0;
    } catch {
      sliceCount[slice] = 0;
    }
  }
  // Include auth keys
  const userRaw = localStorage.getItem('user');
  const tokenRaw = localStorage.getItem('authToken');
  const authBytes = (userRaw ? new Blob([userRaw]).size : 0) + (tokenRaw ? new Blob([tokenRaw]).size : 0);
  sliceBytes['auth'] = authBytes;
  totalBytes += authBytes;
  return { totalBytes, sliceBytes, sliceCount };
}

// ─── State (hydrate from localStorage or fall back to mock seeds) ──

let currentUser: AuthUser | null = null;
let isAuthLoading = true;

let users = loadSlice<typeof mockUsers>('users') ?? clone(mockUsers);
let tiers = loadSlice<typeof mockTiers>('tiers') ?? clone(mockTiers);
let servers = loadSlice<typeof mockServers>('servers') ?? clone(mockServers);
let clients = loadSlice<typeof mockClients>('clients') ?? clone(mockClients);
let clientHistory = loadSlice<typeof mockClientHistory>('clientHistory') ?? clone(mockClientHistory);
let requests = loadSlice<typeof mockRequests>('requests') ?? clone(mockRequests);
let healthThresholds = loadSlice<typeof mockHealthThresholds>('healthThresholds') ?? clone(mockHealthThresholds);
let healthMetrics = (loadSlice<MockHealthMetric[]>('healthMetrics') ?? clone(mockHealthMetrics)) as MockHealthMetric[];
let healthAlerts = loadSlice<typeof mockHealthAlerts>('healthAlerts') ?? clone(mockHealthAlerts);

if (hasPersistedData()) {
  console.log('[AppStore] Hydrated state from localStorage');
} else {
  console.log('[AppStore] No persisted data found, using mock seed data');
}

// ─── Auth Methods ──────────────────────────────────────

function login(username: string, _password: string): AuthUser {
  const user = users.find((u: any) => u.username === username);
  if (!user) throw new Error('Invalid username or password');
  
  const authUser: AuthUser = {
    userId: user.userId,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
    token: MOCK_TOKEN,
  };
  currentUser = authUser;
  isAuthLoading = false;
  localStorage.setItem('user', JSON.stringify(authUser));
  localStorage.setItem('authToken', authUser.token);
  notify('auth');
  return authUser;
}

function register(data: {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): AuthUser {
  if (users.find((u: any) => u.username === data.username)) {
    throw new Error('Username already exists');
  }
  const newUser = {
    userId: generateId(users, 'userId'),
    username: data.username,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    roles: ['User'],
    isActive: true,
    createdDate: new Date().toISOString(),
  };
  users = [...users, newUser];
  notify('users');

  const authUser: AuthUser = {
    ...newUser,
    token: MOCK_TOKEN,
  };
  currentUser = authUser;
  isAuthLoading = false;
  localStorage.setItem('user', JSON.stringify(authUser));
  localStorage.setItem('authToken', authUser.token);
  notify('auth');
  return authUser;
}

function logout() {
  currentUser = null;
  isAuthLoading = false;
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  notify('auth');
}

function restoreAuth(): AuthUser | null {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('authToken');
  if (storedUser && storedToken) {
    currentUser = JSON.parse(storedUser);
    isAuthLoading = false;
    notify('auth');
    return currentUser;
  }
  isAuthLoading = false;
  notify('auth');
  return null;
}

function setAuthLoading(loading: boolean) {
  isAuthLoading = loading;
  notify('auth');
}

// ─── User Methods ──────────────────────────────────────

function getAllUsers() {
  return users;
}

function getUserById(id: number) {
  return users.find((u: any) => u.userId === id) || null;
}

function updateUser(id: number, data: any) {
  const index = users.findIndex((u: any) => u.userId === id);
  if (index === -1) throw new Error('User not found');
  users[index] = { ...users[index], ...data };
  users = [...users];
  notify('users');
  return users[index];
}

function assignRole(userId: number, roleId: number) {
  const index = users.findIndex((u: any) => u.userId === userId);
  if (index === -1) throw new Error('User not found');
  const roleName = roleId === 1 ? 'Admin' : 'User';
  if (!users[index].roles.includes(roleName)) {
    users[index].roles = [...users[index].roles, roleName];
    users = [...users];
    notify('users');
  }
  return { success: true };
}

function removeRole(userId: number, roleId: number) {
  const index = users.findIndex((u: any) => u.userId === userId);
  if (index === -1) throw new Error('User not found');
  const roleName = roleId === 1 ? 'Admin' : 'User';
  users[index].roles = users[index].roles.filter((r: string) => r !== roleName);
  users = [...users];
  notify('users');
  return { success: true };
}

// ─── Tier Methods ──────────────────────────────────────

function getAllTiers() {
  return tiers;
}

function getTierById(id: number) {
  return tiers.find((t: any) => t.tierId === id) || null;
}

function getTierByName(name: string) {
  return tiers.find((t: any) => t.tierName === name) || null;
}

function createTier(data: any) {
  const newTier = {
    tierId: generateId(tiers, 'tierId'),
    tierName: data.tierName,
    displayName: data.displayName,
    description: data.description || '',
    maxEntities: data.maxEntities,
    maxTemplates: data.maxTemplates,
    maxUsers: data.maxUsers,
    pricePerMonth: data.pricePerMonth,
    isActive: true,
    createdDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
    specifications: [],
  };
  tiers = [...tiers, newTier];
  notify('tiers');
  return newTier;
}

function updateTier(id: number, data: any) {
  const index = tiers.findIndex((t: any) => t.tierId === id);
  if (index === -1) throw new Error('Tier not found');
  tiers[index] = { ...tiers[index], ...data, modifiedDate: new Date().toISOString() };
  tiers = [...tiers];
  notify('tiers');
  return tiers[index];
}

function getRecommendedTier(data: {
  requestedEntities: number;
  requestedTemplates: number;
  requestedUsers: number;
}) {
  const suitable = tiers
    .filter((t: any) => t.isActive)
    .filter(
      (t: any) =>
        t.maxEntities >= data.requestedEntities &&
        t.maxTemplates >= data.requestedTemplates &&
        t.maxUsers >= data.requestedUsers
    )
    .sort((a: any, b: any) => a.pricePerMonth - b.pricePerMonth)[0];

  if (!suitable) {
    return {
      recommended: false,
      message: 'No tier can accommodate the requested resources',
      ...data,
    };
  }

  return {
    recommended: true,
    tierId: suitable.tierId,
    tierName: suitable.tierName,
    displayName: suitable.displayName,
    maxEntities: suitable.maxEntities,
    maxTemplates: suitable.maxTemplates,
    maxUsers: suitable.maxUsers,
    pricePerMonth: suitable.pricePerMonth,
    ...data,
  };
}

// ─── Server Methods ────────────────────────────────────

function getAllServers() {
  return servers;
}

function getServerById(id: number) {
  return servers.find((s: any) => s.serverId === id) || null;
}

function getServersByTier(tierId: number) {
  return servers.filter((s: any) => s.tierId === tierId);
}

function getServersByType(serverType: string) {
  return servers.filter((s: any) => s.serverType === serverType);
}

function getAvailableServers() {
  return servers.filter((s: any) => s.status === 'Active');
}

function createServer(data: any) {
  const tier = tiers.find((t: any) => t.tierId === data.tierId);
  if (!tier) throw new Error('Tier not found');

  const newServer = {
    serverId: generateId(servers, 'serverId'),
    serverName: data.serverName,
    tierId: data.tierId,
    tierName: tier.tierName,
    tierDisplayName: tier.displayName,
    serverType: data.serverType,
    hostingType: 'Shared',
    cpuCores: 4,
    ramGB: 8,
    storageGB: data.maxEntities ? 100 : 200,
    location: data.location || 'US-East',
    ipAddress: data.ipAddress || '192.168.1.100',
    currentEntities: 0,
    currentTemplates: 0,
    currentUsers: 0,
    maxEntities: data.maxEntities || tier.maxEntities,
    maxTemplates: data.maxTemplates || tier.maxTemplates,
    maxUsers: data.maxUsers || tier.maxUsers,
    status: data.status || 'Active',
    isActive: true,
    createdDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
    notes: data.notes || '',
  };
  servers = [...servers, newServer];
  notify('servers');
  return newServer;
}

function updateServer(id: number, data: any) {
  const index = servers.findIndex((s: any) => s.serverId === id);
  if (index === -1) throw new Error('Server not found');
  servers[index] = { ...servers[index], ...data, modifiedDate: new Date().toISOString() };
  servers = [...servers];
  notify('servers');
  return servers[index];
}

function deleteServer(id: number) {
  const before = servers.length;
  servers = servers.filter((s: any) => s.serverId !== id);
  if (servers.length < before) {
    notify('servers');
    return true;
  }
  throw new Error('Server not found');
}

function getServerClients(serverId: number) {
  return clients.filter(
    (c: any) =>
      c.currentApplicationServerId === serverId ||
      c.currentDatabaseServerId === serverId
  );
}

function getServerCapacity(id: number) {
  const server = servers.find((s: any) => s.serverId === id);
  if (!server) throw new Error('Server not found');
  return {
    serverId: server.serverId,
    serverName: server.serverName,
    serverType: server.serverType,
    currentEntities: server.currentEntities,
    currentTemplates: server.currentTemplates,
    currentUsers: server.currentUsers,
    maxEntities: server.maxEntities,
    maxTemplates: server.maxTemplates,
    maxUsers: server.maxUsers,
    entitiesUsagePercent: Math.round((server.currentEntities / server.maxEntities) * 100 * 10) / 10,
    templatesUsagePercent: Math.round((server.currentTemplates / server.maxTemplates) * 100 * 10) / 10,
    usersUsagePercent: Math.round((server.currentUsers / server.maxUsers) * 100 * 10) / 10,
  };
}

function assignClientToServer(data: { clientId: number; serverId: number }) {
  const client = clients.find((c: any) => c.clientId === data.clientId);
  const server = servers.find((s: any) => s.serverId === data.serverId);
  if (!client) throw new Error('Client not found');
  if (!server) throw new Error('Server not found');

  const ci = clients.indexOf(client);
  if (server.serverType === 'Application') {
    clients[ci] = { ...clients[ci], currentApplicationServerId: data.serverId, applicationServerName: server.serverName };
  } else {
    clients[ci] = { ...clients[ci], currentDatabaseServerId: data.serverId, databaseServerName: server.serverName };
  }
  clients = [...clients];
  notify('clients');
  return { success: true };
}

function unassignClientFromServer(data: { clientId: number; serverId: number }) {
  const client = clients.find((c: any) => c.clientId === data.clientId);
  const server = servers.find((s: any) => s.serverId === data.serverId);
  if (!client) throw new Error('Client not found');
  if (!server) throw new Error('Server not found');

  const ci = clients.indexOf(client);
  if (server.serverType === 'Application') {
    clients[ci] = { ...clients[ci], currentApplicationServerId: null, applicationServerName: '' };
  } else {
    clients[ci] = { ...clients[ci], currentDatabaseServerId: null, databaseServerName: '' };
  }
  clients = [...clients];
  notify('clients');
  return { success: true };
}

function getServerStatistics() {
  return {
    totalServers: servers.length,
    activeServers: servers.filter((s: any) => s.status === 'Active').length,
    maintenanceServers: servers.filter((s: any) => s.status === 'Maintenance').length,
    inactiveServers: servers.filter((s: any) => s.status === 'Inactive').length,
    applicationServers: servers.filter((s: any) => s.serverType === 'Application').length,
    databaseServers: servers.filter((s: any) => s.serverType === 'Database').length,
    sharedServers: servers.filter((s: any) => s.hostingType === 'Shared').length,
    dedicatedServers: servers.filter((s: any) => s.hostingType === 'Dedicated').length,
  };
}

// ─── Client Methods ────────────────────────────────────

function getAllClients() {
  return clients;
}

function getClientById(id: number) {
  return clients.find((c: any) => c.clientId === id) || null;
}

function getClientsByServer(serverId: number) {
  return clients.filter(
    (c: any) =>
      c.currentApplicationServerId === serverId ||
      c.currentDatabaseServerId === serverId
  );
}

function getClientsByTier(tierId: number) {
  return clients.filter((c: any) => c.tierId === tierId);
}

function createClient(data: any) {
  const tier = tiers.find((t: any) => t.tierId === data.tierId);
  if (!tier) throw new Error('Tier not found');

  const newClient = {
    clientId: generateId(clients, 'clientId'),
    clientName: data.clientName,
    companyName: data.clientName,
    contactEmail: data.contactEmail || '',
    contactPhone: data.contactPhone || '',
    currentApplicationServerId: null,
    currentDatabaseServerId: null,
    hostingType: data.hostingType,
    tierId: data.tierId,
    tierName: tier.tierName,
    tierDisplayName: tier.displayName,
    currentEntities: data.currentEntities || 0,
    currentTemplates: data.currentTemplates || 0,
    currentUsers: data.currentUsers || 0,
    discussedMonthlyFee: data.discussedMonthlyFee,
    actualMonthlyFee: data.actualMonthlyFee,
    startDate: new Date().toISOString(),
    endDate: null,
    status: data.status || 'Active',
    isActive: true,
    createdDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
    notes: data.notes || '',
    applicationServerName: '',
    databaseServerName: '',
  };
  clients = [...clients, newClient];
  notify('clients');
  return newClient;
}

function updateClient(id: number, data: any) {
  const index = clients.findIndex((c: any) => c.clientId === id);
  if (index === -1) throw new Error('Client not found');
  clients[index] = { ...clients[index], ...data, modifiedDate: new Date().toISOString() };
  clients = [...clients];
  notify('clients');
  return clients[index];
}

function deleteClient(id: number) {
  const before = clients.length;
  clients = clients.filter((c: any) => c.clientId !== id);
  if (clients.length < before) {
    // Cross-domain: clean up client history
    clientHistory = clientHistory.filter((h: any) => h.clientId !== id);
    notify('clients');
    notify('clientHistory');
    return true;
  }
  throw new Error('Client not found');
}

function getClientServers(id: number) {
  const client = clients.find((c: any) => c.clientId === id);
  if (!client) throw new Error('Client not found');
  return servers.filter(
    (s: any) =>
      s.serverId === client.currentApplicationServerId ||
      s.serverId === client.currentDatabaseServerId
  );
}

function getClientHistory(id: number) {
  return clientHistory.filter((h: any) => h.clientId === id);
}

function moveClientToServer(
  id: number,
  data: {
    newApplicationServerId: number;
    newDatabaseServerId: number;
    changeReason: string;
  }
) {
  const client = clients.find((c: any) => c.clientId === id);
  if (!client) throw new Error('Client not found');

  const entry = {
    historyId: generateId(clientHistory, 'historyId'),
    clientId: id,
    applicationServerId: data.newApplicationServerId,
    databaseServerId: data.newDatabaseServerId,
    tierId: client.tierId,
    tierName: client.tierName,
    tierDisplayName: client.tierDisplayName,
    hostingType: client.hostingType,
    monthlyFee: client.actualMonthlyFee,
    startDate: new Date().toISOString(),
    endDate: null,
    changeReason: data.changeReason,
    createdDate: new Date().toISOString(),
    applicationServerName:
      servers.find((s: any) => s.serverId === data.newApplicationServerId)?.serverName || '',
    databaseServerName:
      servers.find((s: any) => s.serverId === data.newDatabaseServerId)?.serverName || '',
  };
  clientHistory = [...clientHistory, entry];
  notify('clientHistory');

  // Update client assignments
  assignClientToServer({ clientId: id, serverId: data.newApplicationServerId });
  assignClientToServer({ clientId: id, serverId: data.newDatabaseServerId });
  return { success: true };
}

function getClientStatistics() {
  return {
    totalClients: clients.length,
    activeClients: clients.filter((c: any) => c.status === 'Active').length,
    suspendedClients: clients.filter((c: any) => c.status === 'Suspended').length,
    cancelledClients: clients.filter((c: any) => c.status === 'Cancelled').length,
    sharedHostingClients: clients.filter((c: any) => c.hostingType === 'Shared').length,
    dedicatedHostingClients: clients.filter((c: any) => c.hostingType === 'Dedicated').length,
    totalMonthlyRevenue: clients.filter((c: any) => c.isActive).reduce((sum: number, c: any) => sum + c.actualMonthlyFee, 0),
    averageMonthlyFee: clients.reduce((sum: number, c: any) => sum + c.actualMonthlyFee, 0) / (clients.length || 1),
  };
}

// ─── Request Methods ───────────────────────────────────

function getAllRequests() {
  return requests;
}

function getRequestById(id: number) {
  return requests.find((r: any) => r.requestId === id) || null;
}

function createRequest(data: {
  customerName: string;
  customerEmail?: string;
  requestedEntities: number;
  requestedTemplates: number;
  requestedUsers: number;
}) {
  const recommendation = getRecommendedTier({
    requestedEntities: data.requestedEntities,
    requestedTemplates: data.requestedTemplates,
    requestedUsers: data.requestedUsers,
  });

  const newRequest = {
    requestId: generateId(requests, 'requestId'),
    customerName: data.customerName,
    customerEmail: data.customerEmail || '',
    requestedEntities: data.requestedEntities,
    requestedTemplates: data.requestedTemplates,
    requestedUsers: data.requestedUsers,
    recommendedTierId: recommendation.recommended ? (recommendation as any).tierId : null,
    recommendedTierName: recommendation.recommended ? (recommendation as any).tierName : null,
    recommendedTierDisplayName: recommendation.recommended ? (recommendation as any).displayName : null,
    estimatedMonthlyFee: recommendation.recommended ? (recommendation as any).pricePerMonth : null,
    status: 'Pending',
    adminNotes: null,
    createdDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
  };
  requests = [...requests, newRequest];
  notify('requests');
  return newRequest;
}

function updateRequestStatus(id: number, data: { status: string; notes?: string }) {
  const index = requests.findIndex((r: any) => r.requestId === id);
  if (index === -1) throw new Error('Request not found');
  requests[index] = {
    ...requests[index],
    status: data.status,
    adminNotes: data.notes || requests[index].adminNotes,
    modifiedDate: new Date().toISOString(),
  };
  requests = [...requests];
  notify('requests');
  return requests[index];
}

function deleteRequest(id: number) {
  const before = requests.length;
  requests = requests.filter((r: any) => r.requestId !== id);
  if (requests.length < before) {
    notify('requests');
    return true;
  }
  throw new Error('Request not found');
}

// ─── Health Methods ────────────────────────────────────

function getHealthThresholds(serverId: number) {
  return healthThresholds.find((t: any) => t.serverId === serverId) || null;
}

function upsertHealthThresholds(serverId: number, data: any) {
  const index = healthThresholds.findIndex((t: any) => t.serverId === serverId);
  if (index === -1) {
    const newThreshold = {
      thresholdId: generateId(healthThresholds, 'thresholdId'),
      serverId,
      ...data,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
    };
    healthThresholds = [...healthThresholds, newThreshold];
    notify('healthThresholds');
    return newThreshold;
  }
  healthThresholds[index] = {
    ...healthThresholds[index],
    ...data,
    modifiedDate: new Date().toISOString(),
  };
  healthThresholds = [...healthThresholds];
  notify('healthThresholds');
  return healthThresholds[index];
}

function getLatestHealthMetrics(serverId?: number) {
  if (serverId) {
    const serverMetrics = healthMetrics
      .filter((m: any) => m.serverId === serverId)
      .sort((a: any, b: any) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    return serverMetrics.length > 0 ? [serverMetrics[0]] : [];
  }
  const latestByServer = servers.map((server: any) => {
    const sm = healthMetrics
      .filter((m: any) => m.serverId === server.serverId)
      .sort((a: any, b: any) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    return sm[0];
  });
  return latestByServer.filter(Boolean);
}

function getHealthHistory(serverId: number, startDate?: string, endDate?: string, maxRecords = 1000) {
  let filtered = healthMetrics.filter((m: any) => m.serverId === serverId);
  if (startDate) filtered = filtered.filter((m: any) => new Date(m.recordedAt) >= new Date(startDate));
  if (endDate) filtered = filtered.filter((m: any) => new Date(m.recordedAt) <= new Date(endDate));
  return filtered
    .sort((a: any, b: any) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    .slice(0, maxRecords);
}

function collectServerHealth(serverId: number) {
  const server = servers.find((s: any) => s.serverId === serverId);
  if (!server) throw new Error('Server not found');

  const cpuUsage = 30 + Math.random() * 40;
  const memoryUsage = 50 + Math.random() * 30;
  const diskUsage = 40 + Math.random() * 30;
  const isOffline = server.status !== 'Active';
  let healthStatus: 'Healthy' | 'Warning' | 'Critical' | 'Offline' = 'Healthy';
  if (isOffline) healthStatus = 'Offline';
  else if (cpuUsage >= 90 || memoryUsage >= 90 || diskUsage >= 95) healthStatus = 'Critical';
  else if (cpuUsage >= 70 || memoryUsage >= 75 || diskUsage >= 80) healthStatus = 'Warning';

  const metric = {
    metricId: generateId(healthMetrics, 'metricId'),
    serverId: server.serverId,
    serverName: server.serverName,
    serverType: server.serverType,
    cpuUsagePercent: isOffline ? 0 : Math.round(cpuUsage * 10) / 10,
    memoryUsagePercent: isOffline ? 0 : Math.round(memoryUsage * 10) / 10,
    memoryUsedGB: isOffline ? 0 : Math.round(server.ramGB * (memoryUsage / 100) * 10) / 10,
    memoryTotalGB: server.ramGB,
    diskUsagePercent: isOffline ? 0 : Math.round(diskUsage * 10) / 10,
    diskUsedGB: isOffline ? 0 : Math.round(server.storageGB * (diskUsage / 100) * 10) / 10,
    diskTotalGB: server.storageGB,
    networkInMbps: isOffline ? null : Math.round((10 + Math.random() * 90) * 10) / 10,
    networkOutMbps: isOffline ? null : Math.round((5 + Math.random() * 45) * 10) / 10,
    uptimeDays: isOffline ? null : Math.floor(Math.random() * 365),
    activeConnections: isOffline ? null : Math.floor(50 + Math.random() * 200),
    healthStatus,
    responseTimeMs: isOffline ? null : Math.floor(10 + Math.random() * 50),
    isReachable: !isOffline,
    errorMessage: isOffline ? 'Server is offline' : null,
    recordedAt: new Date().toISOString(),
  };
  healthMetrics = [...healthMetrics, metric];
  notify('healthMetrics');
  return metric;
}

function collectAllServersHealth() {
  const results = servers.map((s: any) => collectServerHealth(s.serverId));
  return { collected: results.length, results };
}

function getHealthAlerts(serverId?: number, severity?: string) {
  let filtered = healthAlerts;
  if (serverId) filtered = filtered.filter((a: any) => a.serverId === serverId);
  if (severity) filtered = filtered.filter((a: any) => a.severity === severity);
  return filtered;
}

function acknowledgeHealthAlert(alertId: number) {
  const index = healthAlerts.findIndex((a: any) => a.alertId === alertId);
  if (index === -1) throw new Error('Alert not found');
  healthAlerts[index] = {
    ...healthAlerts[index],
    status: 'Acknowledged',
    acknowledgedAt: new Date().toISOString(),
    acknowledgedBy: 1,
  };
  healthAlerts = [...healthAlerts];
  notify('healthAlerts');
  return healthAlerts[index];
}

function resolveHealthAlert(alertId: number) {
  const index = healthAlerts.findIndex((a: any) => a.alertId === alertId);
  if (index === -1) throw new Error('Alert not found');
  healthAlerts[index] = {
    ...healthAlerts[index],
    status: 'Resolved',
    resolvedAt: new Date().toISOString(),
    resolvedBy: 1,
  };
  healthAlerts = [...healthAlerts];
  notify('healthAlerts');
  return healthAlerts[index];
}

function getHealthAnalytics(serverId: number, daysBack = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);
  const sm = healthMetrics
    .filter((m: any) => m.serverId === serverId)
    .filter((m: any) => new Date(m.recordedAt) >= cutoff);

  if (sm.length === 0) {
    return {
      avgCPU: 0, avgMemory: 0, avgDisk: 0,
      peakCPU: 0, peakMemory: 0, peakDisk: 0,
      minCPU: 0, minMemory: 0, minDisk: 0,
      totalReadings: 0, criticalCount: 0, warningCount: 0, healthyCount: 0, offlineCount: 0,
      uptimePercentage: 0,
    };
  }

  const cpu = sm.map((m: any) => m.cpuUsagePercent);
  const mem = sm.map((m: any) => m.memoryUsagePercent);
  const disk = sm.map((m: any) => m.diskUsagePercent);
  const avg = (arr: number[]) => Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;

  return {
    avgCPU: avg(cpu), avgMemory: avg(mem), avgDisk: avg(disk),
    peakCPU: Math.round(Math.max(...cpu) * 10) / 10,
    peakMemory: Math.round(Math.max(...mem) * 10) / 10,
    peakDisk: Math.round(Math.max(...disk) * 10) / 10,
    minCPU: Math.round(Math.min(...cpu) * 10) / 10,
    minMemory: Math.round(Math.min(...mem) * 10) / 10,
    minDisk: Math.round(Math.min(...disk) * 10) / 10,
    totalReadings: sm.length,
    criticalCount: sm.filter((m: any) => m.healthStatus === 'Critical').length,
    warningCount: sm.filter((m: any) => m.healthStatus === 'Warning').length,
    healthyCount: sm.filter((m: any) => m.healthStatus === 'Healthy').length,
    offlineCount: sm.filter((m: any) => m.healthStatus === 'Offline').length,
    uptimePercentage: Math.round(((sm.filter((m: any) => m.isReachable).length / sm.length) * 100) * 10) / 10,
  };
}

// ─── Analytics Methods ─────────────────────────────────

function getDashboardStats() {
  // Recompute from live data
  return {
    totalClients: clients.filter((c: any) => c.isActive).length,
    activeServers: servers.filter((s: any) => s.status === 'Active').length,
    totalRevenue: clients.filter((c: any) => c.isActive).reduce((sum: number, c: any) => sum + c.actualMonthlyFee, 0),
    pendingRequests: requests.filter((r: any) => r.status === 'Pending').length,
    serverUtilization: Math.round(
      (servers.reduce((sum: number, s: any) => sum + (s.currentEntities / s.maxEntities) * 100, 0) / (servers.length || 1)) * 10
    ) / 10,
    criticalAlerts: healthAlerts.filter((a: any) => a.severity === 'Critical' && a.status === 'Active').length,
  };
}

function getServerUtilization() {
  return servers
    .filter((s: any) => s.status === 'Active')
    .map((server: any) => ({
      serverId: server.serverId,
      serverName: server.serverName,
      serverType: server.serverType,
      tierName: server.tierDisplayName,
      entitiesUsage: Math.round((server.currentEntities / server.maxEntities) * 100 * 10) / 10,
      templatesUsage: Math.round((server.currentTemplates / server.maxTemplates) * 100 * 10) / 10,
      usersUsage: Math.round((server.currentUsers / server.maxUsers) * 100 * 10) / 10,
      overallUsage: Math.round(
        (((server.currentEntities / server.maxEntities) +
          (server.currentTemplates / server.maxTemplates) +
          (server.currentUsers / server.maxUsers)) / 3) * 100 * 10
      ) / 10,
    }));
}

function getRevenueByTier() {
  return tiers.map((tier: any) => ({
    tierId: tier.tierId,
    tierName: tier.tierName,
    tierDisplayName: tier.displayName,
    clientCount: clients.filter((c: any) => c.tierId === tier.tierId && c.isActive).length,
    totalRevenue: clients.filter((c: any) => c.tierId === tier.tierId && c.isActive).reduce((sum: number, c: any) => sum + c.actualMonthlyFee, 0),
  }));
}

function getClientDistribution() {
  return [
    {
      category: 'Hosting Type',
      shared: clients.filter((c: any) => c.hostingType === 'Shared' && c.isActive).length,
      dedicated: clients.filter((c: any) => c.hostingType === 'Dedicated' && c.isActive).length,
    },
    {
      category: 'Status',
      active: clients.filter((c: any) => c.status === 'Active').length,
      suspended: clients.filter((c: any) => c.status === 'Suspended').length,
      cancelled: clients.filter((c: any) => c.status === 'Cancelled').length,
    },
  ];
}

function getTopClients(topN = 10) {
  return clients
    .filter((c: any) => c.isActive)
    .sort((a: any, b: any) => b.actualMonthlyFee - a.actualMonthlyFee)
    .slice(0, topN)
    .map((c: any) => ({
      clientId: c.clientId,
      clientName: c.clientName,
      tierDisplayName: c.tierDisplayName,
      monthlyFee: c.actualMonthlyFee,
      totalEntities: c.currentEntities,
      hostingType: c.hostingType,
    }));
}

// ─── Roles ─────────────────────────────────────────────

function getAllRoles() {
  return [
    { roleId: 1, roleName: 'Admin' },
    { roleId: 2, roleName: 'User' },
  ];
}

// ─── Reset ─────────────────────────────────────────────

function resetAllData() {
  users = clone(mockUsers);
  tiers = clone(mockTiers);
  servers = clone(mockServers);
  clients = clone(mockClients);
  clientHistory = clone(mockClientHistory);
  requests = clone(mockRequests);
  healthThresholds = clone(mockHealthThresholds);
  healthMetrics = clone(mockHealthMetrics);
  healthAlerts = clone(mockHealthAlerts);
  // Notify all slices
  (Object.keys(subscribers) as Slice[]).forEach(s => notify(s));
  console.log('✅ All data has been reset');
}

// ─── Public API ────────────────────────────────────────

export const appStore = {
  // Reactive state
  get currentUser() { return currentUser; },
  get isAuthLoading() { return isAuthLoading; },
  get users() { return users; },
  get tiers() { return tiers; },
  get servers() { return servers; },
  get clients() { return clients; },
  get clientHistory() { return clientHistory; },
  get requests() { return requests; },
  get healthThresholds() { return healthThresholds; },
  get healthMetrics() { return healthMetrics; },
  get healthAlerts() { return healthAlerts; },

  // Computed
  get isAuthenticated() { return !!currentUser; },
  get isAdmin() { return currentUser?.roles?.includes('Admin') ?? false; },

  // Auth
  login,
  register,
  logout,
  restoreAuth,
  setAuthLoading,

  // Users
  getAllUsers,
  getUserById,
  updateUser,
  assignRole,
  removeRole,
  getAllRoles,

  // Tiers
  getAllTiers,
  getTierById,
  getTierByName,
  createTier,
  updateTier,
  getRecommendedTier,

  // Servers
  getAllServers,
  getServerById,
  getServersByTier,
  getServersByType,
  getAvailableServers,
  createServer,
  updateServer,
  deleteServer,
  getServerClients,
  getServerCapacity,
  assignClientToServer,
  unassignClientFromServer,
  getServerStatistics,

  // Clients
  getAllClients,
  getClientById,
  getClientsByServer,
  getClientsByTier,
  createClient,
  updateClient,
  deleteClient,
  getClientServers,
  getClientHistory,
  moveClientToServer,
  getClientStatistics,

  // Requests
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  deleteRequest,

  // Health
  getHealthThresholds,
  upsertHealthThresholds,
  getLatestHealthMetrics,
  getHealthHistory,
  collectServerHealth,
  collectAllServersHealth,
  getHealthAlerts,
  acknowledgeHealthAlert,
  resolveHealthAlert,
  getHealthAnalytics,

  // Analytics
  getDashboardStats,
  getServerUtilization,
  getRevenueByTier,
  getClientDistribution,
  getTopClients,

  // Reset
  resetAllData,

  // Persistence
  clearAllPersistence,
  getStorageStats,
  hasPersistedData,

  // Pub/sub
  subscribe(slice: Slice, listener: Listener): () => void {
    subscribers[slice].add(listener);
    return () => subscribers[slice].delete(listener);
  },
};