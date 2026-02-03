import { useState } from 'react';
import { Panel } from '@/components/shared/Panel';
import { DataTable } from '@/components/shared/DataTable';
import { StatusChip } from '@/components/shared/StatusChip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { receipts, Receipt } from '@/data/seed';
import { formatDate } from '@/lib/formatters';
import { useSystem } from '@/contexts/SystemContext';
import { Search, Filter, FileCheck, AlertTriangle, Link as LinkIcon, ExternalLink } from 'lucide-react';

export default function Activity() {
  const { systemState } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const filteredReceipts = receipts.filter(r => {
    const matchesSearch = searchTerm === '' || 
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.correlationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.actor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOutcome = outcomeFilter === 'all' || r.outcome === outcomeFilter;
    const matchesProvider = providerFilter === 'all' || r.provider === providerFilter;
    return matchesSearch && matchesOutcome && matchesProvider;
  });

  const providers = [...new Set(receipts.map(r => r.provider))];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Activity Log</h1>
        <p className="page-subtitle">Audit trail of all system actions and provider calls</p>
      </div>

      {/* Filters */}
      <Panel title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-text-tertiary text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <Input
                placeholder="Receipt ID, Correlation ID, Actor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-surface-1 border-border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-text-tertiary text-xs">Outcome</Label>
            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger className="bg-surface-1 border-border">
                <SelectValue placeholder="All outcomes" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="Success">Success</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-text-tertiary text-xs">Provider</Label>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="bg-surface-1 border-border">
                <SelectValue placeholder="All providers" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={() => { setSearchTerm(''); setOutcomeFilter('all'); setProviderFilter('all'); }}>
              <Filter className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </div>
      </Panel>

      {/* Activity Table */}
      <Panel title="Activity Log" noPadding>
        <DataTable
          columns={[
            { key: 'id', header: 'Receipt ID', render: (r: Receipt) => <span className="font-mono text-xs">{r.id}</span> },
            { key: 'timestamp', header: 'Timestamp', render: (r: Receipt) => <span className="text-text-secondary">{formatDate(r.timestamp)}</span> },
            { key: 'runId', header: 'Run ID', render: (r: Receipt) => <span className="font-mono text-xs text-text-secondary">{r.runId}</span> },
            { key: 'correlationId', header: 'Correlation ID', render: (r: Receipt) => <span className="font-mono text-xs text-text-secondary">{r.correlationId}</span> },
            { key: 'actor', header: 'Actor' },
            { key: 'actionType', header: 'Action Type' },
            { 
              key: 'outcome', 
              header: 'Outcome', 
              render: (r: Receipt) => (
                <StatusChip 
                  status={r.outcome === 'Success' ? 'success' : r.outcome === 'Blocked' ? 'warning' : 'critical'} 
                  label={r.outcome} 
                />
              ) 
            },
            { key: 'providerCallId', header: 'Provider Call ID', render: (r: Receipt) => <span className="font-mono text-xs text-text-secondary">{r.providerCallId}</span> },
          ]}
          data={filteredReceipts}
          keyExtractor={(r: Receipt) => r.id}
          onRowClick={(r) => setSelectedReceipt(r)}
          emptyMessage="No results found for the current filters."
        />
      </Panel>

      {/* Receipt Detail Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="bg-card border-border max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              Receipt Details: {selectedReceipt?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-text-tertiary text-xs">Timestamp</Label>
                  <p className="text-sm">{formatDate(selectedReceipt.timestamp)}</p>
                </div>
                <div>
                  <Label className="text-text-tertiary text-xs">Actor</Label>
                  <p className="text-sm">{selectedReceipt.actor}</p>
                </div>
                <div>
                  <Label className="text-text-tertiary text-xs">Action Type</Label>
                  <p className="text-sm">{selectedReceipt.actionType}</p>
                </div>
                <div>
                  <Label className="text-text-tertiary text-xs">Outcome</Label>
                  <div className="mt-1">
                    <StatusChip 
                      status={selectedReceipt.outcome === 'Success' ? 'success' : selectedReceipt.outcome === 'Blocked' ? 'warning' : 'critical'} 
                      label={selectedReceipt.outcome}
                      size="md"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-text-tertiary text-xs">Provider</Label>
                  <p className="text-sm">{selectedReceipt.provider}</p>
                </div>
                <div>
                  <Label className="text-text-tertiary text-xs">Provider Call ID</Label>
                  <p className="text-sm font-mono">{selectedReceipt.providerCallId}</p>
                </div>
              </div>

              {/* Correlation IDs */}
              <div className="pt-4 border-t border-border">
                <Label className="text-text-tertiary text-xs mb-2 block">Correlation IDs</Label>
                <div className="flex flex-wrap gap-2">
                  <code className="px-2 py-1 rounded bg-surface-1 text-xs">{selectedReceipt.runId}</code>
                  <code className="px-2 py-1 rounded bg-surface-1 text-xs">{selectedReceipt.correlationId}</code>
                </div>
              </div>

              {/* Redacted Request */}
              <div className="pt-4 border-t border-border">
                <Label className="text-text-tertiary text-xs mb-2 block">Provider Request (Redacted)</Label>
                <pre className="p-3 rounded bg-surface-1 border border-border text-xs overflow-x-auto">
                  {selectedReceipt.redactedRequest}
                </pre>
              </div>

              {/* Redacted Response */}
              <div>
                <Label className="text-text-tertiary text-xs mb-2 block">Provider Response (Redacted)</Label>
                <pre className="p-3 rounded bg-surface-1 border border-border text-xs overflow-x-auto">
                  {selectedReceipt.redactedResponse}
                </pre>
              </div>

              {/* Linked Items */}
              <div className="pt-4 border-t border-border">
                <Label className="text-text-tertiary text-xs mb-2 block">Linked Items</Label>
                <div className="space-y-2">
                  {selectedReceipt.linkedIncidentId && (
                    <div className="flex items-center gap-2 p-2 rounded bg-surface-1 border border-border">
                      <LinkIcon className="h-4 w-4 text-text-tertiary" />
                      <span className="text-xs">Incident:</span>
                      <span className="text-xs font-mono text-primary">{selectedReceipt.linkedIncidentId}</span>
                    </div>
                  )}
                  {selectedReceipt.linkedApprovalId && (
                    <div className="flex items-center gap-2 p-2 rounded bg-surface-1 border border-border">
                      <LinkIcon className="h-4 w-4 text-text-tertiary" />
                      <span className="text-xs">Approval:</span>
                      <span className="text-xs font-mono text-primary">{selectedReceipt.linkedApprovalId}</span>
                    </div>
                  )}
                  {selectedReceipt.linkedCustomerId && (
                    <div className="flex items-center gap-2 p-2 rounded bg-surface-1 border border-border">
                      <LinkIcon className="h-4 w-4 text-text-tertiary" />
                      <span className="text-xs">Customer:</span>
                      <span className="text-xs font-mono text-primary">{selectedReceipt.linkedCustomerId}</span>
                    </div>
                  )}
                  {!selectedReceipt.linkedIncidentId && !selectedReceipt.linkedApprovalId && !selectedReceipt.linkedCustomerId && (
                    <p className="text-sm text-text-tertiary">No linked items.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              disabled={systemState.safetyMode}
              title={systemState.safetyMode ? 'Restricted when Safety Mode is ON' : ''}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Verify Run Integrity
              {systemState.safetyMode && (
                <AlertTriangle className="h-3 w-3 ml-2 text-warning" />
              )}
            </Button>
            <Button variant="outline" onClick={() => setSelectedReceipt(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
