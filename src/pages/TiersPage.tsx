import { TierComparisonTable } from '../components/TierComparisonTable';
import { TierRecommendationForm } from '../components/TierRecommendationForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export function TiersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Server Tiers</h1>
        <p className="text-muted-foreground">
          Compare our server tier configurations and get recommendations
        </p>
      </div>

      <Tabs defaultValue="comparison" className="space-y-6">
        <TabsList>
          <TabsTrigger value="comparison">Tier Comparison</TabsTrigger>
          <TabsTrigger value="recommendation">Get Recommendation</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison">
          <TierComparisonTable />
        </TabsContent>

        <TabsContent value="recommendation">
          <TierRecommendationForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}