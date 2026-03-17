import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { ArrowLeft, Save, TestTube } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { toast } from 'sonner@2.0.3';

export function ServerHealthSettings() {
  const { serverId } = useParams<{ serverId: string }>();
  const navigate = useNavigate();
  const { healthThresholds, reads, actions } = useAppStore('healthThresholds', 'servers');
  
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const sid = serverId ? parseInt(serverId) : 0;

  const existingThresholds = reads.getHealthThresholds(sid);
  
  const [formData, setFormData] = useState({
    cpuWarningThreshold: existingThresholds?.cpuWarningThreshold ?? 70,
    cpuCriticalThreshold: existingThresholds?.cpuCriticalThreshold ?? 90,
    memoryWarningThreshold: existingThresholds?.memoryWarningThreshold ?? 75,
    memoryCriticalThreshold: existingThresholds?.memoryCriticalThreshold ?? 90,
    diskWarningThreshold: existingThresholds?.diskWarningThreshold ?? 80,
    diskCriticalThreshold: existingThresholds?.diskCriticalThreshold ?? 95,
    healthCheckUrl: existingThresholds?.healthCheckUrl || '',
    healthCheckEnabled: existingThresholds?.healthCheckEnabled ?? true,
    checkIntervalMinutes: existingThresholds?.checkIntervalMinutes ?? 60,
    emailAlertsEnabled: existingThresholds?.emailAlertsEnabled ?? true,
    alertEmailAddresses: existingThresholds?.alertEmailAddresses || '',
  });

  const handleSave = async () => {
    if (!serverId) return;
    if (formData.cpuWarningThreshold >= formData.cpuCriticalThreshold) { toast.error('CPU warning threshold must be less than critical threshold'); return; }
    if (formData.memoryWarningThreshold >= formData.memoryCriticalThreshold) { toast.error('Memory warning threshold must be less than critical threshold'); return; }
    if (formData.diskWarningThreshold >= formData.diskCriticalThreshold) { toast.error('Disk warning threshold must be less than critical threshold'); return; }
    if (formData.healthCheckEnabled && !formData.healthCheckUrl) { toast.error('Health check URL is required when monitoring is enabled'); return; }

    setSaving(true);
    const result = await actions.upsertServerHealthThresholds(sid, formData);
    setSaving(false);
    if (result.success) { toast.success('Health monitoring settings saved successfully'); navigate(`/servers/${serverId}/health`); }
    else toast.error(result.error.message);
  };

  const handleTestConnection = async () => {
    if (!serverId || !formData.healthCheckUrl) { toast.error('Please enter a health check URL first'); return; }
    setTesting(true);
    const result = await actions.collectServerHealth(sid);
    setTesting(false);
    if (result.success && result.data?.isReachable) {
      toast.success(`Connection successful! Response time: ${result.data.responseTimeMs}ms`);
    } else {
      toast.error(result.success ? `Connection failed: ${result.data?.errorMessage}` : result.error.message);
    }
  };

  if (!serverId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl mb-1">Health Monitoring Settings</h1>
          <p className="text-muted-foreground">
            Configure thresholds and monitoring for this server
          </p>
        </div>
      </div>

      {/* Health Check Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Health Check Configuration</CardTitle>
          <CardDescription>
            Configure the external API endpoint for health data collection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="healthCheckUrl">Health Check URL *</Label>
            <div className="flex gap-2">
              <Input
                id="healthCheckUrl"
                placeholder="https://your-server.com/api/health"
                value={formData.healthCheckUrl}
                onChange={(e) => setFormData({ ...formData, healthCheckUrl: e.target.value })}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={testing || !formData.healthCheckUrl}
              >
                <TestTube className="w-4 h-4 mr-2" />
                {testing ? 'Testing...' : 'Test'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              The API endpoint that returns server health metrics in JSON format
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Health Monitoring</Label>
              <p className="text-sm text-muted-foreground">
                Automatically collect health metrics every hour
              </p>
            </div>
            <Switch
              checked={formData.healthCheckEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, healthCheckEnabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkInterval">Check Interval (minutes)</Label>
            <Input
              id="checkInterval"
              type="number"
              min="5"
              max="1440"
              value={formData.checkIntervalMinutes}
              onChange={(e) => setFormData({ ...formData, checkIntervalMinutes: parseInt(e.target.value) || 60 })}
            />
            <p className="text-sm text-muted-foreground">
              How often to collect health metrics (minimum 5 minutes)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CPU Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>CPU Thresholds</CardTitle>
          <CardDescription>
            Set warning and critical levels for CPU usage percentage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpuWarning">Warning Threshold (%)</Label>
              <Input
                id="cpuWarning"
                type="number"
                min="0"
                max="100"
                value={formData.cpuWarningThreshold}
                onChange={(e) => setFormData({ ...formData, cpuWarningThreshold: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-sm text-muted-foreground">
                Generates a warning alert when exceeded
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpuCritical">Critical Threshold (%)</Label>
              <Input
                id="cpuCritical"
                type="number"
                min="0"
                max="100"
                value={formData.cpuCriticalThreshold}
                onChange={(e) => setFormData({ ...formData, cpuCriticalThreshold: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-sm text-muted-foreground">
                Generates a critical alert when exceeded
              </p>
            </div>
          </div>
          <div className="bg-muted p-3 rounded text-sm">
            Current: Warning at {formData.cpuWarningThreshold}%, Critical at {formData.cpuCriticalThreshold}%
          </div>
        </CardContent>
      </Card>

      {/* Memory Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Thresholds</CardTitle>
          <CardDescription>
            Set warning and critical levels for memory usage percentage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="memoryWarning">Warning Threshold (%)</Label>
              <Input
                id="memoryWarning"
                type="number"
                min="0"
                max="100"
                value={formData.memoryWarningThreshold}
                onChange={(e) => setFormData({ ...formData, memoryWarningThreshold: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memoryCritical">Critical Threshold (%)</Label>
              <Input
                id="memoryCritical"
                type="number"
                min="0"
                max="100"
                value={formData.memoryCriticalThreshold}
                onChange={(e) => setFormData({ ...formData, memoryCriticalThreshold: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="bg-muted p-3 rounded text-sm">
            Current: Warning at {formData.memoryWarningThreshold}%, Critical at {formData.memoryCriticalThreshold}%
          </div>
        </CardContent>
      </Card>

      {/* Disk Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Disk Thresholds</CardTitle>
          <CardDescription>
            Set warning and critical levels for disk usage percentage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diskWarning">Warning Threshold (%)</Label>
              <Input
                id="diskWarning"
                type="number"
                min="0"
                max="100"
                value={formData.diskWarningThreshold}
                onChange={(e) => setFormData({ ...formData, diskWarningThreshold: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diskCritical">Critical Threshold (%)</Label>
              <Input
                id="diskCritical"
                type="number"
                min="0"
                max="100"
                value={formData.diskCriticalThreshold}
                onChange={(e) => setFormData({ ...formData, diskCriticalThreshold: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="bg-muted p-3 rounded text-sm">
            Current: Warning at {formData.diskWarningThreshold}%, Critical at {formData.diskCriticalThreshold}%
          </div>
        </CardContent>
      </Card>

      {/* Email Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Email Alerts</CardTitle>
          <CardDescription>
            Configure email notifications for health alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Email Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Send email notifications when alerts are triggered
              </p>
            </div>
            <Switch
              checked={formData.emailAlertsEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, emailAlertsEnabled: checked })}
            />
          </div>

          {formData.emailAlertsEnabled && (
            <div className="space-y-2">
              <Label htmlFor="emails">Email Addresses</Label>
              <Input
                id="emails"
                placeholder="admin@example.com, ops@example.com"
                value={formData.alertEmailAddresses}
                onChange={(e) => setFormData({ ...formData, alertEmailAddresses: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Comma-separated list of email addresses to receive alerts
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}