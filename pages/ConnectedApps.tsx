import { useState } from 'react';
import { Panel } from '@/components/shared/Panel';
import { DataTable } from '@/components/shared/DataTable';
import { StatusChip } from '@/components/shared/StatusChip';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { providers, Provider } from '@/data/seed';
import { formatDate, formatTimeAgo, formatLatency } from '@/lib/formatters';
import { Plug, Settings, RefreshCw, Unlink, ChevronRight, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useSystem } from '@/contexts/SystemContext';
import { ModeText } from '@/components/shared/ModeText';
import { ModeDetails } from '@/components/shared/ModeDetails';

const healthHistory = [
  { time: '10:00', latency: 120 },
  { time: '10:05', latency: 135 },
  { time: '10:10', latency: 245 },
  { time: '10:15', latency: 380 },
  { time: '10:20', latency: 290 },
  { time: '10:25', latency: 180 },
  { time: '10:30', latency: 150 },
];

const pendingConnections = [
  { id: 'CONN-001', provider: 'GitHub', requestedBy: 'dev-team@zenith.io', requestedAt: '2026-01-08T08:00:00Z' },
  { id: 'CONN-002', provider: 'PagerDuty', requestedBy: 'ops@zenith.io', requestedAt: '2026-01-07T16:30:00Z' },
];

// In-memory approval requests created from this page
type PendingApprovalRequest = {
  id: string;
  provider: string;
  action: 'scope' | 'rotate' | 'disconnect';
  createdAt: string;
  status: 'pending';
};

