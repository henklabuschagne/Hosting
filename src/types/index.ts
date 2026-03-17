export type ServerTier = 'small' | 'medium' | 'large';
export type HostingType = 'shared' | 'dedicated';
export type UserRole = 'user' | 'admin';
export type ServerType = 'application' | 'database';

// API Response Types
export interface ServerTierSpecApi {
  specId: number;
  tierId: number;
  serverType: string;
  cpuCores: number;
  ramGB: number;
  storageGB: number;
  backupEnabled: boolean;
  backupFrequency: string;
  backupRetentionDays: number;
  bandwidthMbps: number;
  publicIpIncluded: boolean;
  maxEntities: number;
  maxTemplates: number;
  maxUsers: number;
  monthlyPrice: number;
  createdDate: string;
  modifiedDate: string;
}

export interface ServerTierApi {
  tierId: number;
  tierName: string;
  displayName: string;
  description: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string;
  specifications: ServerTierSpecApi[];
}

// Server API Response Types
export interface ServerApi {
  serverId: number;
  serverName: string;
  tierId: number;
  tierName: string;
  tierDisplayName: string;
  serverType: string;
  hostingType: string;
  cpuCores: number;
  ramGB: number;
  storageGB: number;
  location: string;
  ipAddress: string;
  currentEntities: number;
  currentTemplates: number;
  currentUsers: number;
  status: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string;
  notes: string;
}

export interface ServerStatisticsApi {
  totalServers: number;
  activeServers: number;
  maintenanceServers: number;
  inactiveServers: number;
  applicationServers: number;
  databaseServers: number;
  sharedServers: number;
  dedicatedServers: number;
}

export interface ServerCapacitySummaryApi {
  serverId: number;
  serverName: string;
  serverType: string;
  currentEntities: number;
  currentTemplates: number;
  currentUsers: number;
  maxEntities: number;
  maxTemplates: number;
  maxUsers: number;
  entitiesUsagePercent: number;
  templatesUsagePercent: number;
  usersUsagePercent: number;
}

// Client API Response Types
export interface ClientApi {
  clientId: number;
  clientName: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  currentApplicationServerId: number | null;
  currentDatabaseServerId: number | null;
  hostingType: string;
  tierId: number;
  tierName: string;
  tierDisplayName: string;
  currentEntities: number;
  currentTemplates: number;
  currentUsers: number;
  discussedMonthlyFee: number | null;
  actualMonthlyFee: number;
  startDate: string;
  endDate: string | null;
  status: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string;
  notes: string;
  applicationServerName: string;
  databaseServerName: string;
}

export interface ClientHistoryApi {
  historyId: number;
  clientId: number;
  applicationServerId: number | null;
  databaseServerId: number | null;
  tierId: number;
  tierName: string;
  tierDisplayName: string;
  hostingType: string;
  monthlyFee: number;
  startDate: string;
  endDate: string | null;
  changeReason: string;
  createdDate: string;
  applicationServerName: string;
  databaseServerName: string;
}

export interface ClientStatisticsApi {
  totalClients: number;
  activeClients: number;
  suspendedClients: number;
  cancelledClients: number;
  sharedHostingClients: number;
  dedicatedHostingClients: number;
  totalMonthlyRevenue: number;
  averageMonthlyFee: number;
}

// =============================================
// Server Health Types
// =============================================
export interface ServerHealthThresholdApi {
  thresholdId: number;
  serverId: number;
  
  cpuWarningThreshold: number;
  cpuCriticalThreshold: number;
  memoryWarningThreshold: number;
  memoryCriticalThreshold: number;
  diskWarningThreshold: number;
  diskCriticalThreshold: number;
  
  healthCheckUrl: string | null;
  healthCheckEnabled: boolean;
  checkIntervalMinutes: number;
  
  emailAlertsEnabled: boolean;
  alertEmailAddresses: string | null;
  
  createdDate: string;
  modifiedDate: string;
}

export interface ServerHealthMetricApi {
  metricId: number;
  serverId: number;
  serverName: string;
  serverType: string;
  
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  memoryUsedGB: number;
  memoryTotalGB: number;
  diskUsagePercent: number;
  diskUsedGB: number;
  diskTotalGB: number;
  
  networkInMbps: number | null;
  networkOutMbps: number | null;
  uptimeDays: number | null;
  activeConnections: number | null;
  
  healthStatus: 'Healthy' | 'Warning' | 'Critical' | 'Offline';
  responseTimeMs: number | null;
  isReachable: boolean;
  errorMessage: string | null;
  
  recordedAt: string;
}

export interface ServerHealthAlertApi {
  alertId: number;
  serverId: number;
  serverName: string;
  serverType: string;
  
  alertType: 'CPU' | 'Memory' | 'Disk' | 'Network' | 'Offline' | 'Custom';
  severity: 'Warning' | 'Critical' | 'Info';
  title: string;
  message: string;
  
  metricName: string;
  currentValue: number;
  thresholdValue: number;
  
  status: 'Active' | 'Acknowledged' | 'Resolved' | 'Expired';
  emailSent: boolean;
  emailSentAt: string | null;
  
  acknowledgedAt: string | null;
  acknowledgedBy: number | null;
  resolvedAt: string | null;
  resolvedBy: number | null;
  
  createdAt: string;
}

export interface ServerHealthAnalyticsApi {
  avgCPU: number;
  avgMemory: number;
  avgDisk: number;
  
  peakCPU: number;
  peakMemory: number;
  peakDisk: number;
  
  minCPU: number;
  minMemory: number;
  minDisk: number;
  
  totalReadings: number;
  criticalCount: number;
  warningCount: number;
  healthyCount: number;
  offlineCount: number;
  
  uptimePercentage: number;
}

export interface ServerTierConfig {
  id: string;
  name: ServerTier;
  maxEntities: number;
  maxUsers: number;
  maxTemplates: number;
  basePrice: number;
  specs: {
    application: {
      cpu: string;
      ram: string;
      storage: string;
    };
    database: {
      cpu: string;
      ram: string;
      storage: string;
    };
  };
  backupServices: {
    frequency: string;
    retention: string;
    type: string;
  };
  networkServices: {
    bandwidth: string;
    ddosProtection: boolean;
    loadBalancing: boolean;
  };
}

export interface Server {
  id: string;
  name: string;
  tier: ServerTier;
  type: HostingType;
  serverType: ServerType; // application or database
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    location: string;
  };
  currentLoad: {
    entities: number;
    users: number;
    templates: number;
  };
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: string;
}

export interface HostingChange {
  id: string;
  date: string;
  type: 'migration' | 'upgrade' | 'downgrade' | 'pricing' | 'setup';
  description: string;
  previousValue?: string;
  newValue?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  serverId: string; // application server
  dbServerId: string; // database server
  hostingType: HostingType;
  startDate: string;
  agreedFee: number;
  currentFee: number;
  usage: {
    entities: number;
    users: number;
    templates: number;
  };
  status: 'active' | 'suspended' | 'pending';
  history: HostingChange[];
}

export interface ServerRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  requestedEntities: number;
  requestedUsers: number;
  requestedTemplates: number;
  suggestedTier?: ServerTier;
  suggestedType?: HostingType;
  estimatedPrice?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}