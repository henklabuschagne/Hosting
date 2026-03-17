import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Server, Database, Activity, AlertCircle, LayoutGrid, List } from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { toast } from 'sonner';
import type { MockServer, MockTier } from '../lib/appStore';

interface ServerFilters {
  status?: string;
  serverType?: string;
  tierId?: string;
}

type ServerWithCapacity = MockServer & { utilization: number; clientCount: number };

export function ServersPageAPI() {
  const navigate = useNavigate();
  const { servers, tiers, reads } = useAppStore('servers', 'tiers', 'clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ServerFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const serversWithCapacity = useMemo((): ServerWithCapacity[] => {
    return servers.map((server) => {
      const capacity = reads.getServerCapacity(server.serverId);
      const serverClients = reads.getServerClients(server.serverId);
      const avgUtil = capacity ? (capacity.entitiesUsagePercent + capacity.templatesUsagePercent + capacity.usersUsagePercent) / 3 : 0;
      return { ...server, utilization: avgUtil, clientCount: serverClients?.length || 0 };
    });
  }, [servers, reads]);

  const filteredServers = useMemo(() => {
    let filtered = serversWithCapacity;
    if (searchTerm) {
      filtered = filtered.filter((s) =>
        s.serverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filters.status) filtered = filtered.filter((s) => s.status === filters.status);
    if (filters.serverType) filtered = filtered.filter((s) => s.serverType === filters.serverType);
    if (filters.tierId) filtered = filtered.filter((s) => s.tierId.toString() === filters.tierId);
    filtered.sort((a, b) => a.serverName.localeCompare(b.serverName));
    return filtered;
  }, [serversWithCapacity, searchTerm, filters]);

  const handleExport = () => {
    const csvData = [
      ['Server Name', 'Type', 'Tier', 'Status', 'Location', 'IP Address', 'CPU Cores', 'RAM (GB)', 'Storage (GB)', 'Hosting Type', 'Clients', 'Utilization %'],
      ...filteredServers.map((s) => [
        s.serverName, s.serverType, s.tierDisplayName, s.status, s.location, s.ipAddress,
        s.cpuCores.toString(), s.ramGB.toString(), s.storageGB.toString(), s.hostingType,
        (s.clientCount || 0).toString(), (s.utilization || 0).toFixed(1)
      ])
    ];
    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `servers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Servers exported successfully');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Active: 'bg-brand-success-light text-brand-success border-brand-success-mid',
      Maintenance: 'bg-brand-warning-light text-brand-warning border-brand-warning-mid',
      Inactive: 'bg-brand-error-light text-brand-error border-brand-error-mid',
    };
    return <Badge variant="outline" className={styles[status] || ''}>{status}</Badge>;
  };

  const getUtilizationColor = (percent: number) => {
    if (percent >= 90) return 'text-brand-error';
    if (percent >= 70) return 'text-brand-warning';
    return 'text-brand-success';
  };

  // Group servers by pairs for grid view
  const serverPairs: { app: ServerWithCapacity | null; db: ServerWithCapacity | null }[] = [];
  const appServers = filteredServers.filter((s) => s.serverType === 'Application');
  const dbServers = filteredServers.filter((s) => s.serverType === 'Database');
  appServers.forEach((app) => {
    const matchingDb = dbServers.find((db) =>
      db.tierName === app.tierName && db.hostingType === app.hostingType &&
      db.serverName.includes(app.serverName.split('-')[2])
    );
    serverPairs.push({ app, db: matchingDb || null });
  });
  dbServers.forEach((db) => {
    if (!serverPairs.some(pair => pair.db?.serverId === db.serverId)) {
      serverPairs.push({ app: null, db });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Server Management</h1>
          <p className="text-muted-foreground">View and manage all hosting servers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">Export</Button>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input placeholder="Search servers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Server Type</label>
              <select className="w-full border rounded-md px-3 py-2 bg-input-background" value={filters.serverType || 'all'} onChange={(e) => setFilters({ ...filters, serverType: e.target.value === 'all' ? undefined : e.target.value })}>
                <option value="all">All Types</option>
                <option value="Application">Application</option>
                <option value="Database">Database</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select className="w-full border rounded-md px-3 py-2 bg-input-background" value={filters.status || 'all'} onChange={(e) => setFilters({ ...filters, status: e.target.value === 'all' ? undefined : e.target.value })}>
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tier</label>
              <select className="w-full border rounded-md px-3 py-2 bg-input-background" value={filters.tierId || 'all'} onChange={(e) => setFilters({ ...filters, tierId: e.target.value === 'all' ? undefined : e.target.value })}>
                <option value="all">All Tiers</option>
                {tiers.map((tier) => <option key={tier.tierId} value={tier.tierId.toString()}>{tier.displayName}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-primary-light rounded-lg">
                <Activity className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Servers</p>
                <p className="text-2xl font-bold">{serversWithCapacity.filter((s) => s.status === 'Active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-success-light rounded-lg">
                <Server className="w-6 h-6 text-brand-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Application</p>
                <p className="text-2xl font-bold">{serversWithCapacity.filter((s) => s.serverType === 'Application').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-secondary-light rounded-lg">
                <Database className="w-6 h-6 text-brand-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Database</p>
                <p className="text-2xl font-bold">{serversWithCapacity.filter((s) => s.serverType === 'Database').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-warning-light rounded-lg">
                <AlertCircle className="w-6 h-6 text-brand-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold">{serversWithCapacity.filter((s) => s.status === 'Maintenance').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredServers.length} of {servers.length} servers
        </p>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          {serverPairs.map((pair, index) => {
            const server = pair.app || pair.db;
            if (!server) return null;
            return (
              <Card key={`pair-${server.serverId}-${index}`} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-brand-primary-light to-brand-secondary-light border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{server.tierDisplayName} - {server.hostingType}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{server.location} • Created {new Date(server.createdDate).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{server.tierName}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {pair.app && <ServerCard server={pair.app} icon={Server} navigate={navigate} getStatusBadge={getStatusBadge} getUtilizationColor={getUtilizationColor} />}
                    {pair.db && <ServerCard server={pair.db} icon={Database} navigate={navigate} getStatusBadge={getStatusBadge} getUtilizationColor={getUtilizationColor} />}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredServers.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No servers found matching your filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Server</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">CPU</TableHead>
                    <TableHead className="text-right">RAM</TableHead>
                    <TableHead className="text-right">Storage</TableHead>
                    <TableHead className="text-right">Clients</TableHead>
                    <TableHead className="text-right">Utilization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServers.map((server) => (
                    <TableRow
                      key={server.serverId}
                      className="cursor-pointer"
                      onClick={() => navigate(`/servers/${server.serverId}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {server.serverType === 'Application' ? (
                            <Server className="size-4 text-brand-primary" />
                          ) : (
                            <Database className="size-4 text-brand-secondary" />
                          )}
                          <div>
                            <div className="font-medium">{server.serverName}</div>
                            <div className="text-xs text-muted-foreground font-mono">{server.ipAddress}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{server.serverType}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(server.status)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{server.tierDisplayName}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{server.location}</TableCell>
                      <TableCell className="text-right text-sm">{server.cpuCores} cores</TableCell>
                      <TableCell className="text-right text-sm">{server.ramGB} GB</TableCell>
                      <TableCell className="text-right text-sm">{server.storageGB} GB</TableCell>
                      <TableCell className="text-right text-sm">{server.clientCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={server.utilization} className="h-2 w-16" />
                          <span className={`text-sm font-medium ${getUtilizationColor(server.utilization)}`}>
                            {server.utilization.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'list' && filteredServers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No servers found matching your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ServerCard({ server, icon: Icon, navigate, getStatusBadge, getUtilizationColor }: {
  server: ServerWithCapacity;
  icon: React.ElementType;
  navigate: (path: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getUtilizationColor: (percent: number) => string;
}) {
  return (
    <div className="space-y-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${Icon === Server ? 'bg-brand-primary-light' : 'bg-brand-secondary-light'}`}>
            <Icon className={`size-4 ${Icon === Server ? 'text-brand-primary' : 'text-brand-secondary'}`} />
          </div>
          <h4 className="font-semibold">{server.serverName}</h4>
        </div>
        {getStatusBadge(server.status)}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">CPU:</span><span className="font-medium">{server.cpuCores} Cores</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">RAM:</span><span className="font-medium">{server.ramGB} GB</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Storage:</span><span className="font-medium">{server.storageGB} GB</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">IP:</span><span className="font-mono text-xs">{server.ipAddress}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Clients:</span><span className="font-medium">{server.clientCount}</span></div>
      </div>
      <div className="space-y-2 pt-2 border-t">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-semibold">Utilization</h5>
          <span className={`text-sm font-medium ${getUtilizationColor(server.utilization)}`}>
            {server.utilization.toFixed(1)}%
          </span>
        </div>
        <Progress value={server.utilization} className="h-2" />
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Entities:</span><span>{server.currentEntities.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Templates:</span><span>{server.currentTemplates.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Users:</span><span>{server.currentUsers.toLocaleString()}</span></div>
        </div>
      </div>
      <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/servers/${server.serverId}`)}>View Details</Button>
    </div>
  );
}
