import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { DollarSign, Edit, Save, X, Server, Database, Loader2, Info } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { toast } from 'sonner';
import { formatZAR } from '../../lib/currency';
import { Alert, AlertDescription } from '../ui/alert';
type TierSpec = MockTier['specifications'][number];

interface TierSpecEditData {
  specId: number;
  cpuCores: number;
  ramGB: number;
  storageGB: number;
  backupEnabled: boolean;
  backupFrequency: string;
  backupRetentionDays: number;
  bandwidthMbps: number;
  publicIpIncluded: boolean;
  maxEntities: number;
  maxTemplates: number;
  maxUsers: number;
  monthlyPrice: number;
}

export function PricingManagementAPI() {
  const { tiers, actions } = useAppStore('tiers');
  const [editingSpecId, setEditingSpecId] = useState<number | null>(null);
  const [editData, setEditData] = useState<TierSpecEditData | null>(null);
  const [saving, setSaving] = useState(false);

  const handleEdit = (spec: TierSpec) => {
    setEditingSpecId(spec.specId);
    setEditData({ ...spec });
  };

  const handleSave = async () => {
    if (!editingSpecId || !editData) return;
    setSaving(true);
    const result = await actions.updateTierSpec(editingSpecId, {
      cpuCores: editData.cpuCores,
      ramGB: editData.ramGB,
      storageGB: editData.storageGB,
      backupEnabled: editData.backupEnabled,
      backupFrequency: editData.backupFrequency,
      backupRetentionDays: editData.backupRetentionDays,
      bandwidthMbps: editData.bandwidthMbps,
      publicIpIncluded: editData.publicIpIncluded,
      maxEntities: editData.maxEntities,
      maxTemplates: editData.maxTemplates,
      maxUsers: editData.maxUsers,
      monthlyPrice: editData.monthlyPrice,
    });
    setSaving(false);
    if (result.success) {
      toast.success('Tier specification updated successfully');
      setEditingSpecId(null);
      setEditData(null);
    } else {
      toast.error(result.error.message);
    }
  };

  const handleCancel = () => {
    setEditingSpecId(null);
    setEditData(null);
  };

  if (!tiers) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="size-4" />
        <AlertDescription>
          Each tier includes both Application and Database servers. 
          Click Edit on any server specification to update its configuration. Changes are saved immediately to the database.
        </AlertDescription>
      </Alert>

      {tiers.map((tier) => {
        const appSpec = tier.specifications.find((s: TierSpec) => s.serverType === 'Application');
        const dbSpec = tier.specifications.find((s: TierSpec) => s.serverType === 'Database');
        const totalPrice = (appSpec?.monthlyPrice || 0) + (dbSpec?.monthlyPrice || 0);

        return (
          <Card key={tier.tierId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="size-5 text-green-600" />
                    <CardTitle className="capitalize">{tier.displayName}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                </div>
                <Badge variant="outline" className="text-lg">
                  {formatZAR(totalPrice)}/mo
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Application Server Spec */}
                {appSpec && (
                  <SpecCard
                    spec={appSpec}
                    icon={Server}
                    title="Application Server"
                    isEditing={editingSpecId === appSpec.specId}
                    editData={editData}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    setEditData={setEditData}
                    saving={saving}
                  />
                )}

                {/* Database Server Spec */}
                {dbSpec && (
                  <SpecCard
                    spec={dbSpec}
                    icon={Database}
                    title="Database Server"
                    isEditing={editingSpecId === dbSpec.specId}
                    editData={editData}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    setEditData={setEditData}
                    saving={saving}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface SpecCardProps {
  spec: TierSpec;
  icon: React.ElementType;
  title: string;
  isEditing: boolean;
  editData: TierSpecEditData | null;
  onEdit: (spec: TierSpec) => void;
  onSave: () => void;
  onCancel: () => void;
  setEditData: (data: TierSpecEditData | null) => void;
  saving: boolean;
}

function SpecCard({
  spec,
  icon: Icon,
  title,
  isEditing,
  editData,
  onEdit,
  onSave,
  onCancel,
  setEditData,
  saving,
}: SpecCardProps) {
  const data = isEditing && editData ? editData : spec;

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-blue-600" />
          <h4 className="font-semibold">{title}</h4>
        </div>
        <Badge variant="secondary">{formatZAR(data.monthlyPrice || spec.monthlyPrice)}/mo</Badge>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">CPU Cores</Label>
            {isEditing ? (
              <Input
                type="number"
                value={data.cpuCores}
                onChange={(e) => setEditData({ ...editData!, cpuCores: parseInt(e.target.value) })}
              />
            ) : (
              <div className="text-sm">{spec.cpuCores} Cores</div>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">RAM</Label>
            {isEditing ? (
              <Input
                type="number"
                value={data.ramGB}
                onChange={(e) => setEditData({ ...editData!, ramGB: parseInt(e.target.value) })}
              />
            ) : (
              <div className="text-sm">{spec.ramGB} GB</div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Storage</Label>
          {isEditing ? (
            <Input
              type="number"
              value={data.storageGB}
              onChange={(e) => setEditData({ ...editData!, storageGB: parseInt(e.target.value) })}
            />
          ) : (
            <div className="text-sm">{spec.storageGB} GB</div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Bandwidth</Label>
          {isEditing ? (
            <Input
              type="number"
              value={data.bandwidthMbps}
              onChange={(e) => setEditData({ ...editData!, bandwidthMbps: parseInt(e.target.value) })}
            />
          ) : (
            <div className="text-sm">{spec.bandwidthMbps} Mbps</div>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t">
          <h5 className="text-xs font-semibold">Capacity Limits</h5>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Entities</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={data.maxEntities}
                  onChange={(e) => setEditData({ ...editData!, maxEntities: parseInt(e.target.value) })}
                />
              ) : (
                <div className="text-sm">{spec.maxEntities.toLocaleString()}</div>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Templates</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={data.maxTemplates}
                  onChange={(e) => setEditData({ ...editData!, maxTemplates: parseInt(e.target.value) })}
                />
              ) : (
                <div className="text-sm">{spec.maxTemplates.toLocaleString()}</div>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Users</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={data.maxUsers}
                  onChange={(e) => setEditData({ ...editData!, maxUsers: parseInt(e.target.value) })}
                />
              ) : (
                <div className="text-sm">{spec.maxUsers.toLocaleString()}</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <h5 className="text-xs font-semibold">Backup Configuration</h5>
          {isEditing ? (
            <>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={data.backupEnabled}
                  onCheckedChange={(checked) => setEditData({ ...editData!, backupEnabled: checked as boolean })}
                />
                <Label className="text-xs">Backup Enabled</Label>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Frequency</Label>
                <Input
                  value={data.backupFrequency}
                  onChange={(e) => setEditData({ ...editData!, backupFrequency: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Retention Days</Label>
                <Input
                  type="number"
                  value={data.backupRetentionDays}
                  onChange={(e) => setEditData({ ...editData!, backupRetentionDays: parseInt(e.target.value) })}
                />
              </div>
            </>
          ) : (
            <div className="text-sm space-y-1">
              <div>Enabled: {spec.backupEnabled ? 'Yes' : 'No'}</div>
              <div>Frequency: {spec.backupFrequency}</div>
              <div>Retention: {spec.backupRetentionDays} days</div>
            </div>
          )}
        </div>

        <div className="space-y-1 pt-2 border-t">
          <Label className="text-xs">Monthly Price</Label>
          {isEditing ? (
            <Input
              type="number"
              step="0.01"
              value={data.monthlyPrice}
              onChange={(e) => setEditData({ ...editData!, monthlyPrice: parseFloat(e.target.value) })}
            />
          ) : (
            <div className="text-sm">{formatZAR(spec.monthlyPrice)}</div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        {isEditing ? (
          <>
            <Button onClick={onSave} size="sm" className="gap-2" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save
            </Button>
            <Button onClick={onCancel} size="sm" variant="outline" className="gap-2" disabled={saving}>
              <X className="size-4" />
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => onEdit(spec)} size="sm" variant="outline" className="gap-2">
            <Edit className="size-4" />
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}