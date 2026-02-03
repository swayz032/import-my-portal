import { useState } from 'react';
import { Panel } from '@/components/shared/Panel';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useSystem } from '@/contexts/SystemContext';
import { receipts, incidents } from '@/data/seed';
import { formatDate, formatTimeAgo } from '@/lib/formatters';
import { Shield, AlertTriangle, Power, Activity, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const autonomyDescriptions = {
  'Limited': 'Most actions require manual approval. Automations are paused or run in read-only mode.',
  'Standard': 'Normal operation mode. Risk-based approvals apply. Automations run as configured.',
  'Emergency Stop': 'All automations halted immediately. Only essential monitoring continues.',
};

export default function Safety() {
  const { systemState, toggleSafetyMode, setAutonomyLevel } = useSystem();
  const [confirmDialog, setConfirmDialog] = useState<'toggle' | 'autonomy' | null>(null);
  const [pendingAutonomy, setPendingAutonomy] = useState<typeof systemState.autonomyLevel | null>(null);

  const recentSafetyActions = receipts.filter(r => 
    r.outcome === 'Blocked' || 
    r.actionType.toLowerCase().includes('safety') ||
    r.actionType.toLowerCase().includes('disconnect')
  ).slice(0, 5);

  const handleToggleSafetyMode = () => {
    toggleSafetyMode();
    setConfirmDialog(null);
  };

  const handleAutonomyChange = (value: typeof systemState.autonomyLevel) => {
    setPendingAutonomy(value);
    setConfirmDialog('autonomy');
  };

  const confirmAutonomyChange = () => {
    if (pendingAutonomy) {
      setAutonomyLevel(pendingAutonomy);
    }
    setConfirmDialog(null);
    setPendingAutonomy(null);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Safety Mode</h1>
        <p className="page-subtitle">System safety controls and automation governance</p>
      </div>

      {/* Main Status */}
      <Panel>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${systemState.safetyMode ? 'bg-warning/20' : 'bg-success/20'}`}>
              <Shield className={`h-8 w-8 ${systemState.safetyMode ? 'text-warning' : 'text-success'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Safety Mode is {systemState.safetyMode ? 'ON' : 'OFF'}
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                {systemState.safetyMode 
                  ? 'Writes restricted; approvals required; risky automations paused.'
                  : 'Normal operation. Standard approval rules apply.'}
              </p>
            </div>
          </div>
          <Button 
            size="lg"
            variant={systemState.safetyMode ? 'default' : 'outline'}
            className={!systemState.safetyMode ? 'border-warning text-warning hover:bg-warning/10' : ''}
            onClick={() => setConfirmDialog('toggle')}
          >
            <Power className="h-4 w-4 mr-2" />
            {systemState.safetyMode ? 'Disable Safety Mode' : 'Enable Safety Mode'}
          </Button>
        </div>
      </Panel>

      {/* Autonomy Level */}
      <Panel title="Autonomy Level">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-text-secondary">
                Control how much autonomy the system has for automated actions.
              </p>
            </div>
            <Select value={systemState.autonomyLevel} onValueChange={handleAutonomyChange}>
              <SelectTrigger className="w-[200px] bg-surface-1 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="Limited">Limited</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Emergency Stop">Emergency Stop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
            {(['Limited', 'Standard', 'Emergency Stop'] as const).map((level) => (
              <div 
                key={level}
                className={`p-4 rounded-lg border ${
                  systemState.autonomyLevel === level 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-surface-1'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${
                    level === 'Emergency Stop' ? 'bg-destructive' :
                    level === 'Limited' ? 'bg-warning' : 'bg-success'
                  }`} />
                  <span className="font-medium text-sm">{level}</span>
                </div>
                <p className="text-xs text-text-secondary">{autonomyDescriptions[level]}</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Recent Safety Actions */}
      <Panel 
        title="Recent Safety Actions"
        action={
          <Link to="/activity" className="text-xs text-primary hover:underline">
            View all activity
          </Link>
        }
      >
        {recentSafetyActions.length > 0 ? (
          <div className="space-y-3">
            {recentSafetyActions.map((action) => (
              <div key={action.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface-1 border border-border">
                <div className={`p-2 rounded-md ${
                  action.outcome === 'Blocked' ? 'bg-warning/20' : 'bg-muted'
                }`}>
                  {action.outcome === 'Blocked' ? (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  ) : (
                    <Activity className="h-4 w-4 text-text-secondary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{action.actionType}</span>
                    <span className="text-xs text-text-tertiary">{formatTimeAgo(action.timestamp)}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {action.actor} • {action.provider}
                  </p>
                  <Link 
                    to={`/activity`} 
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                  >
                    <FileText className="h-3 w-3" />
                    View receipt {action.id}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-text-secondary">
            <p>No recent safety-related actions.</p>
          </div>
        )}
      </Panel>

      {/* Toggle Confirmation Dialog */}
      <Dialog open={confirmDialog === 'toggle'} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              {systemState.safetyMode ? 'Disable Safety Mode?' : 'Enable Safety Mode?'}
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              {systemState.safetyMode 
                ? 'This will restore normal operation. Automated actions will resume based on configured rules.'
                : 'This will restrict write operations and require manual approval for risky actions.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleToggleSafetyMode}
              className={!systemState.safetyMode ? 'bg-warning text-warning-foreground hover:bg-warning/90' : ''}
            >
              {systemState.safetyMode ? 'Disable' : 'Enable'} Safety Mode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Autonomy Confirmation Dialog */}
      <Dialog open={confirmDialog === 'autonomy'} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              Change Autonomy Level?
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              You are about to change the autonomy level to <strong>{pendingAutonomy}</strong>.
              {pendingAutonomy && (
                <span className="block mt-2">{autonomyDescriptions[pendingAutonomy]}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAutonomyChange}
              className={pendingAutonomy === 'Emergency Stop' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
