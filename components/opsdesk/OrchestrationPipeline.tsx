import { useState } from 'react';
import { useOpsDesk } from '@/contexts/OpsDeskContext';
import { useSystem } from '@/contexts/SystemContext';
import { Panel } from '@/components/shared/Panel';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { 
  Sparkles, 
  FileText, 
  Code, 
  FileCheck, 
  CheckSquare, 
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineStepProps {
  step: number;
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  isComplete: boolean;
  isDisabled: boolean;
  disabledReason?: string;
  children: React.ReactNode;
}

function PipelineStep({ step, title, icon, isActive, isComplete, isDisabled, disabledReason, children }: PipelineStepProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className={cn(
      'border rounded-lg transition-all',
      isComplete && 'border-success/30 bg-success/5',
      isActive && !isComplete && 'border-primary/30 bg-primary/5',
      !isActive && !isComplete && 'border-border bg-surface-1',
      isDisabled && 'opacity-60'
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
            isComplete && 'bg-success text-success-foreground',
            isActive && !isComplete && 'bg-primary text-primary-foreground',
            !isActive && !isComplete && 'bg-surface-2 text-text-secondary'
          )}>
            {isComplete ? '✓' : step}
          </div>
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium text-text-primary">{title}</span>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4 text-text-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          {isDisabled && disabledReason && (
            <p className="text-xs text-warning mb-3 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {disabledReason}
            </p>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

export function OrchestrationPipeline() {
  const { systemState } = useSystem();
  const {
    analysisResult,
    fixPlanResult,
    patchDraftResult,
    releaseChecklist,
    createdApprovalId,
    runAnalysis,
    runFixPlan,
    runPatchDraft,
    createApproval,
    updateReleaseChecklist,
    markReadyForRelease,
    isAnalyzing,
    isGeneratingPlan,
    isDraftingPatch,
    isCreatingApproval,
  } = useOpsDesk();
  
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [decisionReason, setDecisionReason] = useState('');
  
  const handleCreateApproval = async () => {
    await createApproval(decisionReason);
    setApprovalDialogOpen(false);
    setDecisionReason('');
  };
  
  const allChecklistComplete = 
    releaseChecklist.testsCompleted &&
    releaseChecklist.stagingVerified &&
    releaseChecklist.rollbackPlanConfirmed &&
    releaseChecklist.approvalRecorded;
  
  return (
    <Panel title="Orchestration Pipeline">
      <div className="space-y-4">
        {/* Step 1: Analyze */}
        <PipelineStep
          step={1}
          title="Analyze (Ava / GPT)"
          icon={<Sparkles className="h-4 w-4 text-primary" />}
          isActive={!analysisResult}
          isComplete={!!analysisResult}
          isDisabled={false}
        >
          <div className="space-y-3">
            <Button 
              onClick={runAnalysis} 
              disabled={isAnalyzing || !!analysisResult}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : analysisResult ? (
                'Analysis Complete'
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
            
            <p className="text-xs text-warning flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Analysis is advisory only. No execution authority.
            </p>
            
            {analysisResult && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div>
                  <Label className="text-xs text-text-tertiary">Summary</Label>
                  <p className="text-sm text-text-secondary">{analysisResult.summary}</p>
                </div>
                <div>
                  <Label className="text-xs text-text-tertiary">Suspected Cause</Label>
                  <p className="text-sm text-text-secondary">{analysisResult.suspectedCause}</p>
                </div>
                <div>
                  <Label className="text-xs text-text-tertiary">Suggested Next Checks</Label>
                  <ul className="list-disc list-inside text-sm text-text-secondary">
                    {analysisResult.suggestedChecks.map((check, i) => (
                      <li key={i}>{check}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-text-tertiary">Confidence</Label>
                  <RiskBadge risk={analysisResult.confidence === 'High' ? 'Low' : analysisResult.confidence === 'Low' ? 'High' : 'Medium'} />
                </div>
              </div>
            )}
          </div>
        </PipelineStep>
        
        {/* Step 2: Generate Fix Plan */}
        <PipelineStep
          step={2}
          title="Generate Fix Plan (Ava / GPT)"
          icon={<FileText className="h-4 w-4 text-primary" />}
          isActive={!!analysisResult && !fixPlanResult}
          isComplete={!!fixPlanResult}
          isDisabled={!analysisResult}
          disabledReason={!analysisResult ? 'Complete analysis first' : undefined}
        >
          <div className="space-y-3">
            <Button 
              onClick={runFixPlan} 
              disabled={!analysisResult || isGeneratingPlan || !!fixPlanResult}
              className="w-full"
            >
              {isGeneratingPlan ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : fixPlanResult ? (
                'Fix Plan Complete'
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Fix Plan
                </>
              )}
            </Button>
            
            {fixPlanResult && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div>
                  <Label className="text-xs text-text-tertiary">Plan Steps</Label>
                  <ol className="list-decimal list-inside text-sm text-text-secondary space-y-1">
                    {fixPlanResult.steps.map((step, i) => (
                      <li key={i}>{step.replace(/^\d+\.\s*/, '')}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <Label className="text-xs text-text-tertiary">Acceptance Criteria</Label>
                  <ul className="list-disc list-inside text-sm text-text-secondary">
                    {fixPlanResult.acceptanceCriteria.map((criteria, i) => (
                      <li key={i}>{criteria}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Label className="text-xs text-text-tertiary">Rollback Plan</Label>
                  <p className="text-sm text-text-secondary">{fixPlanResult.rollbackPlan}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-text-tertiary">Risk Rating</Label>
                  <RiskBadge risk={fixPlanResult.riskRating} />
                </div>
              </div>
            )}
          </div>
        </PipelineStep>
        
        {/* Step 3: Draft Patch */}
        <PipelineStep
          step={3}
          title="Draft Patch (Claude worker)"
          icon={<Code className="h-4 w-4 text-success" />}
          isActive={!!fixPlanResult && !patchDraftResult}
          isComplete={!!patchDraftResult}
          isDisabled={!fixPlanResult}
          disabledReason={!fixPlanResult ? 'Generate fix plan first' : undefined}
        >
          <div className="space-y-3">
            <Button 
              onClick={runPatchDraft} 
              disabled={!fixPlanResult || isDraftingPatch || !!patchDraftResult}
              className="w-full"
            >
              {isDraftingPatch ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Drafting...
                </>
              ) : patchDraftResult ? (
                'Patch Draft Complete'
              ) : (
                <>
                  <Code className="h-4 w-4 mr-2" />
                  Draft Patch (Claude)
                </>
              )}
            </Button>
            
            {patchDraftResult && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div>
                  <Label className="text-xs text-text-tertiary">Patch Summary</Label>
                  <p className="text-sm text-text-secondary">{patchDraftResult.patchSummary}</p>
                </div>
                <div>
                  <Label className="text-xs text-text-tertiary">Impacted Areas</Label>
                  <p className="text-sm text-text-secondary font-mono">{patchDraftResult.impactedAreas || '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-text-tertiary">Test Plan</Label>
                  <p className="text-sm text-text-secondary">{patchDraftResult.testPlan}</p>
                </div>
                <div>
                  <Label className="text-xs text-text-tertiary">Rollback Notes</Label>
                  <p className="text-sm text-text-secondary">{patchDraftResult.rollbackNotes || '—'}</p>
                </div>
              </div>
            )}
          </div>
        </PipelineStep>
        
        {/* Step 4: Create Approval */}
        <PipelineStep
          step={4}
          title="Create Approval"
          icon={<FileCheck className="h-4 w-4 text-primary" />}
          isActive={!!patchDraftResult && !createdApprovalId}
          isComplete={!!createdApprovalId}
          isDisabled={!patchDraftResult}
          disabledReason={!patchDraftResult ? 'Draft patch first' : undefined}
        >
          <div className="space-y-3">
            <Button 
              onClick={() => setApprovalDialogOpen(true)} 
              disabled={!patchDraftResult || isCreatingApproval || !!createdApprovalId}
              className="w-full"
            >
              {isCreatingApproval ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : createdApprovalId ? (
                `Approval ${createdApprovalId} Created`
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Create Approval
                </>
              )}
            </Button>
          </div>
        </PipelineStep>
        
        {/* Step 5: Release Checklist */}
        <PipelineStep
          step={5}
          title="Release Checklist (You)"
          icon={<CheckSquare className="h-4 w-4 text-primary" />}
          isActive={!!createdApprovalId}
          isComplete={allChecklistComplete}
          isDisabled={!createdApprovalId}
          disabledReason={!createdApprovalId ? 'Create approval first' : undefined}
        >
          <div className="space-y-3">
            {systemState.safetyMode && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                <p className="text-sm text-warning flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Safety Mode is ON. Production changes are restricted.
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tests"
                  checked={releaseChecklist.testsCompleted}
                  onCheckedChange={(checked) => updateReleaseChecklist('testsCompleted', !!checked)}
                  disabled={!createdApprovalId}
                />
                <Label htmlFor="tests" className="text-sm text-text-secondary">Tests completed</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="staging"
                  checked={releaseChecklist.stagingVerified}
                  onCheckedChange={(checked) => updateReleaseChecklist('stagingVerified', !!checked)}
                  disabled={!createdApprovalId}
                />
                <Label htmlFor="staging" className="text-sm text-text-secondary">Staging verified</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rollback"
                  checked={releaseChecklist.rollbackPlanConfirmed}
                  onCheckedChange={(checked) => updateReleaseChecklist('rollbackPlanConfirmed', !!checked)}
                  disabled={!createdApprovalId}
                />
                <Label htmlFor="rollback" className="text-sm text-text-secondary">Rollback plan confirmed</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="approval"
                  checked={releaseChecklist.approvalRecorded}
                  disabled
                />
                <Label htmlFor="approval" className="text-sm text-text-secondary">Approval recorded</Label>
              </div>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    onClick={markReadyForRelease}
                    disabled={!allChecklistComplete || systemState.safetyMode}
                    className="w-full"
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Mark Ready for Release
                  </Button>
                </div>
              </TooltipTrigger>
              {systemState.safetyMode && (
                <TooltipContent>
                  <p>Disabled in Safety Mode.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </PipelineStep>
      </div>
      
      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Create Approval</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              This will create an approval record linked to the current patch proposal.
            </p>
            <div className="space-y-2">
              <Label htmlFor="decision-reason">Decision Reason (required)</Label>
              <Textarea
                id="decision-reason"
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Explain why this patch should be approved..."
                className="bg-surface-1 border-border"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateApproval} disabled={!decisionReason.trim()}>
              Create Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
