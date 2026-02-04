import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';
import { 
  BuilderState, 
  DEFAULT_CAPABILITIES, 
  AVAILABLE_TOOLS, 
  AGENT_TEMPLATES,
  RiskTier,
  RequiredPresence,
  RegistryCapability,
} from '@/contracts/control-plane';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Check,
  ChevronDown,
  Info,
  Shield,
  AlertTriangle,
  X,
  Plus,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StepProps {
  state: BuilderState;
  onChange: (updates: Partial<BuilderState>) => void;
}

// ============================================================================
// STEP 1: IDENTITY
// ============================================================================

export function IdentityStep({ state, onChange }: StepProps) {
  const { viewMode } = useSystem();
  const [showNotes, setShowNotes] = useState(false);

  const handleTemplateChange = (templateId: string) => {
    const template = AGENT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      onChange({
        template: templateId,
        ...template.defaults,
      });
    } else {
      onChange({ template: templateId });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          {viewMode === 'operator' ? 'Name Your Agent' : 'Identity Configuration'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {viewMode === 'operator' 
            ? 'Give your agent a clear name and description so your team knows what it does.'
            : 'Configure registry item identity and metadata.'}
        </p>
      </div>

      {/* Template Selector */}
      <div className="space-y-2">
        <Label>
          {viewMode === 'operator' ? 'Start from a template' : 'Template'}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {AGENT_TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => handleTemplateChange(template.id)}
              className={cn(
                'p-4 rounded-lg border text-left transition-all',
                'hover:border-primary/50 hover:bg-accent/30',
                state.template === template.id 
                  ? 'border-primary bg-accent/50' 
                  : 'border-border'
              )}
            >
              <div className="font-medium text-sm">{template.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {template.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          {viewMode === 'operator' ? 'Agent Name' : 'Name'} *
        </Label>
        <Input
          id="name"
          value={state.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder={viewMode === 'operator' ? 'e.g., Invoice Processor' : 'registry_item_name'}
          className="text-base"
        />
        {viewMode === 'operator' && (
          <p className="text-xs text-muted-foreground">
            Choose a clear, descriptive name that tells your team what this agent does.
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          {viewMode === 'operator' ? 'What does it do?' : 'Description'} *
        </Label>
        <Textarea
          id="description"
          value={state.description}
          onChange={e => onChange({ description: e.target.value })}
          placeholder={viewMode === 'operator' 
            ? 'Describe what this agent does in a sentence or two...'
            : 'Brief description of agent functionality'}
          rows={3}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={state.category} onValueChange={v => onChange({ category: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="legal">Legal</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Internal Toggle */}
      <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-surface-2">
        <div>
          <div className="font-medium text-sm">
            {viewMode === 'operator' ? 'Internal only' : 'Internal Flag'}
          </div>
          <div className="text-xs text-muted-foreground">
            {viewMode === 'operator' 
              ? 'Only visible to your team, not external users'
              : 'internal: true restricts visibility'}
          </div>
        </div>
        <Switch
          checked={state.internal}
          onCheckedChange={checked => onChange({ internal: checked })}
        />
      </div>

      {/* Notes (Collapsible) */}
      <Collapsible open={showNotes} onOpenChange={setShowNotes}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronDown className={cn('h-4 w-4 transition-transform', showNotes && 'rotate-180')} />
            {viewMode === 'operator' ? 'Add internal notes' : 'Internal Notes'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <Textarea
            value={state.notes}
            onChange={e => onChange({ notes: e.target.value })}
            placeholder="Internal notes for your team..."
            rows={3}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ============================================================================
// STEP 2: CAPABILITIES
// ============================================================================

export function CapabilitiesStep({ state, onChange }: StepProps) {
  const { viewMode } = useSystem();
  const [toolSearch, setToolSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('communication');

  const capabilities = state.capabilities.length > 0 ? state.capabilities : DEFAULT_CAPABILITIES;

  const handleCapabilityToggle = (capId: string, enabled: boolean) => {
    const updated = capabilities.map(c => 
      c.id === capId ? { ...c, enabled } : c
    );
    onChange({ capabilities: updated });
  };

  const handleToolToggle = (toolId: string) => {
    const current = state.tool_allowlist;
    const updated = current.includes(toolId)
      ? current.filter(t => t !== toolId)
      : [...current, toolId];
    onChange({ tool_allowlist: updated });
  };

  const toolCategories = ['communication', 'data', 'finance', 'crm', 'automation'] as const;
  
  const filteredTools = AVAILABLE_TOOLS.filter(t => 
    !toolSearch || 
    t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
    t.description.toLowerCase().includes(toolSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          {viewMode === 'operator' ? 'What Can It Do?' : 'Capabilities & Tools'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {viewMode === 'operator' 
            ? 'Choose what actions this agent is allowed to perform.'
            : 'Configure capability flags and tool allowlist.'}
        </p>
      </div>

      {/* Capability Cards */}
      <div className="space-y-3">
        <Label>{viewMode === 'operator' ? 'Core Capabilities' : 'Capability Flags'}</Label>
        <div className="grid gap-3">
          {capabilities.map(cap => (
            <div
              key={cap.id}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border transition-all',
                cap.enabled ? 'border-primary bg-primary/5' : 'border-border'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  cap.enabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  <Check className={cn('h-4 w-4', !cap.enabled && 'opacity-0')} />
                </div>
                <div>
                  <div className="font-medium text-sm">{cap.name}</div>
                  <div className="text-xs text-muted-foreground">{cap.description}</div>
                </div>
              </div>
              <Switch
                checked={cap.enabled}
                onCheckedChange={checked => handleCapabilityToggle(cap.id, checked)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tool Allowlist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{viewMode === 'operator' ? 'Allowed Tools' : 'Tool Allowlist'}</Label>
          <span className="text-xs text-muted-foreground">
            {state.tool_allowlist.length} selected
          </span>
        </div>
        
        <Input
          placeholder="Search tools..."
          value={toolSearch}
          onChange={e => setToolSearch(e.target.value)}
          className="mb-3"
        />

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {toolCategories.map(category => {
            const categoryTools = filteredTools.filter(t => t.category === category);
            if (categoryTools.length === 0) return null;
            
            return (
              <Collapsible 
                key={category}
                open={expandedCategory === category}
                onOpenChange={() => setExpandedCategory(expandedCategory === category ? null : category)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors">
                  <span className="font-medium text-sm capitalize">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {categoryTools.filter(t => state.tool_allowlist.includes(t.id)).length}/{categoryTools.length}
                    </span>
                    <ChevronDown className={cn(
                      'h-4 w-4 transition-transform',
                      expandedCategory === category && 'rotate-180'
                    )} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 pl-3 space-y-1">
                  {categoryTools.map(tool => (
                    <label
                      key={tool.id}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                        'hover:bg-accent/50',
                        state.tool_allowlist.includes(tool.id) && 'bg-accent/30'
                      )}
                    >
                      <Checkbox
                        checked={state.tool_allowlist.includes(tool.id)}
                        onCheckedChange={() => handleToolToggle(tool.id)}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{tool.name}</div>
                        <div className="text-xs text-muted-foreground">{tool.description}</div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs',
                          tool.risk_level === 'high' && 'border-destructive text-destructive',
                          tool.risk_level === 'medium' && 'border-warning text-warning'
                        )}
                      >
                        {tool.risk_level}
                      </Badge>
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3: GOVERNANCE
// ============================================================================

export function GovernanceStep({ state, onChange }: StepProps) {
  const { viewMode } = useSystem();
  const [newConstraint, setNewConstraint] = useState('');

  const riskOptions: { value: RiskTier; label: string; description: string }[] = [
    { 
      value: 'low', 
      label: viewMode === 'operator' ? 'Low Risk' : 'Low',
      description: viewMode === 'operator' 
        ? 'Can run automatically with minimal oversight'
        : 'Minimal approval requirements, automated execution'
    },
    { 
      value: 'medium', 
      label: viewMode === 'operator' ? 'Medium Risk' : 'Medium',
      description: viewMode === 'operator'
        ? 'Requires periodic review and monitoring'
        : 'Standard approval workflow, logged actions'
    },
    { 
      value: 'high', 
      label: viewMode === 'operator' ? 'High Risk' : 'High',
      description: viewMode === 'operator'
        ? 'Requires approval for most actions'
        : 'Strict approval requirements, full audit trail'
    },
  ];

  const addConstraint = () => {
    if (newConstraint.trim()) {
      onChange({ constraints: [...state.constraints, newConstraint.trim()] });
      setNewConstraint('');
    }
  };

  const removeConstraint = (index: number) => {
    onChange({ constraints: state.constraints.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          {viewMode === 'operator' ? 'Safety & Controls' : 'Governance Configuration'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {viewMode === 'operator' 
            ? 'Set safety rules and approval requirements for this agent.'
            : 'Configure risk tier, approval policies, and constraints.'}
        </p>
      </div>

      {/* Risk Tier */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {viewMode === 'operator' ? 'Safety Level' : 'Risk Tier'}
        </Label>
        <div className="grid gap-3">
          {riskOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onChange({ risk_tier: option.value })}
              className={cn(
                'flex items-center gap-4 p-4 rounded-lg border text-left transition-all',
                'hover:border-primary/50',
                state.risk_tier === option.value 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border'
              )}
            >
              <div className={cn(
                'w-3 h-3 rounded-full',
                option.value === 'low' && 'bg-success',
                option.value === 'medium' && 'bg-warning',
                option.value === 'high' && 'bg-destructive'
              )} />
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Approval Required */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-surface-2">
        <div>
          <div className="font-medium text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            {viewMode === 'operator' ? 'Require my approval' : 'Approval Required'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {viewMode === 'operator' 
              ? 'I must approve actions before they run'
              : 'approval_required: true adds to Authority Queue'}
          </div>
        </div>
        <Switch
          checked={state.approval_required}
          onCheckedChange={checked => onChange({ approval_required: checked })}
        />
      </div>

      {/* Required Presence (Display Only) */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {viewMode === 'operator' ? 'Presence Required' : 'Required Presence'}
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              {viewMode === 'operator'
                ? 'Whether an operator needs to be available when this agent runs'
                : 'required_presence field for operator availability requirements'}
            </TooltipContent>
          </Tooltip>
        </Label>
        <Select 
          value={state.required_presence} 
          onValueChange={(v: RequiredPresence) => onChange({ required_presence: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              {viewMode === 'operator' ? 'No presence required' : 'none'}
            </SelectItem>
            <SelectItem value="voice">
              {viewMode === 'operator' ? 'Voice available' : 'voice'}
            </SelectItem>
            <SelectItem value="video">
              {viewMode === 'operator' ? 'Video available' : 'video'}
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {viewMode === 'operator'
            ? 'This is informational only - no sessions will be started automatically.'
            : 'Display-only field. No session flows implemented.'}
        </p>
      </div>

      {/* Constraints */}
      <div className="space-y-3">
        <Label>{viewMode === 'operator' ? 'Rules & Limits' : 'Constraints'}</Label>
        
        <div className="flex gap-2">
          <Input
            value={newConstraint}
            onChange={e => setNewConstraint(e.target.value)}
            placeholder={viewMode === 'operator' 
              ? 'Add a rule, e.g., "Cannot send more than 10 emails per hour"'
              : 'Add constraint...'}
            onKeyDown={e => e.key === 'Enter' && addConstraint()}
          />
          <Button onClick={addConstraint} size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {state.constraints.length > 0 ? (
          <div className="space-y-2">
            {state.constraints.map((constraint, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-2"
              >
                <span className="text-sm">{constraint}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeConstraint(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            {viewMode === 'operator'
              ? 'No rules added yet. Rules help keep your agent safe and predictable.'
              : 'No constraints defined.'}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: PROMPT & CONFIG
// ============================================================================

export function PromptStep({ state, onChange }: StepProps) {
  const { viewMode } = useSystem();
  const [showVariables, setShowVariables] = useState(false);

  const charCount = state.prompt_content.length;
  const maxChars = 10000;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          {viewMode === 'operator' ? 'Instructions' : 'Prompt & Config'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {viewMode === 'operator' 
            ? 'Tell your agent how to behave and what to do.'
            : 'Configure versioned prompt and config variables.'}
        </p>
      </div>

      {/* Version */}
      <div className="flex items-center gap-4">
        <div className="space-y-2 flex-1">
          <Label>Version</Label>
          <Input
            value={state.prompt_version}
            onChange={e => onChange({ prompt_version: e.target.value })}
            placeholder="1.0.0"
            className="w-32"
          />
        </div>
        {viewMode === 'operator' && (
          <p className="text-xs text-muted-foreground mt-6">
            Update this when you make significant changes
          </p>
        )}
      </div>

      {/* Prompt Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>
            {viewMode === 'operator' ? 'Agent Instructions' : 'Prompt Content'}
          </Label>
          <span className={cn(
            'text-xs',
            charCount > maxChars * 0.9 ? 'text-warning' : 'text-muted-foreground'
          )}>
            {charCount.toLocaleString()} / {maxChars.toLocaleString()}
          </span>
        </div>
        <Textarea
          value={state.prompt_content}
          onChange={e => onChange({ prompt_content: e.target.value })}
          placeholder={viewMode === 'operator'
            ? 'Write instructions for your agent. Be specific about what it should do, how it should respond, and any rules it must follow...'
            : 'System prompt content...'}
          rows={12}
          className="font-mono text-sm"
        />
        {viewMode === 'operator' && (
          <p className="text-xs text-muted-foreground">
            Tip: Be specific and clear. Include examples of good responses when possible.
          </p>
        )}
      </div>

      {/* Config Variables */}
      <Collapsible open={showVariables} onOpenChange={setShowVariables}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronDown className={cn('h-4 w-4 transition-transform', showVariables && 'rotate-180')} />
            {viewMode === 'operator' ? 'Advanced: Variables' : 'Config Variables'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          <p className="text-xs text-muted-foreground">
            {viewMode === 'operator'
              ? 'Variables let you customize behavior without editing the main instructions.'
              : 'Key-value pairs available in prompt template.'}
          </p>
          <div className="bg-surface-2 p-4 rounded-lg">
            <pre className="text-xs font-mono overflow-x-auto">
              {JSON.stringify(state.config_variables, null, 2) || '{}'}
            </pre>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Variable editor coming soon...
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ============================================================================
// STEP 5: REVIEW
// ============================================================================

export function ReviewStep({ state }: StepProps) {
  const { viewMode } = useSystem();
  const enabledCapabilities = state.capabilities.filter(c => c.enabled);

  const sections = [
    {
      title: viewMode === 'operator' ? 'Identity' : 'Identity',
      items: [
        { label: 'Name', value: state.name || 'Not set' },
        { label: 'Description', value: state.description || 'Not set' },
        { label: 'Category', value: state.category },
        { label: viewMode === 'operator' ? 'Internal only' : 'Internal', value: state.internal ? 'Yes' : 'No' },
      ],
    },
    {
      title: viewMode === 'operator' ? 'Capabilities' : 'Capabilities',
      items: [
        { label: viewMode === 'operator' ? 'Enabled' : 'Capability Count', value: `${enabledCapabilities.length} capabilities` },
        { label: viewMode === 'operator' ? 'Tools' : 'Tool Allowlist', value: `${state.tool_allowlist.length} tools` },
      ],
    },
    {
      title: viewMode === 'operator' ? 'Safety' : 'Governance',
      items: [
        { label: viewMode === 'operator' ? 'Safety Level' : 'Risk Tier', value: state.risk_tier.toUpperCase() },
        { label: viewMode === 'operator' ? 'Needs Approval' : 'Approval Required', value: state.approval_required ? 'Yes' : 'No' },
        { label: viewMode === 'operator' ? 'Rules' : 'Constraints', value: `${state.constraints.length} defined` },
      ],
    },
    {
      title: viewMode === 'operator' ? 'Instructions' : 'Prompt',
      items: [
        { label: 'Version', value: state.prompt_version },
        { label: viewMode === 'operator' ? 'Length' : 'Char Count', value: `${state.prompt_content.length} characters` },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          {viewMode === 'operator' ? 'Review Your Agent' : 'Review & Propose'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {viewMode === 'operator' 
            ? 'Check everything looks right before submitting for review.'
            : 'Review configuration before creating ConfigChangeProposal.'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4">
        {sections.map(section => (
          <div key={section.title} className="rounded-lg border border-border p-4">
            <h3 className="font-medium text-sm mb-3">{section.title}</h3>
            <div className="grid gap-2">
              {section.items.map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* What happens next */}
      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
        <h4 className="font-medium text-sm mb-2">
          {viewMode === 'operator' ? 'What happens next?' : 'Next Steps'}
        </h4>
        <p className="text-sm text-muted-foreground">
          {viewMode === 'operator'
            ? 'Your agent will be saved as a draft and submitted for review. Once approved, you can deploy it to your team.'
            : 'Creates a ConfigChangeProposal with change_type: create. Proposal enters Authority Queue for approval workflow.'}
        </p>
      </div>
    </div>
  );
}
