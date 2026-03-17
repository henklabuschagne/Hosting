import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  ArrowLeft, Server, Database, Cpu, HardDrive, 
  MemoryStick, MapPin, Network, Activity,
  Loader2, Edit, Users
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../hooks/useAppStore';
import { toast } from 'sonner';
import { formatZAR } from '../lib/currency';
import type { MockServer, MockClient } from '../lib/appStore';

export function ServerDetailPageAPI() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { reads, actions } = useAppStore('servers', 'clients');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);

  const serverId = id ? parseInt(id) : 0;
  const server = reads.getServerById(serverId);
  const capacity = server ? reads.getServerCapacity(serverId) : null;
  const serverClients = reads.getServerClients(serverId);

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'text-red-600';
    if (percent >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  if (!server) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Server not found</p>
        <Button onClick={() => navigate('/servers')} className="mt-4">Back to Servers</Button>
      </div>
    );
  }

  const ServerIcon = server.serverType === 'Application' ? Server : Database;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/servers')}><ArrowLeft className="size-4 mr-2" />Back</Button>
          <div className="flex items-center gap-3">
            <ServerIcon className="size-8 text-blue-600" />
            <div><h1 className="text-3xl mb-1">{server.serverName}</h1><p className="text-muted-foreground">{server.tierDisplayName} - {server.serverType}</p></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={server.status === 'Active' ? 'default' : server.status === 'Maintenance' ? 'secondary' : 'destructive'}>{server.status}</Badge>
          <Badge variant="outline" className="capitalize">{server.hostingType}</Badge>
          {isAdmin && <Button onClick={() => setIsEditDialogOpen(true)} className="gap-2"><Edit className="size-4" />Edit Server</Button>}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Cpu className="size-8 text-blue-600" /><div><div className="text-2xl font-bold">{server.cpuCores}</div><div className="text-sm text-muted-foreground">CPU Cores</div></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><MemoryStick className="size-8 text-purple-600" /><div><div className="text-2xl font-bold">{server.ramGB} GB</div><div className="text-sm text-muted-foreground">RAM</div></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><HardDrive className="size-8 text-green-600" /><div><div className="text-2xl font-bold">{server.storageGB} GB</div><div className="text-sm text-muted-foreground">Storage</div></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Users className="size-8 text-orange-600" /><div><div className="text-2xl font-bold">{serverClients.length}</div><div className="text-sm text-muted-foreground">Clients</div></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="clients">Clients ({serverClients.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Server Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3"><MapPin className="size-5 text-muted-foreground" /><div><div className="text-sm text-muted-foreground">Location</div><div>{server.location}</div></div></div>
                <div className="flex items-center gap-3"><Network className="size-5 text-muted-foreground" /><div><div className="text-sm text-muted-foreground">IP Address</div><div className="font-mono text-sm">{server.ipAddress}</div></div></div>
                <div className="flex items-center gap-3"><Activity className="size-5 text-muted-foreground" /><div><div className="text-sm text-muted-foreground">Status</div><div className="capitalize">{server.status}</div></div></div>
                <div className="flex items-center gap-3"><ServerIcon className="size-5 text-muted-foreground" /><div><div className="text-sm text-muted-foreground">Type</div><div>{server.serverType}</div></div></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Load</CardTitle>
                {isAdmin && <Button variant="outline" size="sm" onClick={() => setIsLoadDialogOpen(true)}>Update Load</Button>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Entities:</span><span className="text-xl font-semibold">{server.currentEntities.toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Templates:</span><span className="text-xl font-semibold">{server.currentTemplates.toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Users:</span><span className="text-xl font-semibold">{server.currentUsers.toLocaleString()}</span></div>
              </div>
            </CardContent>
          </Card>

          {server.notes && <Card><CardHeader><CardTitle>Notes</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{server.notes}</p></CardContent></Card>}
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          {capacity && (
            <Card>
              <CardHeader><CardTitle>Capacity Usage</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'Entities', percent: capacity.entitiesUsagePercent, current: capacity.currentEntities, max: capacity.maxEntities },
                  { label: 'Templates', percent: capacity.templatesUsagePercent, current: capacity.currentTemplates, max: capacity.maxTemplates },
                  { label: 'Users', percent: capacity.usersUsagePercent, current: capacity.currentUsers, max: capacity.maxUsers },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-2"><span className="text-sm font-medium">{item.label}</span><span className={`text-sm font-semibold ${getUsageColor(item.percent)}`}>{item.percent.toFixed(1)}%</span></div>
                    <Progress value={item.percent} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>{item.current.toLocaleString()} used</span><span>{item.max.toLocaleString()} max</span></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Clients on this Server</CardTitle></CardHeader>
            <CardContent>
              {serverClients.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No clients on this server</p>
              ) : (
                <div className="space-y-3">
                  {serverClients.map((client: MockClient) => (
                    <div key={client.clientId} className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors" onClick={() => navigate(`/clients/${client.clientId}`)}>
                      <div className="flex items-start justify-between mb-2">
                        <div><div className="font-semibold">{client.clientName}</div>{client.companyName && <div className="text-sm text-muted-foreground">{client.companyName}</div>}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>{client.status}</Badge>
                          <Badge variant="outline">{formatZAR(client.actualMonthlyFee)}/mo</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div><div className="text-muted-foreground">Entities</div><div className="font-medium">{client.currentEntities.toLocaleString()}</div></div>
                        <div><div className="text-muted-foreground">Templates</div><div className="font-medium">{client.currentTemplates.toLocaleString()}</div></div>
                        <div><div className="text-muted-foreground">Users</div><div className="font-medium">{client.currentUsers.toLocaleString()}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isEditDialogOpen && <EditServerDialog server={server} open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} actions={actions} />}
      {isLoadDialogOpen && <UpdateLoadDialog server={server} open={isLoadDialogOpen} onClose={() => setIsLoadDialogOpen(false)} actions={actions} />}
    </div>
  );
}

function EditServerDialog({ server, open, onClose, actions }: { server: MockServer; open: boolean; onClose: () => void; actions: ReturnType<typeof useAppStore>['actions'] }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ serverName: server.serverName, location: server.location, ipAddress: server.ipAddress, status: server.status, notes: server.notes || '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await actions.updateServer(server.serverId, formData);
    setLoading(false);
    if (result.success) { toast.success('Server updated successfully'); onClose(); }
    else { toast.error(result.error.message); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Server</DialogTitle><DialogDescription>Update server information</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Server Name *</Label><Input value={formData.serverName} onChange={(e) => setFormData({ ...formData, serverName: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Location *</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required /></div>
            <div className="space-y-2"><Label>IP Address *</Label><Input value={formData.ipAddress} onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })} required /></div>
          </div>
          <div className="space-y-2"><Label>Status *</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Notes</Label><Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}Update Server</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UpdateLoadDialog({ server, open, onClose, actions }: { server: MockServer; open: boolean; onClose: () => void; actions: ReturnType<typeof useAppStore>['actions'] }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ currentEntities: server.currentEntities.toString(), currentTemplates: server.currentTemplates.toString(), currentUsers: server.currentUsers.toString() });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await actions.updateServer(server.serverId, {
      currentEntities: parseInt(formData.currentEntities),
      currentTemplates: parseInt(formData.currentTemplates),
      currentUsers: parseInt(formData.currentUsers),
    });
    setLoading(false);
    if (result.success) { toast.success('Server load updated successfully'); onClose(); }
    else { toast.error(result.error.message); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Update Server Load</DialogTitle><DialogDescription>Update the current load metrics for this server</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Entities *</Label><Input type="number" value={formData.currentEntities} onChange={(e) => setFormData({ ...formData, currentEntities: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Templates *</Label><Input type="number" value={formData.currentTemplates} onChange={(e) => setFormData({ ...formData, currentTemplates: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Users *</Label><Input type="number" value={formData.currentUsers} onChange={(e) => setFormData({ ...formData, currentUsers: e.target.value })} required /></div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}Update Load</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}