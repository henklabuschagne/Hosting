import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  DollarSign, TrendingUp, TrendingDown, Users, 
  Server, AlertTriangle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useAppStore } from '../hooks/useAppStore';
import { formatZAR, formatZARShort } from '../lib/currency';

export function AnalyticsPageAPI() {
  const { clients, servers, reads } = useAppStore('clients', 'servers', 'tiers');

  const revenueAnalysis = useMemo(() => {
    const activeClients = clients.filter((c) => c.isActive);
    const totalRevenue = activeClients.reduce((sum, c) => sum + c.actualMonthlyFee, 0);
    const sortedByRevenue = [...activeClients].sort((a, b) => b.actualMonthlyFee - a.actualMonthlyFee);
    
    const tierRevenueMap = new Map<string, { revenue: number; clients: number }>();
    clients.forEach((client) => {
      const existing = tierRevenueMap.get(client.tierDisplayName) || { revenue: 0, clients: 0 };
      tierRevenueMap.set(client.tierDisplayName, {
        revenue: existing.revenue + (client.isActive ? client.actualMonthlyFee : 0),
        clients: existing.clients + 1,
      });
    });

    return {
      totalRevenue,
      averageRevenue: activeClients.length > 0 ? totalRevenue / activeClients.length : 0,
      highestPaying: sortedByRevenue.length > 0 ? { name: sortedByRevenue[0].clientName, amount: sortedByRevenue[0].actualMonthlyFee } : { name: 'N/A', amount: 0 },
      lowestPaying: sortedByRevenue.length > 0 ? { name: sortedByRevenue[sortedByRevenue.length - 1].clientName, amount: sortedByRevenue[sortedByRevenue.length - 1].actualMonthlyFee } : { name: 'N/A', amount: 0 },
      revenueByTier: Array.from(tierRevenueMap.entries()).map(([tier, data]) => ({ tier, revenue: data.revenue, clients: data.clients })),
    };
  }, [clients]);

  const capacityAnalysis = useMemo(() => {
    const serverCapacities = servers.map((server) => {
      const capacity = reads.getServerCapacity(server.serverId);
      const avgUtil = capacity ? (capacity.entitiesUsagePercent + capacity.templatesUsagePercent + capacity.usersUsagePercent) / 3 : 0;
      return { name: server.serverName, utilization: avgUtil };
    });

    return {
      serversNearCapacity: serverCapacities.filter(s => s.utilization >= 80 && s.utilization < 90).length,
      serversOptimal: serverCapacities.filter(s => s.utilization >= 40 && s.utilization < 80).length,
      serversUnderutilized: serverCapacities.filter(s => s.utilization < 40).length,
      averageUtilization: serverCapacities.reduce((sum, s) => sum + s.utilization, 0) / (serverCapacities.length || 1),
      criticalServers: serverCapacities.filter(s => s.utilization >= 90),
    };
  }, [servers, reads]);

  const clientAnalysis = useMemo(() => {
    const allClients = clients;
    const activeClients = allClients.filter((c) => c.status === 'Active');
    const hostingTypeMap = new Map<string, number>();
    allClients.forEach((c) => hostingTypeMap.set(c.hostingType, (hostingTypeMap.get(c.hostingType) || 0) + 1));

    const topByUsage = [...allClients]
      .sort((a, b) => (b.currentEntities + b.currentTemplates + b.currentUsers) - (a.currentEntities + a.currentTemplates + a.currentUsers))
      .slice(0, 5)
      .map((c) => ({ name: c.clientName, entities: c.currentEntities, templates: c.currentTemplates, users: c.currentUsers }));

    return {
      totalClients: allClients.length,
      activeClients: activeClients.length,
      suspendedClients: allClients.filter((c) => c.status === 'Suspended').length,
      cancelledClients: allClients.filter((c) => c.status === 'Cancelled').length,
      clientsByHostingType: Array.from(hostingTypeMap.entries()).map(([type, count]) => ({ type, count })),
      topClientsByUsage: topByUsage,
    };
  }, [clients]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Advanced Analytics</h1>
        <p className="text-muted-foreground">Deep insights into your hosting platform performance</p>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-success-light rounded-lg"><DollarSign className="w-6 h-6 text-brand-success" /></div><div><p className="text-sm text-muted-foreground">Total MRR</p><p className="text-2xl font-bold">{formatZARShort(revenueAnalysis.totalRevenue)}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-primary-light rounded-lg"><TrendingUp className="w-6 h-6 text-brand-primary" /></div><div><p className="text-sm text-muted-foreground">Avg per Client</p><p className="text-2xl font-bold">{formatZARShort(revenueAnalysis.averageRevenue)}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-6"><div><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-brand-success" /><span className="text-sm text-muted-foreground">Highest Paying</span></div><div className="font-semibold truncate">{revenueAnalysis.highestPaying.name}</div><div className="text-brand-success font-bold">{formatZAR(revenueAnalysis.highestPaying.amount)}</div></div></CardContent></Card>
            <Card><CardContent className="p-6"><div><div className="flex items-center gap-2 mb-2"><TrendingDown className="w-5 h-5 text-brand-warning" /><span className="text-sm text-muted-foreground">Lowest Paying</span></div><div className="font-semibold truncate">{revenueAnalysis.lowestPaying.name}</div><div className="text-brand-warning font-bold">{formatZAR(revenueAnalysis.lowestPaying.amount)}</div></div></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Revenue Distribution by Tier</CardTitle></CardHeader>
            <CardContent className="min-h-[400px]">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueAnalysis.revenueByTier}>
                  <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis key="xaxis" dataKey="tier" tick={{ fontSize: 12 }} stroke="#64748b" /><YAxis key="yaxis-left" yAxisId="left" tick={{ fontSize: 12 }} stroke="#64748b" /><YAxis key="yaxis-right" yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#64748b" /><Tooltip key="tooltip" /><Legend key="legend" />
                  <Bar key="revenue" yAxisId="left" dataKey="revenue" name="Revenue (ZAR)" fill="#5F966C" radius={[8, 8, 0, 0]} />
                  <Bar key="clients" yAxisId="right" dataKey="clients" name="Clients" fill="#456E92" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tier Revenue Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {revenueAnalysis.revenueByTier.sort((a, b) => b.revenue - a.revenue).map((tier) => (
                  <div key={tier.tier} className="flex items-center justify-between p-3 border rounded-lg">
                    <div><div className="font-semibold">{tier.tier}</div><div className="text-sm text-muted-foreground">{tier.clients} clients</div></div>
                    <div className="text-right"><div className="text-xl font-bold text-green-600">{formatZAR(tier.revenue)}</div><div className="text-xs text-muted-foreground">{tier.clients > 0 ? formatZAR(tier.revenue / tier.clients) : 'R0.00'} per client</div></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-error-light rounded-lg"><AlertTriangle className="w-6 h-6 text-brand-error" /></div><div><p className="text-sm text-muted-foreground">Critical (&ge;90%)</p><p className="text-2xl font-bold">{capacityAnalysis.criticalServers.length}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-warning-light rounded-lg"><AlertTriangle className="w-6 h-6 text-brand-warning" /></div><div><p className="text-sm text-muted-foreground">Near Capacity (80-90%)</p><p className="text-2xl font-bold">{capacityAnalysis.serversNearCapacity}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-success-light rounded-lg"><Server className="w-6 h-6 text-brand-success" /></div><div><p className="text-sm text-muted-foreground">Optimal (40-80%)</p><p className="text-2xl font-bold">{capacityAnalysis.serversOptimal}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-primary-light rounded-lg"><TrendingDown className="w-6 h-6 text-brand-primary" /></div><div><p className="text-sm text-muted-foreground">Underutilized (&lt;40%)</p><p className="text-2xl font-bold">{capacityAnalysis.serversUnderutilized}</p></div></div></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Platform Average Utilization</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-4xl font-bold mb-2">{capacityAnalysis.averageUtilization.toFixed(1)}%</div>
                  <div className="text-muted-foreground">
                    {capacityAnalysis.averageUtilization >= 80 ? 'Platform is running at high capacity' : capacityAnalysis.averageUtilization >= 60 ? 'Platform is optimally utilized' : 'Platform has significant available capacity'}
                  </div>
                </div>
                <div className="size-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={[{ name: 'Used', value: capacityAnalysis.averageUtilization }, { name: 'Available', value: 100 - capacityAnalysis.averageUtilization }]} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={60}>
                      <Cell key="cell-used" fill="#456E92" />
                      <Cell key="cell-available" fill="#E8EEF3" />
                    </Pie></PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {capacityAnalysis.criticalServers.length > 0 && (
            <Card className="border-red-500 border-2">
              <CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="size-5" />Critical Capacity Alerts</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {capacityAnalysis.criticalServers.map((server) => (
                    <div key={server.name} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2"><Server className="size-5 text-red-600" /><span className="font-semibold">{server.name}</span></div>
                      <Badge variant="destructive">{server.utilization.toFixed(1)}% utilized</Badge>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">These servers are running at critical capacity. Consider moving clients or upgrading infrastructure.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-primary-light rounded-lg"><Users className="w-6 h-6 text-brand-primary" /></div><div><p className="text-sm text-muted-foreground">Total Clients</p><p className="text-2xl font-bold">{clientAnalysis.totalClients}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-success-light rounded-lg"><TrendingUp className="w-6 h-6 text-brand-success" /></div><div><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold">{clientAnalysis.activeClients}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-warning-light rounded-lg"><AlertTriangle className="w-6 h-6 text-brand-warning" /></div><div><p className="text-sm text-muted-foreground">Suspended</p><p className="text-2xl font-bold">{clientAnalysis.suspendedClients}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-error-light rounded-lg"><TrendingDown className="w-6 h-6 text-brand-error" /></div><div><p className="text-sm text-muted-foreground">Cancelled</p><p className="text-2xl font-bold">{clientAnalysis.cancelledClients}</p></div></div></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Clients by Hosting Type</CardTitle></CardHeader>
            <CardContent className="min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clientAnalysis.clientsByHostingType}><CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis key="xaxis" dataKey="type" tick={{ fontSize: 12 }} stroke="#64748b" /><YAxis key="yaxis" tick={{ fontSize: 12 }} stroke="#64748b" /><Tooltip key="tooltip" /><Bar key="count" dataKey="count" name="Clients" fill="#7AA2C0" radius={[8, 8, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Top 5 Clients by Total Usage</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clientAnalysis.topClientsByUsage.map((client, index) => (
                  <div key={client.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3"><Badge variant="outline">#{index + 1}</Badge><span className="font-semibold">{client.name}</span></div>
                      <Badge variant="secondary">{(client.entities + client.templates + client.users).toLocaleString()} total</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div><div className="text-muted-foreground">Entities</div><div className="font-medium text-blue-600">{client.entities.toLocaleString()}</div></div>
                      <div><div className="text-muted-foreground">Templates</div><div className="font-medium text-purple-600">{client.templates.toLocaleString()}</div></div>
                      <div><div className="text-muted-foreground">Users</div><div className="font-medium text-orange-600">{client.users.toLocaleString()}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}