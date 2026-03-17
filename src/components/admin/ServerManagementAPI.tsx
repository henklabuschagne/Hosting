import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Server, Database, Plus, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../ui/alert';
import type { MockServer, MockTier } from '../../lib/appStore';

export function ServerManagementAPI() {
  const { servers, tiers, actions } = useAppStore('servers', 'tiers');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<MockServer | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const handleDelete = async (serverId: number) => {
    if (!confirm('Are you sure you want to delete this server?')) return;
    setDeletingIds(prev => new Set(prev).add(serverId));
    const result = await actions.deleteServer(serverId);
    setDeletingIds(prev => { const next = new Set(prev); next.delete(serverId); return next; });
    if (result.success) toast.success('Server deleted successfully');
    else toast.error(result.error.message);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Alert><AlertCircle className="size-4" /><AlertDescription>Manage your hosting servers. Create new servers or update existing ones.</AlertDescription></Alert>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="size-4" />Add Server</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Create New Server</DialogTitle><DialogDescription>Add a new server to your hosting infrastructure</DialogDescription></DialogHeader>
            <CreateServerForm tiers={tiers} actions={actions} onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {servers.map((server) => (
          <Card key={server.serverId} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {server.serverType === 'Application' ? <Server className="size-5 text-blue-600" /> : <Database className="size-5 text-purple-600" />}
                  <CardTitle className="text-base">{server.serverName}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={server.status === 'Active' ? 'default' : 'secondary'}>{server.status}</Badge>
                  <Badge variant="outline" className="capitalize">{server.hostingType}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-muted-foreground">Tier</div><div className="font-medium">{server.tierDisplayName}</div></div>
                <div><div className="text-muted-foreground">Location</div><div className="font-medium">{server.location}</div></div>
                <div><div className="text-muted-foreground">CPU</div><div className="font-medium">{server.cpuCores} Cores</div></div>
                <div><div className="text-muted-foreground">RAM</div><div className="font-medium">{server.ramGB} GB</div></div>
                <div><div className="text-muted-foreground">Storage</div><div className="font-medium">{server.storageGB} GB</div></div>
                <div><div className="text-muted-foreground">IP Address</div><div className="font-mono text-xs">{server.ipAddress}</div></div>
              </div>
              <div className="pt-3 border-t space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Entities:</span><span>{server.currentEntities.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Templates:</span><span>{server.currentTemplates.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Users:</span><span>{server.currentUsers.toLocaleString()}</span></div>
              </div>
              <div className="flex gap-2 pt-3 border-t">
                <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => { setSelectedServer(server); setIsEditDialogOpen(true); }}><Edit className="size-4" />Edit</Button>
                <Button variant="destructive" size="sm" className="gap-2" disabled={deletingIds.has(server.serverId)} onClick={() => handleDelete(server.serverId)}>
                  {deletingIds.has(server.serverId) ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isEditDialogOpen && selectedServer && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent><DialogHeader><DialogTitle>Edit Server</DialogTitle><DialogDescription>Update server information</DialogDescription></DialogHeader>
            <EditServerForm server={selectedServer} actions={actions} onSuccess={() => { setIsEditDialogOpen(false); setSelectedServer(null); }} onCancel={() => { setIsEditDialogOpen(false); setSelectedServer(null); }} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CreateServerForm({ tiers, actions, onSuccess }: { tiers: MockTier[]; actions: ReturnType<typeof useAppStore>['actions']; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ serverName: '', tierId: '', serverType: 'Application', hostingType: 'Shared', location: '', ipAddress: '', status: 'Active', notes: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await actions.createServer({ serverName: formData.serverName, tierId: parseInt(formData.tierId), serverType: formData.serverType, hostingType: formData.hostingType, location: formData.location, ipAddress: formData.ipAddress, status: formData.status, notes: formData.notes });
    setLoading(false);
    if (result.success) { toast.success('Server created successfully'); onSuccess(); }
    else toast.error(result.error.message);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Server Name *</Label><Input value={formData.serverName} onChange={(e) => setFormData({ ...formData, serverName: e.target.value })} required /></div>
        <div className="space-y-2"><Label>Tier *</Label><Select value={formData.tierId} onValueChange={(v) => setFormData({ ...formData, tierId: v })}><SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger><SelectContent>{tiers.map((t) => <SelectItem key={t.tierId} value={t.tierId.toString()}>{t.displayName}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Server Type *</Label><Select value={formData.serverType} onValueChange={(v) => setFormData({ ...formData, serverType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Application">Application</SelectItem><SelectItem value="Database">Database</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label>Hosting Type *</Label><Select value={formData.hostingType} onValueChange={(v) => setFormData({ ...formData, hostingType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Shared">Shared</SelectItem><SelectItem value="Dedicated">Dedicated</SelectItem></SelectContent></Select></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Location *</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required /></div>
        <div className="space-y-2"><Label>IP Address *</Label><Input value={formData.ipAddress} onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })} required /></div>
      </div>
      <div className="space-y-2"><Label>Notes</Label><Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}Create Server</Button>
    </form>
  );
}

function EditServerForm({ server, actions, onSuccess, onCancel }: { server: MockServer; actions: ReturnType<typeof useAppStore>['actions']; onSuccess: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ serverName: server.serverName, location: server.location, ipAddress: server.ipAddress, status: server.status, notes: server.notes || '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await actions.updateServer(server.serverId, formData);
    setLoading(false);
    if (result.success) { toast.success('Server updated successfully'); onSuccess(); }
    else toast.error(result.error.message);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2"><Label>Server Name *</Label><Input value={formData.serverName} onChange={(e) => setFormData({ ...formData, serverName: e.target.value })} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Location *</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required /></div>
        <div className="space-y-2"><Label>IP Address *</Label><Input value={formData.ipAddress} onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })} required /></div>
      </div>
      <div className="space-y-2"><Label>Status *</Label><Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></div>
      <div className="space-y-2"><Label>Notes</Label><Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
      <div className="flex gap-2 pt-4"><Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button><Button type="submit" disabled={loading} className="flex-1">{loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}Update Server</Button></div>
    </form>
  );
}