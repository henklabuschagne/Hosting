import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Loader2, Sparkles, Check } from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { toast } from 'sonner';

interface RecommendedTier {
  tierId: number;
  tierName: string;
  displayName: string;
  description: string;
  maxEntities: number;
  maxTemplates: number;
  maxUsers: number;
}

export function TierRecommendationForm() {
  const { actions } = useAppStore('tiers');
  const [formData, setFormData] = useState({
    entities: '',
    templates: '',
    users: '',
  });
  const [recommendation, setRecommendation] = useState<RecommendedTier | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const entities = parseInt(formData.entities);
    const templates = parseInt(formData.templates);
    const users = parseInt(formData.users);

    if (isNaN(entities) || isNaN(templates) || isNaN(users)) {
      toast.error('Please enter valid numbers');
      return;
    }

    setLoading(true);
    const result = await actions.getRecommendedTier({
      requestedEntities: entities,
      requestedTemplates: templates,
      requestedUsers: users,
    });
    setLoading(false);

    if (result.success) {
      setRecommendation(result.data);
      toast.success('Recommendation generated!');
    } else {
      toast.error(result.error.message);
      setRecommendation(null);
    }
  };

  const handleReset = () => {
    setFormData({ entities: '', templates: '', users: '' });
    setRecommendation(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-purple-600" />
          Server Tier Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entities">Number of Entities</Label>
              <Input
                id="entities"
                type="number"
                placeholder="e.g. 150"
                value={formData.entities}
                onChange={(e) => setFormData({ ...formData, entities: e.target.value })}
                required
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templates">Number of Templates</Label>
              <Input
                id="templates"
                type="number"
                placeholder="e.g. 75"
                value={formData.templates}
                onChange={(e) => setFormData({ ...formData, templates: e.target.value })}
                required
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="users">Number of Users</Label>
              <Input
                id="users"
                type="number"
                placeholder="e.g. 15"
                value={formData.users}
                onChange={(e) => setFormData({ ...formData, users: e.target.value })}
                required
                min="1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Get Recommendation
                </>
              )}
            </Button>
            {recommendation && (
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>

          {recommendation && (
            <Card className="mt-4 border-2 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Check className="size-6 text-white" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Recommended Tier:</h3>
                      <Badge className="capitalize bg-green-600">{recommendation.displayName}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="text-sm">
                        <div className="text-muted-foreground">Max Entities</div>
                        <div className="font-semibold">{recommendation.maxEntities.toLocaleString()}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-muted-foreground">Max Templates</div>
                        <div className="font-semibold">{recommendation.maxTemplates.toLocaleString()}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-muted-foreground">Max Users</div>
                        <div className="font-semibold">{recommendation.maxUsers.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 text-sm">
                      <Badge variant="outline">
                        Your requirements: {formData.entities} entities, {formData.templates} templates, {formData.users} users
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </CardContent>
    </Card>
  );
}