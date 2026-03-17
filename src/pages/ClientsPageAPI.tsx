import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Users, Building2, Mail, Phone, Server, Database, DollarSign, LayoutGrid, List } from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { toast } from 'sonner';
import { formatZAR, toZAR } from '../lib/currency';
import type { MockClient, MockTier } from '../lib/appStore';

interface ClientFilters {
  status?: string;
  hostingType?: string;
  tierId?: string;
  minFee?: number;
  maxFee?: number;
}

export function ClientsPageAPI() {
  const navigate = useNavigate();
  const { clients, tiers } = useAppStore('clients', 'tiers');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ClientFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredClients = useMemo(() => {
    let filtered = [...clients];

    if (searchTerm) {
      filtered = filtered.filter((c: MockClient) =>
        c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((c: MockClient) => c.status === filters.status);
    }
    if (filters.hostingType) {
      filtered = filtered.filter((c: MockClient) => c.hostingType === filters.hostingType);
    }
    if (filters.tierId) {
      filtered = filtered.filter((c: MockClient) => c.tierId.toString() === filters.tierId);
    }
    if (filters.minFee !== undefined) {
      filtered = filtered.filter((c: MockClient) => c.actualMonthlyFee >= filters.minFee!);
    }
    if (filters.maxFee !== undefined) {
      filtered = filtered.filter((c: MockClient) => c.actualMonthlyFee <= filters.maxFee!);
    }

    filtered.sort((a: MockClient, b: MockClient) => a.clientName.localeCompare(b.clientName));
    return filtered;
  }, [clients, searchTerm, filters]);

  const handleExport = () => {
    const csvData = [
      ['Client Name', 'Company', 'Email', 'Phone', 'Status', 'Hosting Type', 'Tier', 'Monthly Fee (ZAR)', 'Entities', 'Templates', 'Users', 'App Server', 'DB Server'],
      ...filteredClients.map((c: MockClient) => [
        c.clientName, c.companyName || '', c.contactEmail, c.contactPhone || '',
        c.status, c.hostingType, c.tierDisplayName, toZAR(c.actualMonthlyFee).toFixed(2),
        c.currentEntities.toString(), c.currentTemplates.toString(), c.currentUsers.toString(),
        c.applicationServerName || '', c.databaseServerName || ''
      ])
    ];
    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Clients exported successfully');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Active: 'bg-brand-success-light text-brand-success border-brand-success-mid',
      Suspended: 'bg-brand-warning-light text-brand-warning border-brand-warning-mid',
      Cancelled: 'bg-brand-error-light text-brand-error border-brand-error-mid',
    };
    return <Badge variant="outline" className={styles[status] || ''}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Client Management</h1>
          <p className="text-muted-foreground">View and manage all hosting clients</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">Export</Button>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input placeholder="Search clients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select className="w-full border rounded-md px-3 py-2 bg-input-background" value={filters.status || ''} onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}>
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hosting Type</label>
              <select className="w-full border rounded-md px-3 py-2 bg-input-background" value={filters.hostingType || ''} onChange={(e) => setFilters({ ...filters, hostingType: e.target.value || undefined })}>
                <option value="">All Types</option>
                <option value="Shared">Shared</option>
                <option value="Dedicated">Dedicated</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tier</label>
              <select className="w-full border rounded-md px-3 py-2 bg-input-background" value={filters.tierId || ''} onChange={(e) => setFilters({ ...filters, tierId: e.target.value || undefined })}>
                <option value="">All Tiers</option>
                {tiers.map((tier) => (
                  <option key={tier.tierId} value={tier.tierId.toString()}>{tier.displayName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Fee Range</label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="Min Fee" value={filters.minFee !== undefined ? filters.minFee.toString() : ''} onChange={(e) => setFilters({ ...filters, minFee: e.target.value ? parseFloat(e.target.value) : undefined })} />
                <Input type="number" placeholder="Max Fee" value={filters.maxFee !== undefined ? filters.maxFee.toString() : ''} onChange={(e) => setFilters({ ...filters, maxFee: e.target.value ? parseFloat(e.target.value) : undefined })} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-primary-light rounded-lg">
                <Users className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold">{clients.filter((c) => c.status === 'Active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-secondary-light rounded-lg">
                <Building2 className="w-6 h-6 text-brand-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dedicated Hosting</p>
                <p className="text-2xl font-bold">{clients.filter((c) => c.hostingType === 'Dedicated').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-warning-light rounded-lg">
                <Server className="w-6 h-6 text-brand-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shared Hosting</p>
                <p className="text-2xl font-bold">{clients.filter((c) => c.hostingType === 'Shared').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-success-light rounded-lg">
                <DollarSign className="w-6 h-6 text-brand-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">
                  {formatZAR(clients.reduce((sum, c) => sum + c.actualMonthlyFee, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredClients.length} of {clients.length} clients
        </p>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client: MockClient) => (
            <Card key={client.clientId} className="hover:shadow-lg transition-shadow cursor-pointer hover:border-brand-primary" onClick={() => navigate(`/clients/${client.clientId}`)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{client.clientName}</CardTitle>
                    {client.companyName && <p className="text-sm text-muted-foreground mt-1">{client.companyName}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(client.status)}
                    <Badge variant="outline" className="capitalize">{client.hostingType}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
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
                <div className="pt-2 border-t space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tier:</span>
                    <Badge variant="secondary">{client.tierDisplayName}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Server className="size-3 text-brand-primary" />
                    <span className="truncate">{client.applicationServerName || 'Not assigned'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Database className="size-3 text-brand-secondary" />
                    <span className="truncate">{client.databaseServerName || 'Not assigned'}</span>
                  </div>
                </div>
                <div className="pt-2 border-t space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Entities:</span><span>{client.currentEntities.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Templates:</span><span>{client.currentTemplates.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Users:</span><span>{client.currentUsers.toLocaleString()}</span></div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Fee:</span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-brand-success">{formatZAR(client.actualMonthlyFee)}</div>
                      {client.discussedMonthlyFee && client.discussedMonthlyFee !== client.actualMonthlyFee && (
                        <div className="text-xs text-muted-foreground line-through">{formatZAR(client.discussedMonthlyFee)}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Client since {new Date(client.startDate || client.createdDate).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hosting</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Servers</TableHead>
                    <TableHead className="text-right">Entities</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="text-right">Monthly Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client: MockClient) => (
                    <TableRow
                      key={client.clientId}
                      className="cursor-pointer"
                      onClick={() => navigate(`/clients/${client.clientId}`)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{client.clientName}</div>
                          {client.companyName && <div className="text-xs text-muted-foreground">{client.companyName}</div>}
                          <div className="text-xs text-muted-foreground">{client.contactEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{client.hostingType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{client.tierDisplayName}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Server className="size-3 text-brand-primary" />
                            <span className="truncate max-w-[120px]">{client.applicationServerName || '—'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Database className="size-3 text-brand-secondary" />
                            <span className="truncate max-w-[120px]">{client.databaseServerName || '—'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{client.currentEntities.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{client.currentUsers.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-brand-success">{formatZAR(client.actualMonthlyFee)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No clients found matching your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}