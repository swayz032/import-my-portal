import { useState } from 'react';
import { Panel } from '@/components/shared/Panel';
import { DataTable } from '@/components/shared/DataTable';
import { StatusChip } from '@/components/shared/StatusChip';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { approvals as initialApprovals, receipts, Approval, Receipt } from '@/data/seed';
import { formatDate, formatTimeAgo } from '@/lib/formatters';
import { Check, X, FileText, Link as LinkIcon, Shield } from 'lucide-react';
import { useSystem } from '@/contexts/SystemContext';
import { ModeText } from '@/components/shared/ModeText';
import { ModeDetails } from '@/components/shared/ModeDetails';

export default function Approvals() {
  const { viewMode, systemState } = useSystem();
  const [approvalsData, setApprovalsData] = useState<Approval[]>(initialApprovals);
  const [localReceipts, setLocalReceipts] = useState<Receipt[]>(receipts);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [approvalDialog, setApprovalDialog] = useState<{ approval: Approval; action: 'approve' | 'deny' } | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const pendingApprovals = approvalsData.filter(a => a.status === 'Pending');
  const approvedApprovals = approvalsData.filter(a => a.status === 'Approved');
  const deniedApprovals = approvalsData.filter(a => a.status === 'Denied');

  const getApprovalsByTab = () => {
    switch (activeTab) {
      case 'pending': return pendingApprovals;
      case 'approved': return approvedApprovals;
      case 'denied': return deniedApprovals;
      default: return approvalsData;
    }
  };

  const handleApprovalDecision = () => {
    if (!approvalDialog) return;
    
    const newStatus = approvalDialog.action === 'approve' ? 'Approved' : 'Denied';
    
    // Update approval in UI
    setApprovalsData(prev => prev.map(a => 
      a.id === approvalDialog.approval.id 
        ? { ...a, status: newStatus as Approval['status'], decisionReason }
        : a
    ));
    
    // Update selected approval if it's the same
    if (selectedApproval?.id === approvalDialog.approval.id) {
      setSelectedApproval(prev => prev ? { ...prev, status: newStatus as Approval['status'], decisionReason } : null);
    }
    
    // Generate a receipt entry
    const newReceipt: Receipt = {
      id: `RCP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      runId: `run-${Date.now()}`,
      correlationId: `corr-${approvalDialog.approval.id}`,
      actor: 'You',
      actionType: `Approval ${newStatus}`,
      outcome: 'Success',
      provider: 'Internal',
      providerCallId: '',
      redactedRequest: `{"approvalId": "${approvalDialog.approval.id}", "action": "${approvalDialog.action}"}`,
      redactedResponse: `{"status": "${newStatus}", "reason": "[REDACTED]"}`,
      linkedIncidentId: approvalDialog.approval.linkedIncidentId,
      linkedApprovalId: approvalDialog.approval.id,
      linkedCustomerId: null,
    };
    setLocalReceipts(prev => [newReceipt, ...prev]);
    
    setApprovalDialog(null);
    setDecisionReason('');
  };

  const relatedReceipts = selectedApproval 
    ? localReceipts.filter(r => selectedApproval.evidenceReceiptIds.includes(r.id) || r.linkedApprovalId === selectedApproval.id)
    : [];

  // Operator-friendly columns (hide IDs)
  const operatorColumns = [
    { key: 'risk', header: 'Risk', render: (a: Approval) => <RiskBadge risk={a.risk} /> },
    { key: 'type', header: 'Type' },
    { key: 'customer', header: 'Customer' },
    { key: 'summary', header: 'What is being requested', className: 'max-w-xs truncate' },
    { key: 'requestedAt', header: 'When', render: (a: Approval) => <span className="text-text-secondary">{formatTimeAgo(a.requestedAt)}</span> },
    { 
      key: 'status', 
      header: 'Status', 
      render: (a: Approval) => (
        <StatusChip 
          status={a.status === 'Pending' ? 'pending' : a.status === 'Approved' ? 'success' : 'critical'} 
          label={a.status} 
        />
      ) 
    },
  ];

  // Engineer columns (include IDs)
  const engineerColumns = [
    { key: 'id', header: 'Approval ID', render: (a: Approval) => <span className="font-mono text-xs">{a.id}</span> },
    { key: 'risk', header: 'Risk', render: (a: Approval) => <RiskBadge risk={a.risk} /> },
    { key: 'type', header: 'Type' },
    { key: 'customer', header: 'Customer/Tenant' },
    { key: 'summary', header: 'Summary', className: 'max-w-xs truncate' },
    { key: 'requestedAt', header: 'Requested', render: (a: Approval) => <span className="text-text-secondary">{formatTimeAgo(a.requestedAt)}</span> },
    { 
      key: 'status', 
      header: 'Status', 
      render: (a: Approval) => (
        <StatusChip 
          status={a.status === 'Pending' ? 'pending' : a.status === 'Approved' ? 'success' : 'critical'} 
          label={a.status} 
        />
      ) 
    },
  ];

  const isSafetyModeOn = systemState.safetyMode;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">
            <ModeText operator="Pending Decisions" engineer="Approvals" />
          </h1>
          <p className="page-subtitle">
            <ModeText 
              operator="Review and approve or deny requests that need your attention" 
              engineer="Review and manage pending approval requests" 
            />
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Panel noPadding>
              <div className="p-4 border-b border-border">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-surface-1">
                    <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <ModeText operator="Needs Decision" engineer="Pending" /> ({pendingApprovals.length})
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Approved ({approvedApprovals.length})
                    </TabsTrigger>
                    <TabsTrigger value="denied" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Denied ({deniedApprovals.length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <DataTable
                columns={viewMode === 'operator' ? operatorColumns : engineerColumns}
                data={getApprovalsByTab()}
                keyExtractor={(a: Approval) => a.id}
                onRowClick={(a) => setSelectedApproval(a)}
                emptyMessage={viewMode === 'operator' ? "No decisions needed right now." : "No approvals in this category."}
              />
            </Panel>
          </div>

          {/* Detail Panel */}
          <div className="xl:col-span-1">
            {selectedApproval ? (
              <Panel title={viewMode === 'operator' ? "Request Details" : "Approval Details"}>
                <div className="space-y-4">
                  {/* Operator: What happened / Impact / Next step */}
                  {viewMode === 'operator' ? (
                    <>
                      <div>
                        <Label className="text-text-tertiary text-xs">What is being requested</Label>
                        <p className="text-sm text-text-secondary">{selectedApproval.summary}</p>
                      </div>
                      <div>
                        <Label className="text-text-tertiary text-xs">Risk Level</Label>
                        <div className="mt-1">
                          <RiskBadge risk={selectedApproval.risk} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-text-tertiary text-xs">Requested By</Label>
                        <p className="text-sm">{selectedApproval.requestedBy}</p>
                      </div>
                      <div>
                        <Label className="text-text-tertiary text-xs">Status</Label>
                        <div className="mt-1">
                          <StatusChip 
                            status={selectedApproval.status === 'Pending' ? 'pending' : selectedApproval.status === 'Approved' ? 'success' : 'critical'} 
                            label={selectedApproval.status}
                            size="md"
                          />
                        </div>
                      </div>
                      
                      {selectedApproval.decisionReason && (
                        <div>
                          <Label className="text-text-tertiary text-xs">Decision Reason</Label>
                          <p className="text-sm text-text-secondary">{selectedApproval.decisionReason}</p>
                        </div>
                      )}
                      
                      <ModeDetails
                        summary={
                          <p className="text-xs text-text-tertiary">
                            {relatedReceipts.length} proof log(s) available
                          </p>
                        }
                        details={
                          <div className="space-y-2">
                            <Label className="text-text-tertiary text-xs">Request ID</Label>
                            <p className="font-mono text-xs">{selectedApproval.id}</p>
                            {relatedReceipts.map(r => (
                              <div key={r.id} className="flex items-center gap-2 p-2 rounded bg-surface-1 border border-border">
                                <FileText className="h-4 w-4 text-text-tertiary" />
                                <span className="text-xs font-mono">{r.id}</span>
                              </div>
                            ))}
                          </div>
                        }
                        expandLabel="View technical details"
                        collapseLabel="Hide technical details"
                      />
                    </>
                  ) : (
                    <>
                      <div>
                        <Label className="text-text-tertiary text-xs">Approval ID</Label>
                        <p className="font-mono text-sm">{selectedApproval.id}</p>
                      </div>
                      <div>
                        <Label className="text-text-tertiary text-xs">Type</Label>
                        <p className="text-sm">{selectedApproval.type}</p>
                      </div>
                      <div>
                        <Label className="text-text-tertiary text-xs">Risk Level</Label>
                        <div className="mt-1">
                          <RiskBadge risk={selectedApproval.risk} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-text-tertiary text-xs">Summary</Label>
                        <p className="text-sm text-text-secondary">{selectedApproval.summary}</p>
                      </div>
                      <div>
                        <Label className="text-text-tertiary text-xs">Requested By</Label>
                        <p className="text-sm">{selectedApproval.requestedBy}</p>
                      </div>
                      <div>
                        <Label className="text-text-tertiary text-xs">Requested At</Label>
                        <p className="text-sm text-text-secondary">{formatDate(selectedApproval.requestedAt)}</p>
                      </div>
                      <div>
                        <Label className="text-text-tertiary text-xs">Status</Label>
                        <div className="mt-1">
                          <StatusChip 
                            status={selectedApproval.status === 'Pending' ? 'pending' : selectedApproval.status === 'Approved' ? 'success' : 'critical'} 
                            label={selectedApproval.status}
                            size="md"
                          />
                        </div>
                      </div>

                      {selectedApproval.decisionReason && (
                        <div>
                          <Label className="text-text-tertiary text-xs">Decision Reason</Label>
                          <p className="text-sm text-text-secondary">{selectedApproval.decisionReason}</p>
                        </div>
                      )}

                      {/* Evidence */}
                      <div className="pt-4 border-t border-border">
                        <Label className="text-text-tertiary text-xs mb-2 block">Evidence & Related Items</Label>
                        {relatedReceipts.length > 0 ? (
                          <div className="space-y-2">
                            {relatedReceipts.map(r => (
                              <div key={r.id} className="flex items-center gap-2 p-2 rounded bg-surface-1 border border-border">
                                <FileText className="h-4 w-4 text-text-tertiary" />
                                <span className="text-xs font-mono">{r.id}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-text-tertiary">No related receipts.</p>
                        )}
                        {selectedApproval.linkedIncidentId && (
                          <div className="flex items-center gap-2 p-2 rounded bg-surface-1 border border-border mt-2">
                            <LinkIcon className="h-4 w-4 text-text-tertiary" />
                            <span className="text-xs font-mono">{selectedApproval.linkedIncidentId}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  {selectedApproval.status === 'Pending' && (
                    <div className="pt-4 border-t border-border space-y-2">
                      {isSafetyModeOn && (
                        <div className="p-2 rounded bg-warning/10 border border-warning/30 flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-warning" />
                          <span className="text-xs text-warning">Safety Mode is ON - actions restricted</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex-1">
                              <Button 
                                className="w-full"
                                onClick={() => setApprovalDialog({ approval: selectedApproval, action: 'approve' })}
                                disabled={isSafetyModeOn}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
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
                            <span className="flex-1">
                              <Button 
                                variant="outline" 
                                className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                                onClick={() => setApprovalDialog({ approval: selectedApproval, action: 'deny' })}
                                disabled={isSafetyModeOn}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Deny
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
                    </div>
                  )}
                </div>
              </Panel>
            ) : (
              <Panel title={viewMode === 'operator' ? "Request Details" : "Approval Details"}>
                <div className="text-center py-8 text-text-secondary">
                  <p>{viewMode === 'operator' ? "Select a request to view details" : "Select an approval to view details"}</p>
                </div>
              </Panel>
            )}
          </div>
        </div>

        {/* Decision Dialog */}
        <Dialog open={!!approvalDialog} onOpenChange={() => setApprovalDialog(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-text-primary">
                {approvalDialog?.action === 'approve' ? 'Approve Request' : 'Deny Request'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text-secondary mb-2">
                  <strong>Request:</strong> {approvalDialog?.approval.id}
                </p>
                <p className="text-sm text-text-secondary">
                  {approvalDialog?.approval.summary}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Decision Reason (required)</Label>
                <Textarea
                  id="reason"
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Enter the reason for your decision..."
                  className="bg-surface-1 border-border"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApprovalDialog(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleApprovalDecision}
                disabled={!decisionReason.trim()}
                className={approvalDialog?.action === 'deny' ? 'bg-destructive hover:bg-destructive/90' : ''}
              >
                {approvalDialog?.action === 'approve' ? 'Approve' : 'Deny'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
