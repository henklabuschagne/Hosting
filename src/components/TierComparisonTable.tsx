import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Check, X, Server, Database } from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { formatZARShort } from '../lib/currency';
import type { MockTier } from '../lib/appStore';

export function TierComparisonTable() {
  const { tiers } = useAppStore('tiers');

  if (tiers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">No tiers configured</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const appSpec = tier.specifications.find(s => s.serverType === 'Application');
          const dbSpec = tier.specifications.find(s => s.serverType === 'Database');
          const totalPrice = (appSpec?.monthlyPrice || 0) + (dbSpec?.monthlyPrice || 0);

          return (
            <Card key={tier.tierId} className="relative overflow-hidden">
              {tier.tierName === 'medium' && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-blue-600">Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="capitalize">{tier.displayName}</CardTitle>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
                <div className="pt-4">
                  <div className="text-3xl font-bold">{formatZARShort(totalPrice)}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Application Server */}
                {appSpec && (
                  <div className="space-y-2 pb-3 border-b">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Server className="size-4 text-blue-600" />
                      Application Server
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CPU:</span>
                        <span>{appSpec.cpuCores} Cores</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RAM:</span>
                        <span>{appSpec.ramGB} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage:</span>
                        <span>{appSpec.storageGB} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bandwidth:</span>
                        <span>{appSpec.bandwidthMbps} Mbps</span>
                      </div>
                      <div className="flex items-center gap-1 pt-1">
                        {appSpec.publicIpIncluded ? (
                          <Check className="size-4 text-green-600" />
                        ) : (
                          <X className="size-4 text-red-600" />
                        )}
                        <span className="text-xs">Public IP Included</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Database Server */}
                {dbSpec && (
                  <div className="space-y-2 pb-3 border-b">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Database className="size-4 text-purple-600" />
                      Database Server
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CPU:</span>
                        <span>{dbSpec.cpuCores} Cores</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RAM:</span>
                        <span>{dbSpec.ramGB} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage:</span>
                        <span>{dbSpec.storageGB} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bandwidth:</span>
                        <span>{dbSpec.bandwidthMbps} Mbps</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Capacity Limits */}
                {appSpec && (
                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Capacity Limits</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Entities:</span>
                        <span className="font-semibold">{appSpec.maxEntities.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Templates:</span>
                        <span className="font-semibold">{appSpec.maxTemplates.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Users:</span>
                        <span className="font-semibold">{appSpec.maxUsers.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Backup Info */}
                {appSpec && (
                  <div className="space-y-2 pt-3 border-t">
                    <div className="text-sm font-semibold">Backup Services</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        {appSpec.backupEnabled ? (
                          <Check className="size-4 text-green-600" />
                        ) : (
                          <X className="size-4 text-red-600" />
                        )}
                        <span>Automated Backups</span>
                      </div>
                      {appSpec.backupEnabled && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Frequency:</span>
                            <span>{appSpec.backupFrequency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Retention:</span>
                            <span>{appSpec.backupRetentionDays} days</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}