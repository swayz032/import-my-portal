import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Panel } from '@/components/shared/Panel';
import { DataTable } from '@/components/shared/DataTable';
import { StatusChip } from '@/components/shared/StatusChip';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { ModeText } from '@/components/shared/ModeText';
import { ModeDetails } from '@/components/shared/ModeDetails';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSystem } from '@/contexts/SystemContext';
import { incidents, receipts, approvals, Incident } from '@/data/seed';
import { formatDate, formatTimeAgo } from '@/lib/formatters';
import { AlertTriangle, Sparkles, Bell, BellOff, FileText, MessageSquare, Link as LinkIcon } from 'lucide-react';

export default function Incidents() {
  const { viewMode } = useSystem();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('open');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [analysisDialog, setAnalysisDialog] = useState<Incident | null>(null);
  const [noteDialog, setNoteDialog] = useState<Incident | null>(null);
  const [newNote, setNewNote] = useState('');

  const openIncidents = incidents.filter(i => i.status === 'Open');
  const resolvedIncidents = incidents.filter(i => i.status === 'Resolved');
  const subscribedIncidents = incidents.filter(i => i.subscribed);

  const getIncidentsByTab = () => {
    let filtered: Incident[] = [];
    switch (activeTab) {
      case 'open': filtered = openIncidents; break;
      case 'resolved': filtered = resolvedIncidents; break;
      case 'subscribed': filtered = subscribedIncidents; break;
      default: filtered = incidents;
    }
    if (severityFilter !== 'all') {
      filtered = filtered.filter(i => i.severity === severityFilter);
    }
    return filtered;
  };

  const relatedReceipts = selectedIncident 
    ? receipts.filter(r => selectedIncident.timelineReceiptIds.includes(r.id))
    : [];

  const relatedApprovals = selectedIncident
    ? approvals.filter(a => a.linkedIncidentId === selectedIncident.id)
    : [];

  const handleAddNote = () => {
    console.log('Adding note:', newNote);
    setNoteDialog(null);
    setNewNote('');
  };

  // Mode-aware columns
  const incidentColumns = viewMode === 'operator' ? [
    { key: 'severity', header: 'Urgency', render: (i: Incident) => <SeverityBadge severity={i.severity} /> },
    { 
      key: 'status', 
      header: 'Status', 
      render: (i: Incident) => <StatusChip status={i.status === 'Open' ? 'warning' : 'success'} label={i.status === 'Open' ? 'Needs attention' : 'Fixed'} /> 
    },
    { key: 'summary', header: 'What happened', className: 'max-w-xs' },
    { key: 'customer', header: "Who's affected" },
    { 
      key: 'detectionSource', 
      header: 'How detected', 
      render: (i: Incident) => {
        const sourceLabels = {
          robot_test: 'Automated test',
          provider: 'Service alert',
          rule: 'Safety rule',
          user_report: 'User reported',
        };
        return <span className="text-text-secondary text-xs">{sourceLabels[i.detectionSource]}</span>;
      }
    },
    { 
      key: 'customerNotified', 
      header: 'Customer notified', 
      render: (i: Incident) => {
        const status = i.customerNotified === 'yes' ? 'success' : i.customerNotified === 'queued' ? 'pending' : 'warning';
        const label = i.customerNotified === 'yes' ? 'Yes' : i.customerNotified === 'queued' ? 'Queued' : 'No';
        return <StatusChip status={status} label={label} />;
      }
    },
    { 
      key: 'proofStatus', 
      header: 'Proof', 
      render: (i: Incident) => {
        const status = i.proofStatus === 'ok' ? 'success' : i.proofStatus === 'missing' ? 'critical' : 'pending';
        const label = i.proofStatus === 'ok' ? 'Recorded' : i.proofStatus === 'missing' ? 'Missing' : 'Pending';
        return <StatusChip status={status} label={label} />;
      }
    },
    {
      key: 'analyze',
      header: '',
      render: (i: Incident) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setAnalysisDialog(i); }}>
            <Sparkles className="h-3 w-3 mr-1" />
            Get help
          </Button>
          <Link to={`/llm-ops-desk?incidentId=${i.id}`} onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="outline" className="text-primary border-primary/30">
              Talk to Ava
            </Button>
          </Link>
        </div>
      ),
    },
  ] : [
    { key: 'id', header: 'Incident ID', render: (i: Incident) => <span className="font-mono text-xs">{i.id}</span> },
    { key: 'severity', header: 'Sev', render: (i: Incident) => <SeverityBadge severity={i.severity} /> },
    { 
      key: 'status', 
      header: 'Status', 
      render: (i: Incident) => <StatusChip status={i.status === 'Open' ? 'warning' : 'success'} label={i.status} /> 
    },
    { key: 'summary', header: 'Summary', className: 'max-w-xs truncate' },
    { key: 'customer', header: 'Customer' },
    { key: 'provider', header: 'Provider' },
    { 
      key: 'detectionSource', 
      header: 'Source', 
      render: (i: Incident) => <span className="font-mono text-xs">{i.detectionSource}</span>
    },
    { 
      key: 'customerNotified', 
      header: 'Notified', 
      render: (i: Incident) => <StatusChip status={i.customerNotified === 'yes' ? 'success' : 'warning'} label={i.customerNotified} />
    },
    { 
      key: 'proofStatus', 
      header: 'Proof', 
      render: (i: Incident) => <StatusChip status={i.proofStatus === 'ok' ? 'success' : i.proofStatus === 'missing' ? 'critical' : 'pending'} label={i.proofStatus} />
    },
    { 
      key: 'correlationId', 
      header: 'Correlation', 
      render: (i: Incident) => <span className="font-mono text-xs truncate max-w-[80px]">{i.correlationId || '—'}</span>
    },
    { key: 'updatedAt', header: 'Updated', render: (i: Incident) => <span className="text-text-secondary">{formatTimeAgo(i.updatedAt)}</span> },
    {
      key: 'analyze',
      header: '',
      render: (i: Incident) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setAnalysisDialog(i); }}>
            <Sparkles className="h-3 w-3 mr-1" />
            Analyze
          </Button>
          <Link to={`/llm-ops-desk?incidentId=${i.id}`} onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="outline" className="text-primary border-primary/30">
              Analyze in Ops Desk
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">
          <ModeText operator="Issues" engineer="Incidents" />
        </h1>
        <p className="page-subtitle">
          <ModeText 
            operator="Track and resolve problems affecting your customers" 
            engineer="Monitor and manage system incidents" 
          />
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Panel noPadding>
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-surface-1">
                  <TabsTrigger value="open" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <ModeText operator={`Needs attention (${openIncidents.length})`} engineer={`Open (${openIncidents.length})`} />
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <ModeText operator={`Fixed (${resolvedIncidents.length})`} engineer={`Resolved (${resolvedIncidents.length})`} />
                  </TabsTrigger>
                  <TabsTrigger value="subscribed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <ModeText operator={`Watching (${subscribedIncidents.length})`} engineer={`Subscribed (${subscribedIncidents.length})`} />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px] bg-surface-1 border-border">
                  <SelectValue placeholder={viewMode === 'operator' ? "All urgency" : "All severities"} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">{viewMode === 'operator' ? 'All Urgency Levels' : 'All Severities'}</SelectItem>
                  <SelectItem value="P0">{viewMode === 'operator' ? 'Critical' : 'P0'}</SelectItem>
                  <SelectItem value="P1">{viewMode === 'operator' ? 'High' : 'P1'}</SelectItem>
                  <SelectItem value="P2">{viewMode === 'operator' ? 'Medium' : 'P2'}</SelectItem>
                  <SelectItem value="P3">{viewMode === 'operator' ? 'Low' : 'P3'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DataTable
              columns={incidentColumns}
              data={getIncidentsByTab()}
              keyExtractor={(i: Incident) => i.id}
              onRowClick={(i) => setSelectedIncident(i)}
              emptyMessage={viewMode === 'operator' ? "No issues in this category." : "No incidents in this category."}
            />
          </Panel>
        </div>

        {/* Detail Panel */}
        <div className="xl:col-span-1 space-y-4">
          {selectedIncident ? (
            <>
              <Panel title={viewMode === 'operator' ? "Issue Details" : "Incident Details"}>
                <div className="space-y-4">
                  {viewMode === 'engineer' && (
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">{selectedIncident.id}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={selectedIncident.subscribed ? 'text-primary' : 'text-text-secondary'}
                      >
                        {selectedIncident.subscribed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={selectedIncident.severity} />
                    <StatusChip 
                      status={selectedIncident.status === 'Open' ? 'warning' : 'success'} 
                      label={viewMode === 'operator' 
                        ? (selectedIncident.status === 'Open' ? 'Needs attention' : 'Fixed')
                        : selectedIncident.status}
                    />
                  </div>
                  
                  {/* Operator-friendly summary */}
                  {viewMode === 'operator' ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-surface-1 border border-border">
                        <p className="text-xs text-text-tertiary mb-1">What happened</p>
                        <p className="text-sm">{selectedIncident.summary}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-surface-1 border border-border">
                        <p className="text-xs text-text-tertiary mb-1">Who's affected</p>
                        <p className="text-sm">{selectedIncident.customer}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-surface-1 border border-border">
                        <p className="text-xs text-text-tertiary mb-1">How we detected it</p>
                        <p className="text-sm">
                          {selectedIncident.detectionSource === 'robot_test' && 'Automated test'}
                          {selectedIncident.detectionSource === 'provider' && 'Service alert'}
                          {selectedIncident.detectionSource === 'rule' && 'Safety rule'}
                          {selectedIncident.detectionSource === 'user_report' && 'User reported'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-surface-1 border border-border">
                          <p className="text-xs text-text-tertiary mb-1">Customer notified</p>
                          <StatusChip 
                            status={selectedIncident.customerNotified === 'yes' ? 'success' : selectedIncident.customerNotified === 'queued' ? 'pending' : 'warning'} 
                            label={selectedIncident.customerNotified === 'yes' ? 'Yes' : selectedIncident.customerNotified === 'queued' ? 'Queued' : 'No'} 
                          />
                        </div>
                        <div className="p-3 rounded-lg bg-surface-1 border border-border">
                          <p className="text-xs text-text-tertiary mb-1">Proof status</p>
                          <StatusChip 
                            status={selectedIncident.proofStatus === 'ok' ? 'success' : selectedIncident.proofStatus === 'missing' ? 'critical' : 'pending'} 
                            label={selectedIncident.proofStatus === 'ok' ? 'Recorded' : selectedIncident.proofStatus === 'missing' ? 'Missing' : 'Pending'} 
                          />
                        </div>
                      </div>
                      {selectedIncident.recommendedAction && (
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-xs text-text-tertiary mb-1">Recommended action</p>
                          <p className="text-sm text-primary">{selectedIncident.recommendedAction}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label className="text-text-tertiary text-xs">Summary</Label>
                        <p className="text-sm">{selectedIncident.summary}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-text-tertiary text-xs">Customer</Label>
                          <p className="text-sm">{selectedIncident.customer}</p>
                        </div>
                        <div>
                          <Label className="text-text-tertiary text-xs">Provider</Label>
                          <p className="text-sm">{selectedIncident.provider}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-text-tertiary text-xs">Detection Source</Label>
                          <p className="text-sm font-mono">{selectedIncident.detectionSource}</p>
                        </div>
                        <div>
                          <Label className="text-text-tertiary text-xs">Correlation ID</Label>
                          <p className="text-sm font-mono text-xs">{selectedIncident.correlationId || '—'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-text-tertiary text-xs">Customer Notified</Label>
                          <StatusChip status={selectedIncident.customerNotified === 'yes' ? 'success' : 'warning'} label={selectedIncident.customerNotified} />
                        </div>
                        <div>
                          <Label className="text-text-tertiary text-xs">Proof Status</Label>
                          <StatusChip status={selectedIncident.proofStatus === 'ok' ? 'success' : selectedIncident.proofStatus === 'missing' ? 'critical' : 'pending'} label={selectedIncident.proofStatus} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-text-tertiary text-xs">Last Updated</Label>
                        <p className="text-sm text-text-secondary">{formatDate(selectedIncident.updatedAt)}</p>
                      </div>
                    </>
                  )}
                  
                  <div className="pt-4 border-t border-border flex gap-2">
                    <Button size="sm" onClick={() => setAnalysisDialog(selectedIncident)}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      <ModeText operator="Get help" engineer="Analyze" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setNoteDialog(selectedIncident)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </div>
              </Panel>

              {/* Timeline / Notes */}
              <Panel title={viewMode === 'operator' ? "Updates" : "Notes & Timeline"}>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedIncident.notes.map((note, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg border ${
                        note.isLLMAnalysis 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-surface-1 border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium flex items-center gap-1">
                          {note.isLLMAnalysis && <Sparkles className="h-3 w-3 text-primary" />}
                          {note.isLLMAnalysis && viewMode === 'operator' ? 'AI suggestion' : note.author}
                        </span>
                        <span className="text-xs text-text-tertiary">{formatTimeAgo(note.timestamp)}</span>
                      </div>
                      <p className="text-sm text-text-secondary">{note.body}</p>
                    </div>
                  ))}
                  {selectedIncident.notes.length === 0 && (
                    <p className="text-sm text-text-tertiary text-center py-4">No updates yet.</p>
                  )}
                </div>
              </Panel>

              {/* Related Receipts */}
              <Panel title={viewMode === 'operator' ? "Related Activity" : "Related Receipts"}>
                {relatedReceipts.length > 0 ? (
                  <div className="space-y-2">
                    {relatedReceipts.map(r => (
                      <ModeDetails
                        key={r.id}
                        summary={
                          <div className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-text-tertiary" />
                              <span className="text-xs">
                                {viewMode === 'operator' ? r.actionType : r.id}
                              </span>
                            </div>
                            <StatusChip 
                              status={r.outcome === 'Success' ? 'success' : r.outcome === 'Blocked' ? 'warning' : 'critical'} 
                              label={viewMode === 'operator' 
                                ? (r.outcome === 'Success' ? 'Completed' : r.outcome === 'Blocked' ? 'Stopped' : 'Failed')
                                : r.outcome} 
                            />
                          </div>
                        }
                        details={
                          <div className="text-xs font-mono text-text-tertiary p-2">
                            <p>Receipt ID: {r.id}</p>
                            <p>Correlation: {r.correlationId}</p>
                            <p>Actor: {r.actor}</p>
                          </div>
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-tertiary">
                    {viewMode === 'operator' ? "No related activity." : "No related receipts."}
                  </p>
                )}
              </Panel>

              {/* Related Approvals */}
              {relatedApprovals.length > 0 && (
                <Panel title={viewMode === 'operator' ? "Pending Decisions" : "Related Approvals"}>
                  <div className="space-y-2">
                    {relatedApprovals.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 text-text-tertiary" />
                          <span className="text-xs">
                            {viewMode === 'operator' ? a.summary.slice(0, 30) + '...' : a.id}
                          </span>
                        </div>
                        <StatusChip 
                          status={a.status === 'Pending' ? 'pending' : a.status === 'Approved' ? 'success' : 'critical'} 
                          label={viewMode === 'operator'
                            ? (a.status === 'Pending' ? 'Waiting' : a.status === 'Approved' ? 'Approved' : 'Denied')
                            : a.status} 
                        />
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
            </>
          ) : (
            <Panel title={viewMode === 'operator' ? "Issue Details" : "Incident Details"}>
              <div className="text-center py-8 text-text-secondary">
                <p>{viewMode === 'operator' ? "Click an issue to see details" : "Select an incident to view details"}</p>
              </div>
            </Panel>
          )}
        </div>
      </div>

      {/* Analysis Dialog */}
      <Dialog open={!!analysisDialog} onOpenChange={() => setAnalysisDialog(null)}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <ModeText 
                operator={`Help with: ${analysisDialog?.summary?.slice(0, 40)}...`}
                engineer={`LLM Analysis for ${analysisDialog?.id}`}
              />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
              <p className="text-sm text-warning flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <ModeText 
                  operator="This is a suggestion. You decide what action to take."
                  engineer="Analysis is advisory only. No execution authority."
                />
              </p>
            </div>
            
            {viewMode === 'operator' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-surface-1 border border-border">
                  <h4 className="text-sm font-medium text-text-primary mb-2">What happened</h4>
                  <p className="text-sm text-text-secondary">{analysisDialog?.summary}</p>
                </div>
                <div className="p-4 rounded-lg bg-surface-1 border border-border">
                  <h4 className="text-sm font-medium text-text-primary mb-2">Impact</h4>
                  <p className="text-sm text-text-secondary">
                    This is affecting {analysisDialog?.customer}. The issue is related to {analysisDialog?.provider} services.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="text-sm font-medium text-text-primary mb-2">Suggested next step</h4>
                  <p className="text-sm text-text-secondary">
                    Monitor the situation for 30 minutes. If it continues, consider contacting {analysisDialog?.provider} support.
                  </p>
                </div>
              </div>
            ) : (
              <ModeDetails
                summary={
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-text-primary">Incident Summary</h4>
                    <p className="text-sm text-text-secondary">{analysisDialog?.summary}</p>
                    
                    <h4 className="text-sm font-medium text-text-primary">Analysis Results</h4>
                    <div className="p-4 rounded-lg bg-surface-1 border border-border">
                      <p className="text-sm text-text-secondary">
                        Based on the incident timeline and related receipts, this appears to be a transient issue 
                        related to {analysisDialog?.provider} service degradation. The error pattern suggests:
                      </p>
                      <ul className="list-disc list-inside mt-2 text-sm text-text-secondary space-y-1">
                        <li>Initial trigger: Elevated latency in API responses</li>
                        <li>Cascading effect: Retry storms from affected clients</li>
                        <li>Recommended action: Monitor for 30 minutes before escalation</li>
                      </ul>
                    </div>
                  </div>
                }
                details={
                  <div className="space-y-2 text-xs font-mono text-text-tertiary">
                    <p>Incident ID: {analysisDialog?.id}</p>
                    <p>Severity: {analysisDialog?.severity}</p>
                    <p>Provider: {analysisDialog?.provider}</p>
                    <p>Customer: {analysisDialog?.customer}</p>
                    <p>Timeline Receipts: {analysisDialog?.timelineReceiptIds?.join(', ') || 'None'}</p>
                  </div>
                }
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnalysisDialog(null)}>
              Close
            </Button>
            <Button onClick={() => setAnalysisDialog(null)}>
              <ModeText operator="Save to updates" engineer="Add to Incident Notes" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={!!noteDialog} onOpenChange={() => setNoteDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              <ModeText 
                operator={`Add update to this issue`}
                engineer={`Add Note to ${noteDialog?.id}`}
              />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note">
                <ModeText operator="What's happening?" engineer="Note" />
              </Label>
              <Textarea
                id="note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={viewMode === 'operator' ? "Describe what you've learned or done..." : "Enter your note..."}
                className="bg-surface-1 border-border"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
              <ModeText operator="Add Update" engineer="Add Note" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
