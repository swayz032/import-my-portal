import { Panel } from '@/components/shared/Panel';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileSearch, Shield, Key, Download, Lock } from 'lucide-react';
import { useSystem } from '@/contexts/SystemContext';

export default function Advanced() {
  const { systemState } = useSystem();

  const tools = [
    {
      id: 'deep-logs',
      title: 'Deep Provider Call Logs',
      description: 'Access detailed, unredacted provider call logs for debugging and forensic analysis.',
      icon: FileSearch,
      restricted: true,
    },
    {
      id: 'integrity',
      title: 'Receipt Integrity Verification',
      description: 'Verify the cryptographic integrity of stored receipts and audit trail entries.',
      icon: Shield,
      restricted: systemState.safetyMode,
    },
    {
      id: 'token-ledger',
      title: 'Token and Permission Ledger',
      description: 'View all active tokens, API keys, and permission grants across connected providers.',
      icon: Key,
      restricted: true,
    },
    {
      id: 'export',
      title: 'Data Export Tools',
      description: 'Export customer data, receipts, and audit logs in various formats for compliance.',
      icon: Download,
      restricted: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Advanced</h1>
        <p className="page-subtitle">Restricted tools for advanced operations and debugging</p>
      </div>

      {/* Warning Banner */}
      <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-warning">Restricted Area</h3>
            <p className="text-sm text-text-secondary mt-1">
              Changes made in this section may require additional approvals. Actions are logged and audited. 
              Use caution when accessing sensitive data or modifying system configurations.
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Panel key={tool.id}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${tool.restricted ? 'bg-warning/10' : 'bg-surface-2'}`}>
                <tool.icon className={`h-6 w-6 ${tool.restricted ? 'text-warning' : 'text-primary'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-medium">{tool.title}</h3>
                  {tool.restricted && (
                    <Lock className="h-4 w-4 text-warning" />
                  )}
                </div>
                <p className="text-sm text-text-secondary mb-4">{tool.description}</p>
                <Button 
                  variant={tool.restricted ? 'outline' : 'default'}
                  className={tool.restricted ? 'border-warning/30 text-warning hover:bg-warning/10' : ''}
                  disabled={tool.restricted && tool.id !== 'deep-logs'}
                >
                  {tool.restricted ? 'Request Access' : 'Open Tool'}
                </Button>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {/* Additional Info */}
      <Panel title="Access Control">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border">
            <div>
              <p className="text-sm font-medium">Current Role</p>
              <p className="text-xs text-text-secondary">Operations Administrator</p>
            </div>
            <span className="status-chip status-healthy">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border">
            <div>
              <p className="text-sm font-medium">Safety Mode Override</p>
              <p className="text-xs text-text-secondary">Ability to bypass safety restrictions</p>
            </div>
            <span className="status-chip status-critical">Denied</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border">
            <div>
              <p className="text-sm font-medium">Audit Log Access</p>
              <p className="text-xs text-text-secondary">View and export audit trail</p>
            </div>
            <span className="status-chip status-healthy">Granted</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
