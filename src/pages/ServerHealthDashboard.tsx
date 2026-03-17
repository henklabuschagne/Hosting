import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Activity, AlertTriangle, CheckCircle, XCircle, 
  Server, Database, RefreshCw, Bell, Settings 
} from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { toast } from 'sonner@2.0.3';
import type { MockHealthMetric, MockHealthAlert } from '../lib/appStore';

export function ServerHealthDashboard() {
  const navigate = useNavigate();
  const { healthMetrics, healthAlerts, reads, actions } = useAppStore('healthMetrics', 'healthAlerts', 'servers');
  const [refreshing, setRefreshing] = useState(false);

  const metrics = reads.getLatestHealthMetrics();
  const alerts = reads.getHealthAlerts();

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await actions.collectAllServersHealth();
    setRefreshing(false);
    if (result.success) { toast.success('Health collection completed for all servers'); }
    else { toast.error(result.error.message); }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) { case 'Healthy': return 'bg-green-500'; case 'Warning': return 'bg-yellow-500'; case 'Critical': return 'bg-red-500'; case 'Offline': return 'bg-gray-500'; default: return 'bg-gray-400'; }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) { case 'Critical': return 'destructive'; case 'Warning': return 'default'; default: return 'secondary'; }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'Healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'Critical': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Offline': return <XCircle className="w-5 h-5 text-gray-500" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const healthyCount = metrics.filter((m) => m.healthStatus === 'Healthy').length;
  const warningCount = metrics.filter((m) => m.healthStatus === 'Warning').length;
  const criticalCount = metrics.filter((m) => m.healthStatus === 'Critical').length;
  const offlineCount = metrics.filter((m) => m.healthStatus === 'Offline').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Server Health Dashboard</h1>
          <p className="text-muted-foreground">Monitor resource usage and system health across all servers</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />Collect Now
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-success-light rounded-lg"><CheckCircle className="w-6 h-6 text-brand-success" /></div><div><p className="text-sm text-muted-foreground">Healthy</p><p className="text-2xl font-bold">{healthyCount}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-warning-light rounded-lg"><AlertTriangle className="w-6 h-6 text-brand-warning" /></div><div><p className="text-sm text-muted-foreground">Warning</p><p className="text-2xl font-bold">{warningCount}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-error-light rounded-lg"><XCircle className="w-6 h-6 text-brand-error" /></div><div><p className="text-sm text-muted-foreground">Critical</p><p className="text-2xl font-bold">{criticalCount}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-muted rounded-lg"><XCircle className="w-6 h-6 text-muted-foreground" /></div><div><p className="text-sm text-muted-foreground">Offline</p><p className="text-2xl font-bold">{offlineCount}</p></div></div></CardContent></Card>
      </div>

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Active Alerts ({alerts.length})</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/health/alerts')}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.alertId} className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer" onClick={() => navigate(`/servers/${alert.serverId}/health`)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(alert.severity) as 'default' | 'secondary' | 'destructive'}>{alert.severity}</Badge>
                      <span className="font-medium">{alert.serverName}</span>
                      <Badge variant="outline">{alert.alertType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Server Status</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.metricId} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/servers/${metric.serverId}/health`)}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {metric.serverType === 'Application' ? <Server className="w-5 h-5 text-blue-500" /> : <Database className="w-5 h-5 text-purple-500" />}
                        <div><p className="font-semibold">{metric.serverName}</p><p className="text-xs text-muted-foreground">{metric.serverType}</p></div>
                      </div>
                      {getHealthIcon(metric.healthStatus)}
                    </div>
                    <Badge className={`${getHealthStatusColor(metric.healthStatus)} text-white`}>{metric.healthStatus}</Badge>

                    {metric.isReachable ? (
                      <div className="space-y-2">
                        {[
                          { label: 'CPU', value: metric.cpuUsagePercent, warn: 70, crit: 90 },
                          { label: 'Memory', value: metric.memoryUsagePercent, warn: 75, crit: 90 },
                          { label: 'Disk', value: metric.diskUsagePercent, warn: 80, crit: 95 },
                        ].map(item => (
                          <div key={item.label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className={`font-medium ${item.value >= item.crit ? 'text-red-600' : item.value >= item.warn ? 'text-yellow-600' : ''}`}>{item.value.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all ${item.value >= item.crit ? 'bg-brand-error' : item.value >= item.warn ? 'bg-brand-warning' : 'bg-brand-success'}`} style={{ width: `${item.value}%` }} />
                            </div>
                          </div>
                        ))}
                        <div className="text-xs text-muted-foreground pt-2 border-t">Updated: {new Date(metric.recordedAt).toLocaleString()}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-red-600"><p className="font-medium">Server Unreachable</p><p className="text-xs">{metric.errorMessage}</p></div>
                    )}

                    <Button variant="outline" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); navigate(`/servers/${metric.serverId}/health/settings`); }}>
                      <Settings className="w-4 h-4 mr-2" />Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {metrics.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No health metrics available</p>
              <p className="text-sm">Configure health monitoring for your servers to see data here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}