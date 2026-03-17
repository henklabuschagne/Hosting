import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Bell, CheckCircle, XCircle, AlertTriangle, Search, Filter, Eye, Check, Server, Database, Activity } from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { toast } from 'sonner@2.0.3';
import type { MockHealthAlert } from '../lib/appStore';

export function HealthAlertsPage() {
  const navigate = useNavigate();
  const { healthAlerts, reads, actions } = useAppStore('healthAlerts');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

  const alerts = reads.getHealthAlerts();

  const filteredAlerts = useMemo(() => {
    let filtered: MockHealthAlert[] = [...alerts];
    if (searchTerm) {
      filtered = filtered.filter((a) => a.serverName.toLowerCase().includes(searchTerm.toLowerCase()) || a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.message.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (severityFilter !== 'all') filtered = filtered.filter((a) => a.severity.toLowerCase() === severityFilter);
    if (statusFilter !== 'all') filtered = filtered.filter((a) => a.status.toLowerCase() === statusFilter);
    return filtered;
  }, [alerts, searchTerm, severityFilter, statusFilter]);

  const handleAcknowledge = async (alertId: number) => {
    setLoadingIds(prev => new Set(prev).add(alertId));
    const result = await actions.acknowledgeHealthAlert(alertId);
    setLoadingIds(prev => { const next = new Set(prev); next.delete(alertId); return next; });
    if (result.success) toast.success('Alert acknowledged');
    else toast.error(result.error.message);
  };

  const handleResolve = async (alertId: number) => {
    setLoadingIds(prev => new Set(prev).add(alertId));
    const result = await actions.resolveHealthAlert(alertId);
    setLoadingIds(prev => { const next = new Set(prev); next.delete(alertId); return next; });
    if (result.success) toast.success('Alert resolved');
    else toast.error(result.error.message);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) { case 'Critical': return 'bg-red-100 text-red-800 border-red-200'; case 'Warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; case 'Info': return 'bg-blue-100 text-blue-800 border-blue-200'; default: return 'bg-gray-100 text-gray-800 border-gray-200'; }
  };
  const getStatusColor = (status: string) => {
    switch (status) { case 'Active': return 'bg-red-100 text-red-800'; case 'Acknowledged': return 'bg-yellow-100 text-yellow-800'; case 'Resolved': return 'bg-green-100 text-green-800'; default: return 'bg-gray-100 text-gray-800'; }
  };
  const getAlertTypeIcon = (type: string) => {
    const cls = "w-5 h-5";
    switch (type) { case 'CPU': return <Activity className={cls + " text-blue-500"} />; case 'Memory': return <Activity className={cls + " text-purple-500"} />; case 'Disk': return <Activity className={cls + " text-green-500"} />; case 'Offline': return <XCircle className={cls + " text-gray-500"} />; default: return <AlertTriangle className={cls + " text-yellow-500"} />; }
  };

  const activeCount = alerts.filter((a) => a.status === 'Active').length;
  const acknowledgedCount = alerts.filter((a) => a.status === 'Acknowledged').length;
  const criticalCount = alerts.filter((a) => a.severity === 'Critical' && a.status !== 'Resolved').length;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl mb-2">Health Alerts</h1>
      <p className="text-muted-foreground">Manage and monitor server health alerts</p></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-error-light rounded-lg"><Bell className="w-6 h-6 text-brand-error" /></div><div><p className="text-sm text-muted-foreground">Active Alerts</p><p className="text-2xl font-bold">{activeCount}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-warning-light rounded-lg"><Eye className="w-6 h-6 text-brand-warning" /></div><div><p className="text-sm text-muted-foreground">Acknowledged</p><p className="text-2xl font-bold">{acknowledgedCount}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-error-light rounded-lg"><AlertTriangle className="w-6 h-6 text-brand-error" /></div><div><p className="text-sm text-muted-foreground">Critical</p><p className="text-2xl font-bold">{criticalCount}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-brand-primary-light rounded-lg"><Bell className="w-6 h-6 text-brand-primary" /></div><div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{alerts.length}</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search alerts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}><SelectTrigger className="w-full md:w-[180px]"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Severities</SelectItem><SelectItem value="critical">Critical</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="info">Info</SelectItem></SelectContent></Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full md:w-[180px]"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="acknowledged">Acknowledged</SelectItem><SelectItem value="resolved">Resolved</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Alerts ({filteredAlerts.length})</CardTitle></CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12"><CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" /><h3 className="text-lg font-semibold mb-2">No Alerts Found</h3><p className="text-muted-foreground">{alerts.length === 0 ? 'All systems are healthy!' : 'No alerts match your current filters.'}</p></div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div key={alert.alertId} className={`border rounded-lg p-4 hover:bg-accent transition-colors ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertTypeIcon(alert.alertType)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                          <Badge variant="outline">{alert.alertType}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{alert.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          {alert.serverType === 'Application' ? <Server className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                          <span className="font-medium">{alert.serverName}</span><span>•</span><span>{alert.serverType}</span>
                        </div>
                        <p className="text-sm mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Current: <span className="font-semibold">{alert.currentValue.toFixed(1)}%</span></span>
                          <span>Threshold: <span className="font-semibold">{alert.thresholdValue.toFixed(1)}%</span></span>
                          <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                        </div>
                        {alert.acknowledgedAt && <div className="text-xs text-muted-foreground mt-1">Acknowledged: {new Date(alert.acknowledgedAt).toLocaleString()}</div>}
                        {alert.resolvedAt && <div className="text-xs text-green-600 mt-1">Resolved: {new Date(alert.resolvedAt).toLocaleString()}</div>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {alert.status === 'Active' && (
                        <>
                          <Button size="sm" variant="outline" disabled={loadingIds.has(alert.alertId)} onClick={() => handleAcknowledge(alert.alertId)}><Eye className="w-4 h-4 mr-2" />Acknowledge</Button>
                          <Button size="sm" variant="default" disabled={loadingIds.has(alert.alertId)} onClick={() => handleResolve(alert.alertId)}><Check className="w-4 h-4 mr-2" />Resolve</Button>
                        </>
                      )}
                      {alert.status === 'Acknowledged' && <Button size="sm" variant="default" disabled={loadingIds.has(alert.alertId)} onClick={() => handleResolve(alert.alertId)}><Check className="w-4 h-4 mr-2" />Resolve</Button>}
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/servers/${alert.serverId}/health`)}>View Server</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}