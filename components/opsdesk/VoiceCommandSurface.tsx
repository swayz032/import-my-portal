import { useOpsDesk, orbStateLabels, AutomationMode } from '@/contexts/OpsDeskContext';
import { useSystem } from '@/contexts/SystemContext';
import { AvaOrb } from './AvaOrb';
import { VoiceControls } from './VoiceControls';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Shield, 
  Info, 
  MessageSquare,
  ChevronRight,
  TestTube,
  FileCheck,
  Eye,
  Hand,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const automationModeLabels: Record<AutomationMode, { label: string; icon: React.ReactNode; description: string }> = {
  advisory: { 
    label: 'Observe', 
    icon: <Eye className="h-4 w-4" />,
    description: 'Analysis only. No automated actions.',
  },
  standard: { 
    label: 'Assist', 
    icon: <Hand className="h-4 w-4" />,
    description: 'Full pipeline with human approval gates.',
  },
  emergency_stop: { 
    label: 'Autopilot', 
    icon: <Zap className="h-4 w-4" />,
    description: 'Maximum automation. Releases still gated.',
  },
};

interface VoiceCommandSurfaceProps {
  onScrollToProof: () => void;
  onScrollToApproval: () => void;
}

export function VoiceCommandSurface({ onScrollToProof, onScrollToApproval }: VoiceCommandSurfaceProps) {
  const { systemState } = useSystem();
  const {
    orbState,
    automationMode,
    setAutomationMode,
    analysisResult,
    fixPlanResult,
    patchDraftResult,
    createdApprovalId,
    currentPatchJob,
    runAnalysis,
    isAnalyzing,
    isGeneratingPlan,
    isDraftingPatch,
  } = useOpsDesk();
  
  // Determine pipeline step
  const getPipelineStep = () => {
    if (!analysisResult) return 1;
    if (!fixPlanResult) return 2;
    if (!patchDraftResult) return 3;
    if (!createdApprovalId) return 4;
    return 5;
  };
  
  const pipelineStep = getPipelineStep();
  const totalSteps = 5;
  
  // Generate status sentence for no-coder
  const getStatusSentence = () => {
    const orbLabel = orbStateLabels[orbState];
    
    if (orbState === 'idle' && pipelineStep === 1) {
      return "Ready to analyze. Click 'Explain in plain English' to start.";
    }
    if (orbState === 'blocked') {
      return "Action blocked due to safety restrictions. Check automation mode.";
    }
    if (isAnalyzing) {
      return `Ava is analyzing the incident (Step ${pipelineStep} of ${totalSteps}). No production changes can happen without your approval.`;
    }
    if (isGeneratingPlan) {
      return `Ava is creating a fix plan (Step ${pipelineStep} of ${totalSteps}). No production changes can happen without your approval.`;
    }
    if (isDraftingPatch) {
      return `Claude is drafting a patch (Step ${pipelineStep} of ${totalSteps}). Running tests in sandbox. No production changes can happen without your approval.`;
    }
    if (patchDraftResult && !createdApprovalId) {
      return `Tests passed! Ready for your approval (Step ${pipelineStep} of ${totalSteps}).`;
    }
    if (createdApprovalId) {
      return `Approval created. Review the release checklist to proceed (Step ${pipelineStep} of ${totalSteps}).`;
    }
    if (orbState === 'speaking') {
      return `Ava is speaking. Tap to interrupt.`;
    }
    if (orbState === 'listening') {
      return `Listening... Speak your command or type below.`;
    }
    
    return `Right now: ${orbLabel} (Step ${pipelineStep} of ${totalSteps}). No production changes can happen without your approval.`;
  };
  
  // Approval button enabled when tests pass
  const isApprovalReady = !!(
    patchDraftResult && 
    currentPatchJob?.state === 'tests_passed' || 
    currentPatchJob?.state === 'awaiting_approval'
  );
  
  return (
    <div className="bg-black rounded-xl border border-border overflow-hidden">
      {/* Header Strip */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">LLM Ops Desk</h1>
          
          {systemState.safetyMode && (
            <Badge variant="outline" className="bg-warning/10 border-warning/30 text-warning">
              <Shield className="h-3 w-3 mr-1" />
              Safety Mode
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Automation Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-surface-1 rounded-lg">
            {(Object.keys(automationModeLabels) as AutomationMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setAutomationMode(mode)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  automationMode === mode 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                )}
              >
                {automationModeLabels[mode].icon}
                {automationModeLabels[mode].label}
              </button>
            ))}
          </div>
          
          {/* How it works */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-text-secondary hover:text-text-primary">
                <Info className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-card border-border">
              <SheetHeader>
                <SheetTitle className="text-text-primary">How This Works</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {[
                  { step: 1, text: 'Ava reads evidence and explains what\'s happening (no execution authority).' },
                  { step: 2, text: 'Ava writes a fix plan (what to change, how to test, how to rollback).' },
                  { step: 3, text: 'Claude drafts a patch in a safe sandbox and runs tests.' },
                  { step: 4, text: 'Robots verify the app in staging/canary to prove it\'s fixed.' },
                  { step: 5, text: 'You approve release, then the system deploys and verifies again.' },
                ].map((item) => (
                  <div 
                    key={item.step} 
                    className={cn(
                      'flex gap-3 p-3 rounded-lg transition-colors',
                      pipelineStep === item.step ? 'bg-primary/10 border border-primary/30' : 'bg-surface-1'
                    )}
                  >
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      pipelineStep > item.step ? 'bg-success text-success-foreground' :
                      pipelineStep === item.step ? 'bg-primary text-primary-foreground' :
                      'bg-surface-2 text-text-tertiary'
                    )}>
                      {pipelineStep > item.step ? '✓' : item.step}
                    </div>
                    <p className="text-sm text-text-secondary">{item.text}</p>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Orb Center */}
      <div className="flex flex-col items-center py-8 px-6">
        <AvaOrb />
        
        {/* Voice Controls */}
        <div className="mt-6">
          <VoiceControls />
        </div>
      </div>
      
      {/* Operator CTA Row */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-1 bg-surface-1/50 border-border hover:bg-surface-2"
            onClick={runAnalysis}
            disabled={isAnalyzing || !!analysisResult}
          >
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="text-xs text-text-secondary">Explain in plain English</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-1 bg-surface-1/50 border-border hover:bg-surface-2"
            onClick={onScrollToProof}
          >
            <ChevronRight className="h-5 w-5 text-primary" />
            <span className="text-xs text-text-secondary">What's next?</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-1 bg-surface-1/50 border-border hover:bg-surface-2"
            onClick={onScrollToProof}
          >
            <TestTube className="h-5 w-5 text-primary" />
            <span className="text-xs text-text-secondary">Show proof (tests)</span>
          </Button>
          
          <Button
            variant={isApprovalReady ? 'default' : 'outline'}
            className={cn(
              'h-auto py-3 flex flex-col items-center gap-1',
              isApprovalReady 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'bg-surface-1/50 border-border hover:bg-surface-2 opacity-50'
            )}
            onClick={onScrollToApproval}
            disabled={!isApprovalReady}
          >
            <FileCheck className="h-5 w-5" />
            <span className="text-xs">Create approval</span>
          </Button>
        </div>
      </div>
      
      {/* Status Sentence */}
      <div className="px-6 pb-6">
        <div className={cn(
          'p-4 rounded-lg flex items-start gap-3',
          orbState === 'blocked' || orbState === 'error'
            ? 'bg-warning/10 border border-warning/30'
            : 'bg-surface-1/30 border border-border/50'
        )}>
          {orbState === 'blocked' || orbState === 'error' ? (
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-text-secondary">
            {getStatusSentence()}
          </p>
        </div>
      </div>
    </div>
  );
}