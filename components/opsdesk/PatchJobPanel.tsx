import { useOpsDesk, PatchJobState, TestResult, FailureClass } from '@/contexts/OpsDeskContext';
import { Panel } from '@/components/shared/Panel';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Circle,
  AlertTriangle,
  FileCode,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';

const stateLabels: Record<PatchJobState, string> = {
  created: 'Created',
  evidence_loaded: 'Evidence Loaded',
  patch_drafting: 'Drafting Patch',
  tests_running: 'Running Tests',
  tests_passed: 'Tests Passed',
  tests_failed: 'Tests Failed',
  iterating: 'Iterating',
  escalated_to_ava: 'Escalated to Ava',
  awaiting_approval: 'Awaiting Approval',
  ready_for_release: 'Ready for Release',
  closed: 'Closed',
};

const stateColors: Record<PatchJobState, string> = {
  created: 'bg-surface-2 text-text-secondary',
  evidence_loaded: 'bg-blue-500/20 text-blue-400',
  patch_drafting: 'bg-primary/20 text-primary',
  tests_running: 'bg-primary/20 text-primary',
  tests_passed: 'bg-success/20 text-success',
  tests_failed: 'bg-destructive/20 text-destructive',
  iterating: 'bg-warning/20 text-warning',
  escalated_to_ava: 'bg-warning/20 text-warning',
  awaiting_approval: 'bg-primary/20 text-primary',
  ready_for_release: 'bg-success/20 text-success',
  closed: 'bg-surface-2 text-text-tertiary',
};

const testStatusIcons: Record<TestResult['status'], React.ReactNode> = {
  pending: <Circle className="h-3.5 w-3.5 text-text-tertiary" />,
  running: <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />,
  passed: <CheckCircle className="h-3.5 w-3.5 text-success" />,
  failed: <XCircle className="h-3.5 w-3.5 text-destructive" />,
  skipped: <Circle className="h-3.5 w-3.5 text-text-tertiary" />,
};

const failureClassLabels: Record<FailureClass, string> = {
  build: 'Build Failure',
  unit: 'Unit Test Failure',
  integration: 'Integration Failure',
  config: 'Configuration Error',
  flaky: 'Flaky Test',
  unknown: 'Unknown Failure',
};

export function PatchJobPanel() {
  const { currentPatchJob } = useOpsDesk();
  
  if (!currentPatchJob) {
    return (
      <Panel title="Patch Job">
        <div className="text-center py-8">
          <FileCode className="h-8 w-8 text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">
            No active patch job. Start a patch draft to begin.
          </p>
        </div>
      </Panel>
    );
  }
  
  const { state, attemptNumber, maxAttempts, testResults, artifacts, failureClass, createdAt, updatedAt } = currentPatchJob;
  
  // Determine next action recommendation
  let nextAction: { label: string; type: 'info' | 'warning' | 'success' } | null = null;
  if (state === 'tests_failed' && attemptNumber < maxAttempts) {
    nextAction = { label: 'Iterate', type: 'warning' };
  } else if (state === 'tests_failed' && attemptNumber >= maxAttempts) {
    nextAction = { label: 'Escalate', type: 'warning' };
  } else if (state === 'tests_passed') {
    nextAction = { label: 'Approval created automatically', type: 'success' };
  } else if (state === 'awaiting_approval') {
    nextAction = { label: 'Complete release checklist', type: 'info' };
  } else if (state === 'ready_for_release') {
    nextAction = { label: 'Ready for deployment', type: 'success' };
  }
  
  return (
    <Panel title="Patch Job">
      <div className="space-y-4">
        {/* Header row with state and attempt counter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={cn('font-medium', stateColors[state])}>
              {stateLabels[state]}
            </Badge>
            <span className="text-xs text-text-tertiary font-mono">
              {currentPatchJob.id}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <RefreshCw className="h-3 w-3" />
            Attempt {attemptNumber}/{maxAttempts}
          </div>
        </div>
        
        {/* Failure class (if failed) */}
        {failureClass && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{failureClassLabels[failureClass]}</span>
          </div>
        )}
        
        {/* Test results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-text-tertiary font-medium">Test Results</p>
            <div className="grid grid-cols-2 gap-2">
              {testResults.map(test => (
                <div
                  key={test.name}
                  className="flex items-center gap-2 p-2 rounded-lg bg-surface-1 border border-border"
                >
                  {testStatusIcons[test.status]}
                  <span className="text-sm text-text-secondary capitalize">{test.name}</span>
                  {test.duration && (
                    <span className="text-xs text-text-tertiary ml-auto">
                      {test.duration < 1000 ? `${test.duration}ms` : `${(test.duration / 1000).toFixed(1)}s`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Artifacts */}
        {artifacts.patchSummary && (
          <div className="space-y-3 pt-3 border-t border-border">
            <div>
              <p className="text-xs text-text-tertiary mb-1">Patch Summary</p>
              <p className="text-sm text-text-secondary">{artifacts.patchSummary}</p>
            </div>
            
            {artifacts.impactedFiles && artifacts.impactedFiles.length > 0 && (
              <div>
                <p className="text-xs text-text-tertiary mb-1">Impacted Files</p>
                <div className="flex flex-wrap gap-1">
                  {artifacts.impactedFiles.map((file, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-mono">
                      {file.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {artifacts.riskRating && (
              <div className="flex items-center gap-2">
                <p className="text-xs text-text-tertiary">Risk Rating</p>
                <RiskBadge risk={artifacts.riskRating} />
              </div>
            )}
            
            {artifacts.rollbackNotes && (
              <div>
                <p className="text-xs text-text-tertiary mb-1">Rollback Notes</p>
                <p className="text-sm text-text-secondary">{artifacts.rollbackNotes}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Next action recommendation */}
        {nextAction && (
          <div className={cn(
            'flex items-center gap-2 p-3 rounded-lg border',
            nextAction.type === 'success' && 'bg-success/10 border-success/30',
            nextAction.type === 'warning' && 'bg-warning/10 border-warning/30',
            nextAction.type === 'info' && 'bg-primary/10 border-primary/30'
          )}>
            <ArrowRight className={cn(
              'h-4 w-4',
              nextAction.type === 'success' && 'text-success',
              nextAction.type === 'warning' && 'text-warning',
              nextAction.type === 'info' && 'text-primary'
            )} />
            <span className={cn(
              'text-sm font-medium',
              nextAction.type === 'success' && 'text-success',
              nextAction.type === 'warning' && 'text-warning',
              nextAction.type === 'info' && 'text-primary'
            )}>
              {nextAction.label}
            </span>
          </div>
        )}
        
        {/* Timestamps */}
        <div className="flex items-center justify-between text-xs text-text-tertiary pt-2 border-t border-border">
          <span>Created: {formatDate(createdAt)}</span>
          <span>Updated: {formatDate(updatedAt)}</span>
        </div>
      </div>
    </Panel>
  );
}
