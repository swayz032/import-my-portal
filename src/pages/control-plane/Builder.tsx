import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';
import { BuilderState, DEFAULT_BUILDER_STATE, DEFAULT_CAPABILITIES } from '@/contracts/control-plane';
import { createDraftRegistryItem, proposeConfigChange } from '@/services/controlPlaneClient';
import { Button } from '@/components/ui/button';
import { PurposeStrip } from '@/components/shared/PurposeStrip';
import { AgentPreviewCard } from '@/components/control-plane/AgentPreviewCard';
import {
  IdentityStep,
  CapabilitiesStep,
  GovernanceStep,
  PromptStep,
  ReviewStep,
} from '@/components/control-plane/BuilderSteps';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  User,
  Wrench,
  Shield,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 'identity', label: 'Identity', icon: User },
  { id: 'capabilities', label: 'Capabilities', icon: Wrench },
  { id: 'governance', label: 'Governance', icon: Shield },
  { id: 'prompt', label: 'Prompt', icon: FileText },
  { id: 'review', label: 'Review', icon: CheckCircle },
];

export default function Builder() {
  const { viewMode } = useSystem();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<BuilderState>({
    ...DEFAULT_BUILDER_STATE,
    capabilities: DEFAULT_CAPABILITIES,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (updates: Partial<BuilderState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return state.name.trim().length > 0 && state.description.trim().length > 0;
      case 1: return true; // Capabilities are optional
      case 2: return true; // Governance has defaults
      case 3: return state.prompt_content.trim().length > 0;
      case 4: return true; // Review step
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await createDraftRegistryItem(state);
      toast.success(viewMode === 'operator' ? 'Draft saved!' : 'Draft registry item created');
      navigate('/control-plane/registry');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const item = await createDraftRegistryItem(state);
      await proposeConfigChange({
        registry_item_id: item.id,
        registry_item_name: item.name,
        change_type: 'create',
        summary: `Create new ${item.type}: ${item.name}`,
        diff: {
          before: {},
          after: { name: item.name, description: item.description, risk_tier: item.risk_tier },
        },
      });
      toast.success(
        viewMode === 'operator' 
          ? 'Agent submitted for review!' 
          : 'ConfigChangeProposal created'
      );
      navigate('/control-plane/registry');
    } catch (error) {
      toast.error('Failed to submit');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    const stepProps = { state, onChange: handleChange };
    switch (currentStep) {
      case 0: return <IdentityStep {...stepProps} />;
      case 1: return <CapabilitiesStep {...stepProps} />;
      case 2: return <GovernanceStep {...stepProps} />;
      case 3: return <PromptStep {...stepProps} />;
      case 4: return <ReviewStep {...stepProps} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          {viewMode === 'operator' ? 'Create Agent' : 'Agent Builder'}
        </h1>
        <p className="page-subtitle">
          {viewMode === 'operator' 
            ? 'Build a new automated team member step by step'
            : 'Configure a new registry item with capabilities and governance'}
        </p>
      </div>

      <PurposeStrip
        operatorPurpose="Follow these steps to create an agent that can help automate your work."
        engineerPurpose="Multi-step wizard creates a RegistryItem with full capability and governance config."
        operatorAction="Complete each step, then submit for review"
        engineerObjects={['RegistryItem', 'ConfigChangeProposal']}
        variant="compact"
      />

      {/* Main Layout */}
      <div className="grid lg:grid-cols-[220px_1fr_300px] gap-6">
        {/* Left: Stepper */}
        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-1">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const StepIcon = step.icon;
              
              return (
                <button
                  key={step.id}
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  disabled={index > currentStep}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all',
                    isCurrent && 'bg-primary/10 text-primary',
                    isCompleted && 'text-muted-foreground hover:bg-accent',
                    !isCurrent && !isCompleted && 'text-muted-foreground/50 cursor-not-allowed'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    isCurrent && 'bg-primary text-primary-foreground',
                    isCompleted && 'bg-success/20 text-success',
                    !isCurrent && !isCompleted && 'bg-muted text-muted-foreground'
                  )}>
                    {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{step.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Step Content */}
        <div className="min-w-0">
          {/* Mobile Step Indicator */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep + 1} of {STEPS.length}</span>
              <span>{STEPS[currentStep].label}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-card border border-border rounded-xl p-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              {currentStep === STEPS.length - 1 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {viewMode === 'operator' ? 'Save Draft' : 'Save as Draft'}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={saving || !canProceed()}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {viewMode === 'operator' ? 'Submit for Review' : 'Create Proposal'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              {viewMode === 'operator' ? 'Preview' : 'Live Preview'}
            </div>
            <AgentPreviewCard state={state} />
          </div>
        </div>
      </div>
    </div>
  );
}
