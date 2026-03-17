import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Server, Database, CheckCircle2, 
  Loader2, Info, TrendingUp 
} from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { toast } from 'sonner';
import { formatZAR } from '../lib/currency';
import { Alert, AlertDescription } from '../components/ui/alert';
type TierSpec = MockTier['specifications'][number];

interface TierRecommendation {
  tier: MockTier;
  matchScore: number;
  canSupport: boolean;
  utilizationPercent: number;
  costEfficiency: number;
}

export function RequestsPageAPI() {
  const { tiers } = useAppStore('tiers');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<TierRecommendation[]>([]);
  const [formData, setFormData] = useState({ entities: '', templates: '', users: '' });

  const calculateRecommendations = () => {
    if (!formData.entities || !formData.templates || !formData.users) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const entities = parseInt(formData.entities);
    const templates = parseInt(formData.templates);
    const users = parseInt(formData.users);

    const results: TierRecommendation[] = tiers.map((tier) => {
      const canSupportEntities = tier.maxEntities >= entities;
      const canSupportTemplates = tier.maxTemplates >= templates;
      const canSupportUsers = tier.maxUsers >= users;
      const canSupport = canSupportEntities && canSupportTemplates && canSupportUsers;

      const entityUtil = (entities / tier.maxEntities) * 100;
      const templateUtil = (templates / tier.maxTemplates) * 100;
      const userUtil = (users / tier.maxUsers) * 100;
      const avgUtilization = (entityUtil + templateUtil + userUtil) / 3;

      let matchScore = 0;
      if (canSupport) {
        if (avgUtilization >= 60 && avgUtilization <= 80) matchScore = 100;
        else if (avgUtilization >= 50 && avgUtilization < 60) matchScore = 90;
        else if (avgUtilization > 80 && avgUtilization <= 90) matchScore = 85;
        else if (avgUtilization < 50) matchScore = 70 - (50 - avgUtilization);
        else matchScore = 60 - (avgUtilization - 90);
      }

      const totalCapacity = tier.maxEntities + tier.maxTemplates + tier.maxUsers;
      const costEfficiency = totalCapacity / tier.pricePerMonth;

      return { tier, matchScore, canSupport, utilizationPercent: avgUtilization, costEfficiency };
    });

    results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return a.tier.pricePerMonth - b.tier.pricePerMonth;
    });

    setRecommendations(results);
    setLoading(false);
  };

  const getUtilizationColor = (percent: number) => {
    if (percent > 90) return 'text-red-600';
    if (percent >= 80) return 'text-orange-600';
    if (percent >= 60) return 'text-green-600';
    return 'text-blue-600';
  };

  const getUtilizationLabel = (percent: number) => {
    if (percent > 90) return 'Too Close to Limit';
    if (percent >= 80) return 'High Utilization';
    if (percent >= 60) return 'Optimal Range';
    if (percent >= 40) return 'Good Headroom';
    return 'Low Utilization';
  };

  const getBadgeVariant = (score: number): 'default' | 'secondary' | 'outline' => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Server Tier Recommendations</h1>
        <p className="text-muted-foreground">Find the right server tier for your needs based on your usage requirements</p>
      </div>

      <Tabs defaultValue="recommendation" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recommendation">Get Recommendation</TabsTrigger>
          <TabsTrigger value="comparison">Compare All Tiers</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendation" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Enter Your Requirements</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert><Info className="size-4" /><AlertDescription>Enter your expected usage to get personalized tier recommendations. We'll suggest the best tier based on optimal utilization (60-80%) for cost efficiency and room to grow.</AlertDescription></Alert>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Number of Entities</Label><Input type="number" placeholder="e.g., 50000" value={formData.entities} onChange={(e) => setFormData({ ...formData, entities: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Number of Templates</Label><Input type="number" placeholder="e.g., 500" value={formData.templates} onChange={(e) => setFormData({ ...formData, templates: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Number of Users</Label><Input type="number" placeholder="e.g., 25" value={formData.users} onChange={(e) => setFormData({ ...formData, users: e.target.value })} /></div>
                </div>
                <Button onClick={calculateRecommendations} disabled={loading} className="w-full gap-2">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <TrendingUp className="size-4" />}
                  Get Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>

          {recommendations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3>Recommended Tiers</h3>
                <Badge variant="outline">{recommendations.filter((r) => r.canSupport).length} suitable tiers found</Badge>
              </div>

              {recommendations.map((rec, index) => {
                const appSpec = rec.tier.specifications?.find((s) => s.serverType === 'Application');
                const dbSpec = rec.tier.specifications?.find((s) => s.serverType === 'Database');
                return (
                  <Card key={rec.tier.tierId} className={`${index === 0 && rec.canSupport ? 'border-green-500 border-2' : !rec.canSupport ? 'opacity-60' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <CardTitle className="text-lg">{rec.tier.displayName}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{rec.tier.tierName}</p>
                          </div>
                          {index === 0 && rec.canSupport && <Badge className="gap-1 bg-green-600"><CheckCircle2 className="size-3" />Best Match</Badge>}
                          {!rec.canSupport && <Badge variant="destructive">Insufficient Capacity</Badge>}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{formatZAR(rec.tier.pricePerMonth)}</div>
                          <div className="text-xs text-muted-foreground">per month</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {rec.canSupport && (
                        <div className="grid md:grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Match Score</div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getBadgeVariant(rec.matchScore)}>{rec.matchScore.toFixed(0)}%</Badge>
                              <span className="text-xs text-muted-foreground">{rec.matchScore >= 90 ? 'Excellent fit' : rec.matchScore >= 70 ? 'Good fit' : 'Acceptable'}</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Avg Utilization</div>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${getUtilizationColor(rec.utilizationPercent)}`}>{rec.utilizationPercent.toFixed(1)}%</span>
                              <span className="text-xs text-muted-foreground">{getUtilizationLabel(rec.utilizationPercent)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm flex items-center gap-2"><Server className="size-4 text-blue-600" />Application Server Specs</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">CPU Cores:</span><span className="font-medium">{appSpec?.cpuCores || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">RAM:</span><span className="font-medium">{appSpec?.ramGB || '-'} GB</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Storage:</span><span className="font-medium">{appSpec?.storageGB || '-'} GB</span></div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm flex items-center gap-2"><Database className="size-4 text-purple-600" />Database Server Specs</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">CPU Cores:</span><span className="font-medium">{dbSpec?.cpuCores || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">RAM:</span><span className="font-medium">{dbSpec?.ramGB || '-'} GB</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Storage:</span><span className="font-medium">{dbSpec?.storageGB || '-'} GB</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <h4 className="font-semibold text-sm mb-2">Capacity Limits</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div><div className="text-muted-foreground">Entities</div><div className="font-medium">{rec.tier.maxEntities.toLocaleString()}{rec.canSupport && <span className={`ml-2 text-xs ${getUtilizationColor((parseInt(formData.entities) / rec.tier.maxEntities) * 100)}`}>({((parseInt(formData.entities) / rec.tier.maxEntities) * 100).toFixed(0)}%)</span>}</div></div>
                          <div><div className="text-muted-foreground">Templates</div><div className="font-medium">{rec.tier.maxTemplates.toLocaleString()}{rec.canSupport && <span className={`ml-2 text-xs ${getUtilizationColor((parseInt(formData.templates) / rec.tier.maxTemplates) * 100)}`}>({((parseInt(formData.templates) / rec.tier.maxTemplates) * 100).toFixed(0)}%)</span>}</div></div>
                          <div><div className="text-muted-foreground">Users</div><div className="font-medium">{rec.tier.maxUsers.toLocaleString()}{rec.canSupport && <span className={`ml-2 text-xs ${getUtilizationColor((parseInt(formData.users) / rec.tier.maxUsers) * 100)}`}>({((parseInt(formData.users) / rec.tier.maxUsers) * 100).toFixed(0)}%)</span>}</div></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comparison">
          <TierComparisonSection tiers={tiers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TierComparisonSection({ tiers }: { tiers: MockTier[] }) {
  if (tiers.length === 0) {
    return <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No tiers configured yet</p></CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Alert><Info className="size-4" /><AlertDescription>Compare all available server tiers side by side to understand the differences in capacity and pricing.</AlertDescription></Alert>
      <div className="grid gap-4">
        {tiers.map((tier) => {
          const appSpec = tier.specifications?.find((s) => s.serverType === 'Application');
          const dbSpec = tier.specifications?.find((s) => s.serverType === 'Database');
          return (
            <Card key={tier.tierId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div><CardTitle>{tier.displayName}</CardTitle><p className="text-sm text-muted-foreground mt-1">{tier.tierName}</p></div>
                  <div className="text-right"><div className="text-2xl font-bold text-green-600">{formatZAR(tier.pricePerMonth)}</div><div className="text-xs text-muted-foreground">per month</div></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><Server className="size-4 text-blue-600" />Application Server</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">CPU:</span><span className="font-medium">{appSpec?.cpuCores || '-'} cores</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">RAM:</span><span className="font-medium">{appSpec?.ramGB || '-'} GB</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Storage:</span><span className="font-medium">{appSpec?.storageGB || '-'} GB</span></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><Database className="size-4 text-purple-600" />Database Server</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">CPU:</span><span className="font-medium">{dbSpec?.cpuCores || '-'} cores</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">RAM:</span><span className="font-medium">{dbSpec?.ramGB || '-'} GB</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Storage:</span><span className="font-medium">{dbSpec?.storageGB || '-'} GB</span></div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t">
                  <h4 className="font-semibold text-sm mb-3">Capacity Limits</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg"><div className="text-2xl font-bold text-blue-600">{tier.maxEntities.toLocaleString()}</div><div className="text-xs text-muted-foreground mt-1">Entities</div></div>
                    <div className="text-center p-3 bg-muted rounded-lg"><div className="text-2xl font-bold text-purple-600">{tier.maxTemplates.toLocaleString()}</div><div className="text-xs text-muted-foreground mt-1">Templates</div></div>
                    <div className="text-center p-3 bg-muted rounded-lg"><div className="text-2xl font-bold text-orange-600">{tier.maxUsers.toLocaleString()}</div><div className="text-xs text-muted-foreground mt-1">Users</div></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}