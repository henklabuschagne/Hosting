import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Plus, Edit, Trash2, Loader2, AlertCircle, Mail, Phone } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { toast } from 'sonner';
import { formatZAR } from '../../lib/currency';
import { Alert, AlertDescription } from '../ui/alert';
import type { MockClient, MockServer, MockTier } from '../../lib/appStore';

export function ClientManagementAPI() {
  const navigate = useNavigate();
  const { clients, servers, tiers, actions } = useAppStore('clients', 'servers', 'tiers');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const handleDelete = async (clientId: number) => {
    if (!confirm('Are you sure you want to delete this client? This will also update server loads.')) return;
    setDeletingIds(prev => new Set(prev).add(clientId));
    const result = await actions.deleteClient(clientId);
    setDeletingIds(prev => { const next = new Set(prev); next.delete(clientId); return next; });
    if (result.success) toast.success('Client deleted successfully');
    else toast.error(result.error.message);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            Manage your hosting clients. Add new clients or click on a client to view details.
          </AlertDescription>
        </Alert>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Client</DialogTitle>
              <DialogDescription>
                Add a new client to the hosting platform
              </DialogDescription>
            </DialogHeader>
            <CreateClientForm
              servers={servers}
              tiers={tiers}
              actions={actions}
              onSuccess={() => {
                setIsCreateDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {clients.map((client) => (
          <Card 
            key={client.clientId} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/clients/${client.clientId}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{client.clientName}</CardTitle>
                  {client.companyName && (
                    <p className="text-sm text-muted-foreground mt-1">{client.companyName}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                    {client.status}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {client.hostingType}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="text-xs truncate">{client.contactEmail}</span>
                </div>
                {client.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <span className="text-xs">{client.contactPhone}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Tier</div>
                  <Badge variant="secondary" className="mt-1">{client.tierDisplayName}</Badge>
                </div>
                <div>
                  <div className="text-muted-foreground">Monthly Fee</div>
                  <div className="font-bold text-green-600 mt-1">{formatZAR(client.actualMonthlyFee)}</div>
                </div>
              </div>

              <div className="pt-2 border-t grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Entities</div>
                  <div className="font-medium">{client.currentEntities.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Templates</div>
                  <div className="font-medium">{client.currentTemplates.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Users</div>
                  <div className="font-medium">{client.currentUsers.toLocaleString()}</div>
                </div>
              </div>

              <div className="pt-2 border-t text-xs text-muted-foreground">
                <div>App: {client.applicationServerName || 'Not assigned'}</div>
                <div>DB: {client.databaseServerName || 'Not assigned'}</div>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => navigate(`/clients/${client.clientId}`)}
                >
                  <Edit className="size-4" />
                  View Details
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  disabled={deletingIds.has(client.clientId)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(client.clientId);
                  }}
                >
                  {deletingIds.has(client.clientId) ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clients.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No clients yet. Create your first client to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CreateClientForm({ servers, tiers, actions, onSuccess }: { servers: MockServer[]; tiers: MockTier[]; actions: ReturnType<typeof useAppStore>['actions']; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    currentApplicationServerId: '',
    currentDatabaseServerId: '',
    hostingType: 'Shared',
    tierId: '',
    currentEntities: '0',
    currentTemplates: '0',
    currentUsers: '0',
    discussedMonthlyFee: '',
    actualMonthlyFee: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'active',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    const result = await actions.createClient({
      clientName: formData.clientName,
      companyName: formData.companyName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      currentApplicationServerId: formData.currentApplicationServerId ? parseInt(formData.currentApplicationServerId) : undefined,
      currentDatabaseServerId: formData.currentDatabaseServerId ? parseInt(formData.currentDatabaseServerId) : undefined,
      hostingType: formData.hostingType,
      tierId: parseInt(formData.tierId),
      currentEntities: parseInt(formData.currentEntities),
      currentTemplates: parseInt(formData.currentTemplates),
      currentUsers: parseInt(formData.currentUsers),
      discussedMonthlyFee: formData.discussedMonthlyFee ? parseFloat(formData.discussedMonthlyFee) : undefined,
      actualMonthlyFee: parseFloat(formData.actualMonthlyFee),
      startDate: formData.startDate,
      status: formData.status,
      notes: formData.notes,
    });
    setLoading(false);
    if (result.success) {
      toast.success('Client created successfully');
      onSuccess();
    } else {
      toast.error(result.error.message);
    }
  };

  const appServers = servers.filter((s) => s.serverType === 'Application');
  const dbServers = servers.filter((s) => s.serverType === 'Database');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">Client Name *</Label>
          <Input
            id="clientName"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email *</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Phone</Label>
          <Input
            id="contactPhone"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tierId">Tier *</Label>
          <Select value={formData.tierId} onValueChange={(value) => setFormData({ ...formData, tierId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              {tiers.map((tier) => (
                <SelectItem key={tier.tierId} value={tier.tierId.toString()}>
                  {tier.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hostingType">Hosting Type *</Label>
          <Select value={formData.hostingType} onValueChange={(value) => setFormData({ ...formData, hostingType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Shared">Shared</SelectItem>
              <SelectItem value="Dedicated">Dedicated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="appServer">Application Server</Label>
          <Select value={formData.currentApplicationServerId} onValueChange={(value) => setFormData({ ...formData, currentApplicationServerId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select application server" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {appServers.map((server) => (
                <SelectItem key={server.serverId} value={server.serverId.toString()}>
                  {server.serverName} ({server.tierDisplayName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dbServer">Database Server</Label>
          <Select value={formData.currentDatabaseServerId} onValueChange={(value) => setFormData({ ...formData, currentDatabaseServerId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select database server" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {dbServers.map((server) => (
                <SelectItem key={server.serverId} value={server.serverId.toString()}>
                  {server.serverName} ({server.tierDisplayName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entities">Entities</Label>
          <Input
            id="entities"
            type="number"
            value={formData.currentEntities}
            onChange={(e) => setFormData({ ...formData, currentEntities: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="templates">Templates</Label>
          <Input
            id="templates"
            type="number"
            value={formData.currentTemplates}
            onChange={(e) => setFormData({ ...formData, currentTemplates: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="users">Users</Label>
          <Input
            id="users"
            type="number"
            value={formData.currentUsers}
            onChange={(e) => setFormData({ ...formData, currentUsers: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discussedFee">Discussed Fee</Label>
          <Input
            id="discussedFee"
            type="number"
            step="0.01"
            value={formData.discussedMonthlyFee}
            onChange={(e) => setFormData({ ...formData, discussedMonthlyFee: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="actualFee">Actual Fee *</Label>
          <Input
            id="actualFee"
            type="number"
            step="0.01"
            value={formData.actualMonthlyFee}
            onChange={(e) => setFormData({ ...formData, actualMonthlyFee: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          Create Client
        </Button>
      </div>
    </form>
  );
}