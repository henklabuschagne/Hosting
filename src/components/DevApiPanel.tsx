import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Wrench, Database, Trash2, HardDrive, RefreshCw,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  Users, Server, Layers, FileInput, Activity, Bell, Shield, History
} from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';

interface StorageStats {
  totalBytes: number;
  sliceBytes: Record<string, number>;
  sliceCount: Record<string, number>;
}

const SLICE_META: Record<string, { label: string; icon: typeof Database }> = {
  users: { label: 'Users', icon: Users },
  tiers: { label: 'Tiers', icon: Layers },
  servers: { label: 'Servers', icon: Server },
  clients: { label: 'Clients', icon: Users },
  clientHistory: { label: 'Client History', icon: History },
  requests: { label: 'Requests', icon: FileInput },
  healthThresholds: { label: 'Health Thresholds', icon: Shield },
  healthMetrics: { label: 'Health Metrics', icon: Activity },
  healthAlerts: { label: 'Health Alerts', icon: Bell },
  auth: { label: 'Auth Session', icon: Shield },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function DevApiPanel() {
  const { actions } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const refreshStats = useCallback(() => {
    const s = actions.getStorageStats();
    setStats(s);
  }, [actions]);

  useEffect(() => {
    if (isOpen) {
      refreshStats();
    }
  }, [isOpen, refreshStats]);

  const handleResetToDefaults = () => {
    actions.clearAllPersistence();
    setConfirmResetOpen(false);
    setIsOpen(false);
    window.location.reload();
  };

  const isPersisted = actions.hasPersistedData();

  return (
    <>
      {/* Floating trigger button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-brand-main text-white rounded-full shadow-lg hover:bg-brand-main-light transition-colors"
          aria-label="Toggle Dev Panel"
        >
          <Wrench className="w-5 h-5" />
        </button>
      </div>

      {/* Slide-up panel */}
      {isOpen && (
        <div className="fixed bottom-14 right-4 z-50 w-[420px] max-h-[80vh] overflow-y-auto rounded-lg border-2 shadow-2xl bg-background">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Data Persistence
                  </CardTitle>
                  <CardDescription className="mt-1">
                    localStorage auto-sync across all domains
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Status indicator */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {isPersisted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Database className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="text-sm">
                    {isPersisted ? 'Persisted data loaded' : 'Using default seed data'}
                  </span>
                </div>
                <Badge variant={isPersisted ? 'default' : 'secondary'}>
                  {isPersisted ? 'Saved' : 'Defaults'}
                </Badge>
              </div>

              {/* Storage summary */}
              {stats && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Storage Used</span>
                    <span className="text-sm font-mono">{formatBytes(stats.totalBytes)}</span>
                  </div>

                  {/* Per-slice breakdown toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-muted-foreground"
                    onClick={() => setExpanded(!expanded)}
                  >
                    <span className="text-xs">Per-domain breakdown</span>
                    {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>

                  {expanded && (
                    <div className="space-y-1 rounded-lg border p-3 bg-muted/30">
                      {Object.entries(SLICE_META).map(([key, meta]) => {
                        const bytes = stats.sliceBytes[key] ?? 0;
                        const count = stats.sliceCount[key] ?? 0;
                        const Icon = meta.icon;
                        return (
                          <div key={key} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs">{meta.label}</span>
                              {count > 0 && (
                                <Badge variant="outline" className="text-[10px] h-4 px-1">
                                  {count}
                                </Badge>
                              )}
                            </div>
                            <span className={`text-xs font-mono ${bytes > 0 ? '' : 'text-muted-foreground'}`}>
                              {formatBytes(bytes)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2 text-xs"
                    onClick={refreshStats}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh Stats
                  </Button>
                </div>
              )}

              <Separator />

              {/* How it works */}
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Every mutation auto-persists the affected domain to <code className="px-1 py-0.5 bg-background rounded text-[10px]">localStorage</code>. 
                  On app startup, all 9 data slices are hydrated from saved data. 
                  ISO date strings are preserved through JSON round-trips.
                </p>
                <div className="flex flex-wrap gap-1">
                  {['users', 'tiers', 'servers', 'clients', 'clientHistory', 'requests', 'healthThresholds', 'healthMetrics', 'healthAlerts'].map(s => (
                    <Badge key={s} variant="outline" className="text-[10px] h-4 px-1.5">{s}</Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Reset to defaults */}
              <div className="space-y-2">
                <Dialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Reset All Data to Defaults
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Reset All Data?
                      </DialogTitle>
                      <DialogDescription>
                        This will permanently clear all saved data from localStorage and reload 
                        the app with the original demo seed data. You will be logged out.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border bg-destructive/5 p-3 space-y-1">
                      <p className="text-sm font-medium">This action will:</p>
                      <ul className="text-sm text-muted-foreground space-y-0.5 ml-4 list-disc">
                        <li>Clear all 9 domain slices from localStorage</li>
                        <li>Remove auth session (user + token)</li>
                        <li>Reload the app to the login page</li>
                        <li>Restore original mock/demo data</li>
                      </ul>
                    </div>
                    {stats && (
                      <p className="text-xs text-muted-foreground">
                        Currently using {formatBytes(stats.totalBytes)} across {
                          Object.values(stats.sliceBytes).filter(b => b > 0).length
                        } stored slices.
                      </p>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setConfirmResetOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleResetToDefaults} className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Reset & Reload
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <p className="text-[11px] text-center text-muted-foreground">
                  Clears all <code className="px-1 py-0.5 bg-muted rounded">hpm_store_*</code> keys and reloads the app
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}