export default function ConnectedApps() {
  const { viewMode, systemState } = useSystem();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [actionDialog, setActionDialog] = useState<{ provider: Provider; action: 'scope' | 'rotate' | 'disconnect' } | null>(null);
  const [createdApprovalRequests, setCreatedApprovalRequests] = useState<PendingApprovalRequest[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const isSafetyModeOn = systemState.safetyMode;

  const getStatusType = (status: Provider['status']) => {
    switch (status) {
      case 'Healthy': return 'healthy';
      case 'At Risk': return 'at-risk';
      case 'Writes Paused': return 'writes-paused';
      case 'Read-only Allowed': return 'read-only';
      default: return 'neutral';
    }
  };

  const getOperatorStatus = (status: Provider['status']) => {
    switch (status) {
      case 'Healthy': return 'Connected';
      case 'At Risk': return 'Slow';
      case 'Writes Paused': return 'Limited';
      case 'Read-only Allowed': return 'Read Only';
      default: return status;
    }
  };

  const handleAction = () => {
    if (!actionDialog) return;
    
    // Create an approval request in-memory
    const newRequest: PendingApprovalRequest = {
      id: `APR-${Date.now()}`,
      provider: actionDialog.provider.name,
      action: actionDialog.action,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    
    setCreatedApprovalRequests(prev => [...prev, newRequest]);
    setSuccessToast(`Approval request created: ${newRequest.id}`);
    setTimeout(() => setSuccessToast(null), 3000);
    
    setActionDialog(null);
  };

  // Operator-friendly columns
  const operatorColumns = [
    { 
      key: 'name', 
      header: 'Service', 
      render: (p: Provider) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-surface-2 flex items-center justify-center">
            <Plug className="h-4 w-4 text-text-secondary" />
          </div>
          <span className="font-medium">{p.name}</span>
        </div>
      ) 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (p: Provider) => <StatusChip status={getStatusType(p.status)} label={getOperatorStatus(p.status)} /> 
    },
    { key: 'lastSyncTime', header: 'Last Active', render: (p: Provider) => <span className="text-text-secondary">{formatTimeAgo(p.lastSyncTime)}</span> },
    {
      key: 'actions',
      header: '',
      render: () => <ChevronRight className="h-4 w-4 text-text-tertiary" />,
    },
  ];

  // Engineer columns (more detail)
  const engineerColumns = [
    { 
      key: 'name', 
      header: 'Provider', 
      render: (p: Provider) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-surface-2 flex items-center justify-center">
            <Plug className="h-4 w-4 text-text-secondary" />
          </div>
          <span className="font-medium">{p.name}</span>
        </div>
      ) 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (p: Provider) => <StatusChip status={getStatusType(p.status)} label={p.status} /> 
    },
    { key: 'permissionsSummary', header: 'Permissions', className: 'max-w-xs truncate' },
    { key: 'lastSyncTime', header: 'Last Sync', render: (p: Provider) => <span className="text-text-secondary">{formatTimeAgo(p.lastSyncTime)}</span> },
    { key: 'recentReceiptsCount', header: 'Recent Receipts', render: (p: Provider) => <span className="text-text-secondary">{p.recentReceiptsCount}</span> },
    { 
      key: 'p95Latency', 
      header: 'p95 Latency', 
      render: (p: Provider) => (
        <span className={p.p95Latency > 300 ? 'text-warning' : 'text-text-secondary'}>
          {formatLatency(p.p95Latency)}
        </span>
      ) 
    },
    {
      key: 'actions',
      header: '',
      render: () => <ChevronRight className="h-4 w-4 text-text-tertiary" />,
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Success toast */}
        {successToast && (
          <div className="fixed top-4 right-4 z-50 p-4 bg-success/20 border border-success/30 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-sm text-success">{successToast}</span>
          </div>
        )}
        
        <div className="page-header">
          <h1 className="page-title">
            <ModeText operator="Connected Services" engineer="Connected Apps" />
          </h1>
          <p className="page-subtitle">
            <ModeText 
              operator="View and manage your connected third-party services" 
              engineer="Manage provider integrations and connection health" 
            />
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Provider List */}
            <Panel title={viewMode === 'operator' ? "Your Services" : "Connected Providers"} noPadding>
              <DataTable
                columns={viewMode === 'operator' ? operatorColumns : engineerColumns}
                data={providers}
                keyExtractor={(p: Provider) => p.id}
                onRowClick={(p) => setSelectedProvider(p)}
              />
            </Panel>

            {/* Pending Connection Requests */}
            <Panel title={viewMode === 'operator' ? "Waiting for Approval" : "Pending Connection Requests"}>
              {pendingConnections.length > 0 || createdApprovalRequests.length > 0 ? (
                <div className="space-y-3">
                  {createdApprovalRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{req.provider} - {req.action}</p>
                          <p className="text-xs text-text-secondary">Approval Request: {req.id}</p>
                        </div>
                      </div>
                      <StatusChip status="pending" label="Pending Approval" />
                    </div>
                  ))}
                  {pendingConnections.map((conn) => (
                    <div key={conn.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-surface-2 flex items-center justify-center">
                          <Plug className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{conn.provider}</p>
                          <p className="text-xs text-text-secondary">
                            {viewMode === 'operator' 
                              ? `Requested ${formatTimeAgo(conn.requestedAt)}`
                              : `Requested by ${conn.requestedBy}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {viewMode === 'engineer' && (
                          <span className="text-xs text-text-tertiary">{formatTimeAgo(conn.requestedAt)}</span>
                        )}
                        <Button size="sm" variant="outline" asChild>
                          <a href="/approvals">Review</a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-tertiary text-center py-4">
                  {viewMode === 'operator' ? "No pending requests." : "No pending connection requests."}
                </p>
              )}
            </Panel>
          </div>

          {/* Detail Panel */}
          <div className="xl:col-span-1 space-y-4">
            {selectedProvider ? (
              <>
                <Panel title={viewMode === 'operator' ? "Service Details" : "Provider Details"}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-surface-2 flex items-center justify-center">
                        <Plug className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{selectedProvider.name}</h3>
                        <StatusChip 
                          status={getStatusType(selectedProvider.status)} 
                          label={viewMode === 'operator' ? getOperatorStatus(selectedProvider.status) : selectedProvider.status} 
                        />
                      </div>
                    </div>
                    
                    {viewMode === 'operator' ? (
                      <>
                        <div>
                          <Label className="text-text-tertiary text-xs">Last Active</Label>
                          <p className="text-sm">{formatTimeAgo(selectedProvider.lastSyncTime)}</p>
                        </div>
                        <ModeDetails
                          summary={
                            <p className="text-xs text-text-tertiary">Technical details available</p>
                          }
                          details={
                            <div className="space-y-3">
                              <div>
                                <Label className="text-text-tertiary text-xs">Provider ID</Label>
                                <p className="font-mono text-xs">{selectedProvider.id}</p>
                              </div>
                              <div>
                                <Label className="text-text-tertiary text-xs">Permissions</Label>
                                <p className="text-sm text-text-secondary">{selectedProvider.permissionsSummary}</p>
                              </div>
                              <div>
                                <Label className="text-text-tertiary text-xs">p95 Latency</Label>
                                <p className={`text-sm ${selectedProvider.p95Latency > 300 ? 'text-warning' : ''}`}>
                                  {formatLatency(selectedProvider.p95Latency)}
                                </p>
                              </div>
                              <div>
                                <Label className="text-text-tertiary text-xs">Recent Receipts</Label>
                                <p className="text-sm">{selectedProvider.recentReceiptsCount}</p>
                              </div>
                            </div>
                          }
                          expandLabel="Show technical details"
                          collapseLabel="Hide technical details"
                        />
                      </>
                    ) : (
                      <>
                        <div>
                          <Label className="text-text-tertiary text-xs">Permissions</Label>
                          <p className="text-sm text-text-secondary">{selectedProvider.permissionsSummary}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-text-tertiary text-xs">Last Sync</Label>
                            <p className="text-sm">{formatDate(selectedProvider.lastSyncTime)}</p>
                          </div>
                          <div>
                            <Label className="text-text-tertiary text-xs">Recent Receipts</Label>
                            <p className="text-sm">{selectedProvider.recentReceiptsCount}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-text-tertiary text-xs">p95 Latency</Label>
                          <p className={`text-sm ${selectedProvider.p95Latency > 300 ? 'text-warning' : ''}`}>
                            {formatLatency(selectedProvider.p95Latency)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </Panel>

                {viewMode === 'engineer' && (
                  <Panel title="Sync Health (Last Hour)">
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={healthHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                          <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} tickFormatter={(val) => `${val}ms`} />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(220 18% 11%)', 
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '8px',
                              color: 'rgba(255,255,255,0.92)'
                            }}
                            formatter={(value: number) => [`${value}ms`, 'Latency']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="latency" 
                            stroke="hsl(187 82% 53%)" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Panel>
                )}

                <Panel title="Actions">
                  {isSafetyModeOn && (
                    <div className="p-2 rounded bg-warning/10 border border-warning/30 flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4 text-warning" />
                      <span className="text-xs text-warning">Safety Mode is ON - actions restricted</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => setActionDialog({ provider: selectedProvider, action: 'scope' })}
                            disabled={isSafetyModeOn}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            {viewMode === 'operator' ? 'Change Permissions' : 'Request Scope Change'}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {isSafetyModeOn && (
                        <TooltipContent>
                          <p>Restricted when Safety Mode is ON</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => setActionDialog({ provider: selectedProvider, action: 'rotate' })}
                            disabled={isSafetyModeOn}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {viewMode === 'operator' ? 'Reset Credentials' : 'Rotate Credentials'}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {isSafetyModeOn && (
                        <TooltipContent>
                          <p>Restricted when Safety Mode is ON</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => setActionDialog({ provider: selectedProvider, action: 'disconnect' })}
                            disabled={isSafetyModeOn}
                          >
                            <Unlink className="h-4 w-4 mr-2" />
                            Disconnect
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {isSafetyModeOn && (
                        <TooltipContent>
                          <p>Restricted when Safety Mode is ON</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                  <p className="text-xs text-text-tertiary mt-3">
                    {viewMode === 'operator' 
                      ? 'These actions need approval before taking effect.'
                      : 'These actions require approval and will create a new approval request.'
                    }
                  </p>
                </Panel>
              </>
            ) : (
              <Panel title={viewMode === 'operator' ? "Service Details" : "Provider Details"}>
                <div className="text-center py-8 text-text-secondary">
                  <p>{viewMode === 'operator' ? "Select a service to view details" : "Select a provider to view details"}</p>
                </div>
              </Panel>
            )}
          </div>
        </div>

        {/* Action Dialog */}
        <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-text-primary">
                {actionDialog?.action === 'scope' && (viewMode === 'operator' ? 'Change Permissions' : 'Request Scope Change')}
                {actionDialog?.action === 'rotate' && (viewMode === 'operator' ? 'Reset Credentials' : 'Rotate Credentials')}
                {actionDialog?.action === 'disconnect' && 'Disconnect Service'}
              </DialogTitle>
              <DialogDescription className="text-text-secondary">
                {actionDialog?.action === 'scope' && (
                  viewMode === 'operator' 
                    ? <>This will create a request to change permissions for <strong>{actionDialog.provider.name}</strong>. Someone will need to approve it.</>
                    : <>This will create an approval request to modify the permissions for <strong>{actionDialog.provider.name}</strong>.</>
                )}
                {actionDialog?.action === 'rotate' && (
                  viewMode === 'operator'
                    ? <>This will create a request to reset the connection credentials for <strong>{actionDialog?.provider.name}</strong>.</>
                    : <>This will create an approval request to rotate the API credentials for <strong>{actionDialog?.provider.name}</strong>.</>
                )}
                {actionDialog?.action === 'disconnect' && (
                  viewMode === 'operator'
                    ? <>This will create a request to disconnect <strong>{actionDialog?.provider.name}</strong>. The connection will stop working once approved.</>
                    : <>This will create an approval request to disconnect <strong>{actionDialog?.provider.name}</strong>. All active connections will be terminated.</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                <p className="text-sm text-warning flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {viewMode === 'operator' 
                    ? 'This action needs approval before it takes effect.'
                    : 'This action requires approval before it takes effect.'
                  }
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAction}
                className={actionDialog?.action === 'disconnect' ? 'bg-destructive hover:bg-destructive/90' : ''}
              >
                {viewMode === 'operator' ? 'Create Request' : 'Create Approval Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
