import { useState } from 'react';
import { Panel } from '@/components/shared/Panel';
import { DataTable } from '@/components/shared/DataTable';
import { StatusChip } from '@/components/shared/StatusChip';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { customers, receipts, incidents, approvals, subscriptions, Customer } from '@/data/seed';
import { formatCurrency, formatDate, formatTimeAgo } from '@/lib/formatters';
import { Search, AlertTriangle, CreditCard, Activity, Plug, FileText } from 'lucide-react';
import { useSystem } from '@/contexts/SystemContext';
import { ModeText } from '@/components/shared/ModeText';
import { ModeDetails } from '@/components/shared/ModeDetails';

export default function Customers() {
  const { viewMode } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailTab, setDetailTab] = useState('overview');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = searchTerm === '' || 
      c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || c.riskFlag === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const customerReceipts = selectedCustomer 
    ? receipts.filter(r => r.linkedCustomerId === selectedCustomer.id)
    : [];

  const customerIncidents = selectedCustomer
    ? incidents.filter(i => i.customer === selectedCustomer.name)
    : [];

  const customerApprovals = selectedCustomer
    ? approvals.filter(a => a.customer === selectedCustomer.name)
    : [];

  const customerSubscriptions = selectedCustomer
    ? subscriptions.filter(s => s.customerId === selectedCustomer.id)
    : [];

  const getStatusType = (status: Customer['status']) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Trial': return 'pending';
      case 'Paused': return 'neutral';
      case 'At Risk': return 'critical';
      default: return 'neutral';
    }
  };

  const getOperatorStatus = (status: Customer['status']) => {
    switch (status) {
      case 'Active': return 'Active';
      case 'Trial': return 'Trying Out';
      case 'Paused': return 'On Hold';
      case 'At Risk': return 'Needs Attention';
      default: return status;
    }
  };

  // Operator columns (simplified)
  const operatorColumns = [
    { key: 'name', header: 'Customer' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (c: Customer) => <StatusChip status={getStatusType(c.status)} label={getOperatorStatus(c.status)} /> 
    },
    { key: 'plan', header: 'Plan' },
    { key: 'mrr', header: 'Monthly Revenue', render: (c: Customer) => formatCurrency(c.mrr) },
    { key: 'riskFlag', header: 'Health', render: (c: Customer) => {
      if (c.riskFlag === 'None') return <span className="text-success text-sm">Good</span>;
      if (c.riskFlag === 'Low') return <span className="text-warning text-sm">Fair</span>;
      return <span className="text-destructive text-sm">Attention</span>;
    }},
    { key: 'lastActivity', header: 'Last Active', render: (c: Customer) => <span className="text-text-secondary">{formatTimeAgo(c.lastActivity)}</span> },
  ];

  // Engineer columns (full detail)
  const engineerColumns = [
    { key: 'name', header: 'Customer' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (c: Customer) => <StatusChip status={getStatusType(c.status)} label={c.status} /> 
    },
    { key: 'plan', header: 'Plan' },
    { key: 'mrr', header: 'MRR', render: (c: Customer) => formatCurrency(c.mrr) },
    { key: 'riskFlag', header: 'Risk', render: (c: Customer) => <RiskBadge risk={c.riskFlag} /> },
    { key: 'openIncidents', header: 'Incidents', render: (c: Customer) => c.openIncidents > 0 ? <span className="text-warning">{c.openIncidents}</span> : '0' },
    { key: 'openApprovals', header: 'Approvals', render: (c: Customer) => c.openApprovals > 0 ? <span className="text-primary">{c.openApprovals}</span> : '0' },
    { key: 'lastActivity', header: 'Last Activity', render: (c: Customer) => <span className="text-text-secondary">{formatTimeAgo(c.lastActivity)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">
          <ModeText operator="Your Customers" engineer="Customers" />
        </h1>
        <p className="page-subtitle">
          <ModeText 
            operator="View customer accounts and how they are doing" 
            engineer="Manage customer accounts and monitor health" 
          />
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {/* Filters */}
          <Panel className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-text-tertiary text-xs">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                  <Input
                    placeholder="Customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-surface-1 border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-text-tertiary text-xs">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-surface-1 border-border">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">{viewMode === 'operator' ? 'Active' : 'Active'}</SelectItem>
                    <SelectItem value="Trial">{viewMode === 'operator' ? 'Trying Out' : 'Trial'}</SelectItem>
                    <SelectItem value="Paused">{viewMode === 'operator' ? 'On Hold' : 'Paused'}</SelectItem>
                    <SelectItem value="At Risk">{viewMode === 'operator' ? 'Needs Attention' : 'At Risk'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-text-tertiary text-xs">{viewMode === 'operator' ? 'Health' : 'Risk Flag'}</Label>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="bg-surface-1 border-border">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="None">{viewMode === 'operator' ? 'Good' : 'None'}</SelectItem>
                    <SelectItem value="Low">{viewMode === 'operator' ? 'Fair' : 'Low'}</SelectItem>
                    <SelectItem value="High">{viewMode === 'operator' ? 'Needs Attention' : 'High'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Panel>

          {/* Customers Table */}
          <Panel title={viewMode === 'operator' ? "All Customers" : "Customer List"} noPadding>
            <DataTable
              columns={viewMode === 'operator' ? operatorColumns : engineerColumns}
              data={filteredCustomers}
              keyExtractor={(c: Customer) => c.id}
              onRowClick={(c) => setSelectedCustomer(c)}
              emptyMessage={viewMode === 'operator' ? "No customers found." : "No customers match the current filters."}
            />
          </Panel>
        </div>

        {/* Detail Panel */}
        <div className="xl:col-span-1 space-y-4">
          {selectedCustomer ? (
            <>
              <Panel title={viewMode === 'operator' ? "About This Customer" : "Customer Details"}>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusChip 
                        status={getStatusType(selectedCustomer.status)} 
                        label={viewMode === 'operator' ? getOperatorStatus(selectedCustomer.status) : selectedCustomer.status} 
                      />
                      <span className="text-sm text-text-secondary">{selectedCustomer.plan}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-text-tertiary text-xs">{viewMode === 'operator' ? 'Monthly Revenue' : 'MRR'}</Label>
                      <p className="text-lg font-semibold text-primary">{formatCurrency(selectedCustomer.mrr)}</p>
                    </div>
                    <div>
                      <Label className="text-text-tertiary text-xs">{viewMode === 'operator' ? 'Health' : 'Risk Flag'}</Label>
                      <div className="mt-1">
                        {viewMode === 'operator' ? (
                          selectedCustomer.riskFlag === 'None' 
                            ? <span className="text-success font-medium">Good</span>
                            : selectedCustomer.riskFlag === 'Low'
                            ? <span className="text-warning font-medium">Fair</span>
                            : <span className="text-destructive font-medium">Needs Attention</span>
                        ) : (
                          <RiskBadge risk={selectedCustomer.riskFlag} />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {viewMode === 'operator' && (
                    <ModeDetails
                      summary={<p className="text-xs text-text-tertiary">Technical details available</p>}
                      details={
                        <div className="space-y-2">
                          <div>
                            <Label className="text-text-tertiary text-xs">Customer ID</Label>
                            <p className="font-mono text-xs">{selectedCustomer.id}</p>
                          </div>
                          <div>
                            <Label className="text-text-tertiary text-xs">Open Incidents</Label>
                            <p className="text-sm">{selectedCustomer.openIncidents}</p>
                          </div>
                          <div>
                            <Label className="text-text-tertiary text-xs">Open Approvals</Label>
                            <p className="text-sm">{selectedCustomer.openApprovals}</p>
                          </div>
                        </div>
                      }
                      expandLabel="Show technical details"
                      collapseLabel="Hide details"
                    />
                  )}
                </div>
              </Panel>

              <Panel>
                <Tabs value={detailTab} onValueChange={setDetailTab}>
                  <TabsList className="bg-surface-1 w-full grid grid-cols-5 mb-4">
                    <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
                    <TabsTrigger value="incidents" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      {viewMode === 'operator' ? 'Issues' : 'Incidents'}
                    </TabsTrigger>
                    <TabsTrigger value="approvals" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      {viewMode === 'operator' ? 'Requests' : 'Approvals'}
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Activity</TabsTrigger>
                    <TabsTrigger value="subs" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Plans</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    {viewMode === 'engineer' && (
                      <div>
                        <Label className="text-text-tertiary text-xs">Customer ID</Label>
                        <p className="font-mono text-sm">{selectedCustomer.id}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-text-tertiary text-xs">{viewMode === 'operator' ? 'Last Active' : 'Last Activity'}</Label>
                      <p className="text-sm text-text-secondary">{formatDate(selectedCustomer.lastActivity)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-surface-1 border border-border">
                        <p className="text-xs text-text-tertiary">{viewMode === 'operator' ? 'Open Issues' : 'Open Incidents'}</p>
                        <p className={`text-lg font-semibold ${selectedCustomer.openIncidents > 0 ? 'text-warning' : 'text-text-primary'}`}>
                          {selectedCustomer.openIncidents}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-surface-1 border border-border">
                        <p className="text-xs text-text-tertiary">{viewMode === 'operator' ? 'Pending Requests' : 'Open Approvals'}</p>
                        <p className={`text-lg font-semibold ${selectedCustomer.openApprovals > 0 ? 'text-primary' : 'text-text-primary'}`}>
                          {selectedCustomer.openApprovals}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="incidents">
                    {customerIncidents.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {customerIncidents.map(i => (
                          <div key={i.id} className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-text-tertiary" />
                              {viewMode === 'operator' ? (
                                <span className="text-xs">{i.summary.substring(0, 30)}...</span>
                              ) : (
                                <span className="text-xs font-mono">{i.id}</span>
                              )}
                            </div>
                            <StatusChip status={i.status === 'Open' ? 'warning' : 'success'} label={i.status} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-tertiary text-center py-4">
                        {viewMode === 'operator' ? 'No open issues.' : 'No incidents for this customer.'}
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="approvals">
                    {customerApprovals.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {customerApprovals.map(a => (
                          <div key={a.id} className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
                            {viewMode === 'operator' ? (
                              <span className="text-xs">{a.type}</span>
                            ) : (
                              <span className="text-xs font-mono">{a.id}</span>
                            )}
                            <StatusChip 
                              status={a.status === 'Pending' ? 'pending' : a.status === 'Approved' ? 'success' : 'critical'} 
                              label={a.status} 
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-tertiary text-center py-4">
                        {viewMode === 'operator' ? 'No pending requests.' : 'No approvals for this customer.'}
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="activity">
                    {customerReceipts.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {customerReceipts.map(r => (
                          <div key={r.id} className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-text-tertiary" />
                              {viewMode === 'operator' ? (
                                <span className="text-xs">{r.actionType}</span>
                              ) : (
                                <span className="text-xs font-mono">{r.id}</span>
                              )}
                            </div>
                            <StatusChip 
                              status={r.outcome === 'Success' ? 'success' : r.outcome === 'Blocked' ? 'warning' : 'critical'} 
                              label={r.outcome} 
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-tertiary text-center py-4">No recent activity.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="subs">
                    {customerSubscriptions.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {customerSubscriptions.map(s => (
                          <div key={s.id} className="p-3 rounded bg-surface-1 border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{s.plan}</span>
                              <StatusChip 
                                status={s.status === 'Active' ? 'success' : s.status === 'Trial' ? 'pending' : 'warning'} 
                                label={s.status} 
                              />
                            </div>
                            <p className="text-xs text-text-secondary">
                              {formatCurrency(s.mrr)}/mo • Started {formatDate(s.startedAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-tertiary text-center py-4">No subscriptions.</p>
                    )}
                  </TabsContent>
                </Tabs>
              </Panel>

              {/* Customer Risk Panel */}
              {selectedCustomer.riskFlag !== 'None' && (
                <Panel title={viewMode === 'operator' ? "Why This Needs Attention" : "Customer Risk"}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-5 w-5 ${selectedCustomer.riskFlag === 'High' ? 'text-destructive' : 'text-warning'}`} />
                      <span className="font-medium">
                        {viewMode === 'operator' 
                          ? (selectedCustomer.riskFlag === 'High' ? 'Needs immediate attention' : 'Some concerns')
                          : `${selectedCustomer.riskFlag} Risk`
                        }
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-text-secondary">
                      <p className="font-medium text-text-primary">
                        {viewMode === 'operator' ? 'What we noticed:' : 'Risk Drivers:'}
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedCustomer.openIncidents > 0 && (
                          <li>{selectedCustomer.openIncidents} {viewMode === 'operator' ? 'unresolved issue(s)' : 'open incident(s)'}</li>
                        )}
                        {selectedCustomer.status === 'At Risk' && (
                          <li>{viewMode === 'operator' ? 'Account flagged for attention' : 'Account flagged as at-risk'}</li>
                        )}
                        {selectedCustomer.riskFlag === 'High' && (
                          <li>{viewMode === 'operator' ? 'Recent payment issues' : 'Recent payment failures detected'}</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </Panel>
              )}
            </>
          ) : (
            <Panel title={viewMode === 'operator' ? "Customer Details" : "Customer Details"}>
              <div className="text-center py-8 text-text-secondary">
                <p>Select a customer to view details</p>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
