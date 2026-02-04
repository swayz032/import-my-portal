import { useState } from 'react';
import { useSystem } from '@/contexts/SystemContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Sparkles, 
  Shield, 
  Wrench, 
  Receipt,
  CheckCircle,
  ChevronRight,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { tools } from '@/ecosystem/snapshot';

interface CustomAgent {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'proposed' | 'active' | 'paused';
  risk_tier: 'low' | 'medium' | 'high';
  tools: string[];
  created_at: string;
}

const MOCK_CUSTOM_AGENTS: CustomAgent[] = [];

const STEPS = [
  { id: 'purpose', label: 'Purpose', icon: Bot },
  { id: 'permissions', label: 'Permissions', icon: Wrench },
  { id: 'governance', label: 'Governance', icon: Shield },
  { id: 'proof', label: 'Proof & Deploy', icon: Receipt },
];

export function CustomAgentsTab() {
  const { viewMode } = useSystem();
  const isOperator = viewMode === 'operator';
  const [agents] = useState<CustomAgent[]>(MOCK_CUSTOM_AGENTS);
  const [createOpen, setCreateOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tools: [] as string[],
    risk_tier: 'low' as 'low' | 'medium' | 'high',
    approval_required: false,
  });

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      tools: [],
      risk_tier: 'low',
      approval_required: false,
    });
    setCurrentStep(0);
    setCreateOpen(true);
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

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.name.trim().length > 0;
      case 1: return true;
      case 2: return true;
      case 3: return true;
      default: return true;
    }
  };

  const toolsByCategory = tools.reduce((acc, tool) => {
    const cat = tool.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-6 max-w-4xl mx-auto">
          {agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {isOperator ? 'No Custom Agents Yet' : 'No Custom Registry Items'}
              </h2>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                {isOperator 
                  ? 'Create your first custom agent to automate specific workflows tailored to your needs.'
                  : 'No custom registry_items created. Use the builder to define new agents with governance policies.'
                }
              </p>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                {isOperator ? 'Create Agent' : 'New Registry Item'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  {isOperator ? 'Your Custom Agents' : 'Custom Registry Items'}
                </h2>
                <Button onClick={handleCreate} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {isOperator ? 'Create Agent' : 'New Item'}
                </Button>
              </div>
              <div className="grid gap-4">
                {agents.map((agent) => (
                  <Card key={agent.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground">{agent.description}</p>
                        </div>
                        <Badge variant="outline">{agent.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Create Agent Drawer */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="p-6 border-b border-border shrink-0">
            <SheetTitle>
              {isOperator ? 'Create Custom Agent' : 'New Registry Item'}
            </SheetTitle>
          </SheetHeader>

          {/* Step Indicator */}
          <div className="px-6 py-4 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              {STEPS.map((step, idx) => {
                const isComplete = idx < currentStep;
                const isCurrent = idx === currentStep;
                const StepIcon = step.icon;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={cn(
                      'flex items-center gap-2',
                      isCurrent && 'text-primary',
                      isComplete && 'text-success',
                      !isCurrent && !isComplete && 'text-muted-foreground'
                    )}>
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium',
                        isCurrent && 'bg-primary text-primary-foreground',
                        isComplete && 'bg-success/20 text-success',
                        !isCurrent && !isComplete && 'bg-muted text-muted-foreground'
                      )}>
                        {isComplete ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                      </div>
                      <span className="text-xs font-medium hidden sm:inline">{step.label}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-border mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-4">
              {currentStep === 0 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {isOperator ? 'Agent Name' : 'name'}
                    </Label>
                    <Input
                      id="name"
                      placeholder={isOperator ? 'e.g., Invoice Approver' : 'agent_name'}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {isOperator ? 'What does it do?' : 'description'}
                    </Label>
                    <Textarea
                      id="description"
                      placeholder={isOperator 
                        ? 'Describe what this agent will handle...'
                        : 'Agent description for registry'
                      }
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {isOperator 
                      ? 'Select the tools this agent can use'
                      : 'Configure tool_policy.allowlist'
                    }
                  </p>
                  {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
                    <div key={category}>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {categoryTools.map((tool) => (
                          <div 
                            key={tool.tool_id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-surface-1 border border-border"
                          >
                            <Checkbox
                              checked={formData.tools.includes(tool.tool_id)}
                              onCheckedChange={(checked) => {
                                setFormData({
                                  ...formData,
                                  tools: checked
                                    ? [...formData.tools, tool.tool_id]
                                    : formData.tools.filter(t => t !== tool.tool_id)
                                });
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{tool.name}</p>
                              <p className="text-xs text-muted-foreground">{tool.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      {isOperator ? 'Risk Level' : 'risk_tier'}
                    </Label>
                    <Select
                      value={formData.risk_tier}
                      onValueChange={(value) => setFormData({ ...formData, risk_tier: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          {isOperator ? 'Low — Runs automatically' : 'low'}
                        </SelectItem>
                        <SelectItem value="medium">
                          {isOperator ? 'Medium — Periodic review' : 'medium'}
                        </SelectItem>
                        <SelectItem value="high">
                          {isOperator ? 'High — Approval for most actions' : 'high'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-1 border border-border">
                    <Checkbox
                      checked={formData.approval_required}
                      onCheckedChange={(checked) => setFormData({ ...formData, approval_required: !!checked })}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {isOperator ? 'Require approval for actions' : 'approval_required'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isOperator 
                          ? 'You will be asked before the agent takes action'
                          : 'Enables approval queue for all actions'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Name</span>
                        <span className="text-sm font-medium">{formData.name || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tools</span>
                        <span className="text-sm font-medium">{formData.tools.length} selected</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Risk</span>
                        <Badge variant="outline" className="text-xs">
                          {formData.risk_tier}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Approval</span>
                        <span className="text-sm font-medium">
                          {formData.approval_required ? 'Required' : 'Automatic'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-foreground font-medium mb-1">
                      {isOperator ? 'What happens next' : 'Status: Draft → Proposed'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isOperator 
                        ? 'Your agent will be saved as a draft. Submit it for review to make it live.'
                        : 'Creates a ConfigChangeProposal for review before activation.'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-6 border-t border-border shrink-0 flex justify-between">
            <Button
              variant="ghost"
              onClick={currentStep === 0 ? () => setCreateOpen(false) : handleBack}
            >
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            <Button
              onClick={currentStep === STEPS.length - 1 ? () => setCreateOpen(false) : handleNext}
              disabled={!canProceed()}
            >
              {currentStep === STEPS.length - 1 
                ? (isOperator ? 'Create Draft' : 'Create Proposal')
                : 'Continue'
              }
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
