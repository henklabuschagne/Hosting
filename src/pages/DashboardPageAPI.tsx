import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { 
  DollarSign, Users, Server, Database, 
  TrendingUp, AlertTriangle, Activity,
  ArrowRight, Cpu, HardDrive
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, 
  Pie, Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../hooks/useAppStore';
import { formatZAR, formatZARShort } from '../lib/currency';

const COLORS = ['#456E92', '#7AA2C0', '#5F966C', '#CEA569', '#AB5A5C'];

export function DashboardPageAPI() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { clients, servers, reads } = useAppStore('clients', 'servers', 'tiers');

  // Compute stats from reactive state
  const stats = useMemo(() => {
    const activeClients = clients.filter((c) => c.status === 'Active').length;
    const activeServers = servers.filter((s) => s.status === 'Active').length;
    const totalRevenue = clients
      .filter((c) => c.isActive)
      .reduce((sum, c) => sum + c.actualMonthlyFee, 0);
    const totalEntities = clients.reduce((sum, c) => sum + c.currentEntities, 0);
    const totalUsers = clients.reduce((sum, c) => sum + c.currentUsers, 0);

    return {
      totalClients: clients.length,
      activeClients,
      totalServers: servers.length,
      activeServers,
      totalMonthlyRevenue: totalRevenue,
      averageRevenuePerClient: activeClients > 0 ? totalRevenue / activeClients : 0,
      totalEntities,
      totalUsers,
    };
  }, [clients, servers]);

  // Tier distribution
  const tierDistribution = useMemo(() => {
    const tierMap = new Map<number, { tierId: number; tierName: string; clientCount: number; revenue: number }>();
    clients.forEach((client) => {
      const existing = tierMap.get(client.tierId) || {
        tierId: client.tierId,
        tierName: client.tierDisplayName || `Tier ${client.tierId}`,
        clientCount: 0,
        revenue: 0,
      };
      tierMap.set(client.tierId, {
        tierId: existing.tierId,
        tierName: existing.tierName,
        clientCount: existing.clientCount + 1,
        revenue: existing.revenue + (client.isActive ? client.actualMonthlyFee : 0),
      });
    });
    return Array.from(tierMap.values());
  }, [clients]);

  // Server utilization from reactive reads
  const serverUtilization = useMemo(() => {
    return servers.map((server) => {
      const capacity = reads.getServerCapacity(server.serverId);
      const serverClients = reads.getServerClients(server.serverId);
      return {
        serverId: server.serverId,
        serverName: server.serverName,
        serverType: server.serverType,
        entitiesPercent: capacity?.entitiesUsagePercent || 0,
        templatesPercent: capacity?.templatesUsagePercent || 0,
        usersPercent: capacity?.usersUsagePercent || 0,
        clientCount: serverClients?.length || 0,
      };
    });
  }, [servers, reads]);

  // Client status breakdown
  const clientStatus = useMemo(() => {
    const statusMap = new Map<string, number>();
    clients.forEach((client) => {
      statusMap.set(client.status, (statusMap.get(client.status) || 0) + 1);
    });
    return Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
  }, [clients]);

  const getUtilizationColor = (percent: number) => {
    if (percent >= 90) return 'text-brand-error';
    if (percent >= 70) return 'text-brand-warning';
    return 'text-brand-success';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your hosting platform</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-primary-light rounded-lg">
                <Users className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold">{stats.activeClients}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.totalClients} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-success-light rounded-lg">
                <DollarSign className="w-6 h-6 text-brand-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatZARShort(stats.totalMonthlyRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatZARShort(stats.averageRevenuePerClient)} avg/client</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-secondary-light rounded-lg">
                <Server className="w-6 h-6 text-brand-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Servers</p>
                <p className="text-2xl font-bold">{stats.activeServers}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.totalServers} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-warning-light rounded-lg">
                <TrendingUp className="w-6 h-6 text-brand-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Entities</p>
                <p className="text-2xl font-bold">{stats.totalEntities.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.totalUsers.toLocaleString()} users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Distribution by Tier</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {tierDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tierDistribution}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis key="xaxis" dataKey="tierName" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis key="yaxis" tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip key="tooltip" />
                <Legend key="legend" />
                <Bar key="clientCount" dataKey="clientCount" name="Clients" fill="#456E92" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No tier data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution by Tier</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {tierDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  key="revenuePie"
                  data={tierDistribution}
                  dataKey="revenue"
                  nameKey="tierName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.tierName}: ${formatZARShort(entry.revenue)}`}
                >
                  {tierDistribution.map((entry, index) => (
                    <Cell key={`pie-cell-${entry.tierId}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip key="pieTooltip" formatter={(value: number) => formatZAR(value)} />
              </PieChart>
            </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No revenue data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client Status Overview</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/clients')} className="gap-2">
              View All
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {clientStatus.map((item) => (
              <div key={item.status} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={item.status === 'Active' ? 'default' : 'secondary'} className="capitalize">
                    {item.status}
                  </Badge>
                  <span className="text-2xl font-bold">{item.count}</span>
                </div>
                <Progress 
                  value={(item.count / stats.totalClients) * 100} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {((item.count / stats.totalClients) * 100).toFixed(1)}% of total
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Server Utilization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Server Utilization</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/servers')} className="gap-2">
              View All
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serverUtilization.map((server) => {
              const avgUtilization = (server.entitiesPercent + server.templatesPercent + server.usersPercent) / 3;
              return (
                <div 
                  key={server.serverId} 
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/servers/${server.serverId}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {server.serverType === 'Application' ? (
                        <Server className="size-5 text-blue-600" />
                      ) : (
                        <Database className="size-5 text-purple-600" />
                      )}
                      <div>
                        <div className="font-semibold">{server.serverName}</div>
                        <div className="text-sm text-muted-foreground">
                          {server.serverType} • {server.clientCount} clients
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={getUtilizationColor(avgUtilization)}
                      >
                        {avgUtilization.toFixed(1)}% avg
                      </Badge>
                      {avgUtilization >= 90 && (
                        <AlertTriangle className="size-5 text-red-600" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Entities</span>
                        <span className={getUtilizationColor(server.entitiesPercent)}>
                          {server.entitiesPercent.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={server.entitiesPercent} className="h-1.5" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Templates</span>
                        <span className={getUtilizationColor(server.templatesPercent)}>
                          {server.templatesPercent.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={server.templatesPercent} className="h-1.5" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Users</span>
                        <span className={getUtilizationColor(server.usersPercent)}>
                          {server.usersPercent.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={server.usersPercent} className="h-1.5" />
                    </div>
                  </div>

                  {avgUtilization >= 70 && (
                    <div className={`mt-3 pt-3 border-t text-sm ${getUtilizationColor(avgUtilization)}`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4" />
                        <span>{avgUtilization >= 90 ? 'Critical: Server near capacity' : 'Warning: Consider capacity planning'}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {serverUtilization.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No servers configured</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-3">
              <Button variant="outline" className="gap-2" onClick={() => navigate('/clients')}>
                <Users className="size-4" />
                Manage Clients
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => navigate('/servers')}>
                <Server className="size-4" />
                Manage Servers
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => navigate('/tiers')}>
                <Cpu className="size-4" />
                Configure Tiers
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => navigate('/requests')}>
                <HardDrive className="size-4" />
                View Requests
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}