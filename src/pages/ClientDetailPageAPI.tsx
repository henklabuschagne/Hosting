import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ArrowLeft, Mail, Phone, Calendar, DollarSign, 
  Server, Database, Users, FileText, Activity,
  Loader2, Edit, TrendingUp, Building2
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../hooks/useAppStore';
import { toast } from 'sonner';
import { formatZAR } from '../lib/currency';
import type { MockClient, MockServer, MockClientHistory } from '../lib/appStore';

export function ClientDetailPageAPI() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { clients, servers, reads, actions } = useAppStore('clients', 'servers', 'clientHistory');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false);

  const clientId = id ? parseInt(id) : 0;
  const client = reads.getClientById(clientId);
  const history = reads.getClientHistory(clientId);

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Client not found</p>
        <Button onClick={() => navigate('/clients')} className="mt-4">Back to Clients</Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      Active: 'default', Suspended: 'secondary', Cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
            <ArrowLeft className="size-4 mr-2" />Back
          </Button>
          <div>
            <h1 className="text-3xl mb-1">{client.clientName}</h1>
            {client.companyName && <p className="text-muted-foreground">{client.companyName}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(client.status)}
          <Badge variant="outline" className="capitalize">{client.hostingType}</Badge>
          {isAdmin && (
            <Button onClick={() => setIsEditDialogOpen(true)} className="gap-2">
              <Edit className="size-4" />Edit Client
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><DollarSign className="size-8 text-green-600" /><div><div className="text-2xl font-bold">{formatZAR(client.actualMonthlyFee)}</div><div className="text-sm text-muted-foreground">Monthly Fee</div></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><FileText className="size-8 text-blue-600" /><div><div className="text-2xl font-bold">{client.currentEntities.toLocaleString()}</div><div className="text-sm text-muted-foreground">Entities</div></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Activity className="size-8 text-purple-600" /><div><div className="text-2xl font-bold">{client.currentTemplates.toLocaleString()}</div><div className="text-sm text-muted-foreground">Templates</div></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Users className="size-8 text-orange-600" /><div><div className="text-2xl font-bold">{client.currentUsers.toLocaleString()}</div><div className="text-sm text-muted-foreground">Users</div></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3"><Mail className="size-5 text-muted-foreground" /><div><div className="text-sm text-muted-foreground">Email</div><div>{client.contactEmail}</div></div></div>
                {client.contactPhone && <div className="flex items-center gap-3"><Phone className="size-5 text-muted-foreground" /><div><div className="text-sm text-muted-foreground">Phone</div><div>{client.contactPhone}</div></div></div>}
                <div className="flex items-center gap-3"><Calendar className="size-5 text-muted-foreground" /><div><div className="text-sm text-muted-foreground">Start Date</div><div>{new Date(client.startDate || client.createdDate).toLocaleDateString()}</div></div></div>
                <div className="flex items-center gap-3"><Building2 className="size-5 text-muted-foreground" /><div><div className="text-sm text-muted-foreground">Hosting Type</div><div className="capitalize">{client.hostingType}</div></div></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Usage</CardTitle>
                {isAdmin && <Button variant="outline" size="sm" onClick={() => setIsUsageDialogOpen(true)}>Update Usage</Button>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Entities:</span><span className="text-xl font-semibold">{client.currentEntities.toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Templates:</span><span className="text-xl font-semibold">{client.currentTemplates.toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Users:</span><span className="text-xl font-semibold">{client.currentUsers.toLocaleString()}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Actual Monthly Fee:</span><span className="text-2xl font-bold text-green-600">{formatZAR(client.actualMonthlyFee)}</span></div>
                {client.discussedMonthlyFee && (
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Discussed Fee:</span><span className={client.discussedMonthlyFee !== client.actualMonthlyFee ? 'line-through' : ''}>{formatZAR(client.discussedMonthlyFee)}</span></div>
                )}
              </div>
            </CardContent>
          </Card>

          {client.notes && <Card><CardHeader><CardTitle>Notes</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{client.notes}</p></CardContent></Card>}
        </TabsContent>

        <TabsContent value="servers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Servers</CardTitle>
                {isAdmin && <Button onClick={() => setIsMoveDialogOpen(true)} className="gap-2"><TrendingUp className="size-4" />Move to Different Server</Button>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3"><Server className="size-5 text-blue-600" /><h4 className="font-semibold">Application Server</h4></div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Server:</span><span className="font-medium">{client.applicationServerName || 'Not assigned'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Tier:</span><Badge variant="secondary">{client.tierDisplayName}</Badge></div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3"><Database className="size-5 text-purple-600" /><h4 className="font-semibold">Database Server</h4></div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Server:</span><span className="font-medium">{client.databaseServerName || 'Not assigned'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Tier:</span><Badge variant="secondary">{client.tierDisplayName}</Badge></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Server History</CardTitle></CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No history records</p>
              ) : (
                <div className="space-y-4">
                  {history.map((record) => (
                    <div key={record.historyId} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold">{record.tierDisplayName} - {record.hostingType}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(record.startDate).toLocaleDateString()}{record.endDate ? ` - ${new Date(record.endDate).toLocaleDateString()}` : ' - Present'}
                          </div>
                        </div>
                        <Badge variant="outline">{formatZAR(record.monthlyFee)}/mo</Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2"><Server className="size-4 text-blue-600" /><span className="text-muted-foreground">App:</span><span>{record.applicationServerName || 'N/A'}</span></div>
                        <div className="flex items-center gap-2"><Database className="size-4 text-purple-600" /><span className="text-muted-foreground">DB:</span><span>{record.databaseServerName || 'N/A'}</span></div>
                      </div>
                      {record.changeReason && <div className="mt-3 pt-3 border-t text-sm"><span className="text-muted-foreground">Reason: </span><span>{record.changeReason}</span></div>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isEditDialogOpen && <EditClientDialog client={client} open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} actions={actions} />}
      {isMoveDialogOpen && <MoveClientDialog client={client} servers={servers} open={isMoveDialogOpen} onClose={() => setIsMoveDialogOpen(false)} actions={actions} />}
      {isUsageDialogOpen && <UpdateUsageDialog client={client} open={isUsageDialogOpen} onClose={() => setIsUsageDialogOpen(false)} actions={actions} />}
    </div>
  );
}

function EditClientDialog({ client, open, onClose, actions }: { client: MockClient; open: boolean; onClose: () => void; actions: ReturnType<typeof useAppStore>['actions'] }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: client.clientName,
    companyName: client.companyName,
    contactEmail: client.contactEmail,
    contactPhone: client.contactPhone,
    discussedMonthlyFee: client.discussedMonthlyFee?.toString() || '',
    actualMonthlyFee: client.actualMonthlyFee.toString(),
    status: client.status,
    notes: client.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await actions.updateClient(client.clientId, {
      clientName: formData.clientName, companyName: formData.companyName,
      contactEmail: formData.contactEmail, contactPhone: formData.contactPhone,
      discussedMonthlyFee: formData.discussedMonthlyFee ? parseFloat(formData.discussedMonthlyFee) : undefined,
      actualMonthlyFee: parseFloat(formData.actualMonthlyFee), status: formData.status, notes: formData.notes,
    });
    setLoading(false);
    if (result.success) { toast.success('Client updated successfully'); onClose(); }
    else { toast.error(result.error.message); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Edit Client</DialogTitle><DialogDescription>Update client information</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Client Name *</Label><Input value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Company Name</Label><Input value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Discussed Fee</Label><Input type="number" step="0.01" value={formData.discussedMonthlyFee} onChange={(e) => setFormData({ ...formData, discussedMonthlyFee: e.target.value })} /></div>
            <div className="space-y-2"><Label>Actual Fee *</Label><Input type="number" step="0.01" value={formData.actualMonthlyFee} onChange={(e) => setFormData({ ...formData, actualMonthlyFee: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Status *</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Suspended">Suspended</SelectItem><SelectItem value="Cancelled">Cancelled</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} /></div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}Update Client</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MoveClientDialog({ client, servers, open, onClose, actions }: { client: MockClient; servers: MockServer[]; open: boolean; onClose: () => void; actions: ReturnType<typeof useAppStore>['actions'] }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    newApplicationServerId: client.currentApplicationServerId?.toString() || '',
    newDatabaseServerId: client.currentDatabaseServerId?.toString() || '',
    changeReason: '',
  });

  const appServers = servers.filter((s) => s.serverType === 'Application');
  const dbServers = servers.filter((s) => s.serverType === 'Database');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await actions.moveClientToServer(client.clientId, {
      newApplicationServerId: parseInt(formData.newApplicationServerId),
      newDatabaseServerId: parseInt(formData.newDatabaseServerId),
      changeReason: formData.changeReason,
    });
    setLoading(false);
    if (result.success) { toast.success('Client moved successfully'); onClose(); }
    else { toast.error(result.error.message); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Move Client to Different Server</DialogTitle><DialogDescription>Select new servers for this client</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Application Server *</Label>
            <Select value={formData.newApplicationServerId} onValueChange={(v) => setFormData({ ...formData, newApplicationServerId: v })}>
              <SelectTrigger><SelectValue placeholder="Select application server" /></SelectTrigger>
              <SelectContent>{appServers.map((s) => <SelectItem key={s.serverId} value={s.serverId.toString()}>{s.serverName} ({s.tierDisplayName})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Database Server *</Label>
            <Select value={formData.newDatabaseServerId} onValueChange={(v) => setFormData({ ...formData, newDatabaseServerId: v })}>
              <SelectTrigger><SelectValue placeholder="Select database server" /></SelectTrigger>
              <SelectContent>{dbServers.map((s) => <SelectItem key={s.serverId} value={s.serverId.toString()}>{s.serverName} ({s.tierDisplayName})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Reason for Change *</Label><Textarea value={formData.changeReason} onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })} placeholder="e.g., Upgrading for better performance" required rows={3} /></div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}Move Client</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UpdateUsageDialog({ client, open, onClose, actions }: { client: MockClient; open: boolean; onClose: () => void; actions: ReturnType<typeof useAppStore>['actions'] }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentEntities: client.currentEntities.toString(),
    currentTemplates: client.currentTemplates.toString(),
    currentUsers: client.currentUsers.toString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await actions.updateClient(client.clientId, {
      currentEntities: parseInt(formData.currentEntities),
      currentTemplates: parseInt(formData.currentTemplates),
      currentUsers: parseInt(formData.currentUsers),
    });
    setLoading(false);
    if (result.success) { toast.success('Usage updated successfully'); onClose(); }
    else { toast.error(result.error.message); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Update Client Usage</DialogTitle><DialogDescription>Update the current usage metrics for this client</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Entities *</Label><Input type="number" value={formData.currentEntities} onChange={(e) => setFormData({ ...formData, currentEntities: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Templates *</Label><Input type="number" value={formData.currentTemplates} onChange={(e) => setFormData({ ...formData, currentTemplates: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Users *</Label><Input type="number" value={formData.currentUsers} onChange={(e) => setFormData({ ...formData, currentUsers: e.target.value })} required /></div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}Update Usage</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}