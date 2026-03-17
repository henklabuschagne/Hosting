import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  ArrowLeft, Settings, RefreshCw, TrendingUp, TrendingDown,
  Activity, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAppStore } from '../../hooks/useAppStore';
import { toast } from 'sonner@2.0.3';
import type { MockHealthMetric } from '../../lib/appStore';

export function ServerHealthDetail() {
  const { serverId } = useParams<{ serverId: string }>();
  const navigate = useNavigate();
  const { healthMetrics, reads, actions } = useAppStore('healthMetrics', 'servers');

  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(7);

  const sid = serverId ? parseInt(serverId) : 0;
  const latestMetrics = reads.getLatestHealthMetrics(sid);
  const latestMetric = latestMetrics[0] || null;

  // Compute start date from timeRange for history query
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRange);
  const history = reads.getHealthHistory(sid, startDate.toISOString());
  const analytics = reads.getHealthAnalytics(sid, timeRange);

  const handleRefresh = async () => {
    if (!serverId) return;
    setRefreshing(true);
    const result = await actions.collectServerHealth(sid);
    setRefreshing(false);
    if (result.success) toast.success('Health data collected successfully');
    else toast.error(result.error.message);
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'text-green-600 bg-green-100';
      case 'Warning': return 'text-yellow-600 bg-yellow-100';
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'Offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (timeRange === 7) {
      return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    }
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatChartData = (metrics: MockHealthMetric[]) => {
    return metrics.map((m) => ({
      time: formatDate(m.recordedAt),
      cpu: m.cpuUsagePercent,
      memory: m.memoryUsagePercent,
      disk: m.diskUsagePercent,
    }));
  };

  if (!latestMetric) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Health Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Configure health monitoring to start collecting metrics
            </p>
            <Button onClick={() => navigate(`/servers/${serverId}/health/settings`)}>
              <Settings className="w-4 h-4 mr-2" />
              Configure Monitoring
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = formatChartData(history);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl mb-1">{latestMetric.serverName}</h1>
            <p className="text-muted-foreground">
              Server Health Monitoring • {latestMetric.serverType}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Collect Now
          </Button>
          <Button onClick={() => navigate(`/servers/${serverId}/health/settings`)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Status</span>
              {latestMetric.healthStatus === 'Healthy' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : latestMetric.healthStatus === 'Warning' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              ) : (
                <Activity className="w-5 h-5 text-red-500" />
              )}
            </div>
            <Badge className={getHealthColor(latestMetric.healthStatus)}>
              {latestMetric.healthStatus}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">CPU Usage</div>
            <div className="text-2xl font-bold">{latestMetric.cpuUsagePercent.toFixed(1)}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${
                  latestMetric.cpuUsagePercent >= 90 ? 'bg-brand-error' :
                  latestMetric.cpuUsagePercent >= 70 ? 'bg-brand-warning' : 'bg-brand-success'
                }`}
                style={{ width: `${Math.min(latestMetric.cpuUsagePercent, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Memory Usage</div>
            <div className="text-2xl font-bold">{latestMetric.memoryUsagePercent.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              {latestMetric.memoryUsedGB.toFixed(1)} / {latestMetric.memoryTotalGB.toFixed(1)} GB
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${
                  latestMetric.memoryUsagePercent >= 90 ? 'bg-brand-error' :
                  latestMetric.memoryUsagePercent >= 75 ? 'bg-brand-warning' : 'bg-brand-success'
                }`}
                style={{ width: `${Math.min(latestMetric.memoryUsagePercent, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Disk Usage</div>
            <div className="text-2xl font-bold">{latestMetric.diskUsagePercent.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              {latestMetric.diskUsedGB.toFixed(1)} / {latestMetric.diskTotalGB.toFixed(1)} GB
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${
                  latestMetric.diskUsagePercent >= 95 ? 'bg-brand-error' :
                  latestMetric.diskUsagePercent >= 80 ? 'bg-brand-warning' : 'bg-brand-success'
                }`}
                style={{ width: `${Math.min(latestMetric.diskUsagePercent, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Average Usage (Last {timeRange} days)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">CPU</span>
                <span className="font-medium">{analytics.avgCPU.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Memory</span>
                <span className="font-medium">{analytics.avgMemory.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Disk</span>
                <span className="font-medium">{analytics.avgDisk.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                Peak Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">CPU</span>
                <span className="font-medium text-red-600">{analytics.peakCPU.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Memory</span>
                <span className="font-medium text-red-600">{analytics.peakMemory.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Disk</span>
                <span className="font-medium text-red-600">{analytics.peakDisk.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                Uptime & Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="font-medium text-green-600">{analytics.uptimePercentage.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Healthy</span>
                <span className="font-medium">{analytics.healthyCount} readings</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Issues</span>
                <span className="font-medium text-yellow-600">
                  {analytics.warningCount + analytics.criticalCount} alerts
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Time Range Selector */}
      <div className="flex justify-end gap-2">
        <Button
          variant={timeRange === 7 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange(7)}
        >
          7 Days
        </Button>
        <Button
          variant={timeRange === 30 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange(30)}
        >
          30 Days
        </Button>
        <Button
          variant={timeRange === 90 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeRange(90)}
        >
          90 Days
        </Button>
      </div>

      {/* Resource Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Usage Trends</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="cpu"
                stackId="1"
                stroke="#456E92"
                fill="#456E92"
                fillOpacity={0.6}
                name="CPU %"
              />
              <Area
                type="monotone"
                dataKey="memory"
                stackId="2"
                stroke="#7AA2C0"
                fill="#7AA2C0"
                fillOpacity={0.6}
                name="Memory %"
              />
              <Area
                type="monotone"
                dataKey="disk"
                stackId="3"
                stroke="#5F966C"
                fill="#5F966C"
                fillOpacity={0.6}
                name="Disk %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPU Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="cpu" stroke="#456E92" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Memory Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="memory" stroke="#7AA2C0" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Disk Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Disk Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="disk" stroke="#5F966C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {new Date(latestMetric.recordedAt).toLocaleString()}
        {latestMetric.responseTimeMs && ` • Response time: ${latestMetric.responseTimeMs}ms`}
      </div>
    </div>
  );
}