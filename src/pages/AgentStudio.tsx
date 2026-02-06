import { useState } from 'react';
import { useSystem } from '@/contexts/SystemContext';
import { 
  staff, 
  staffConfigs, 
  providers, 
  getSkillpackById, 
  getToolCatalog 
} from '@/ecosystem/snapshot';
import type { StaffRuntimeConfig } from '@/contracts/ecosystem';
import { StaffList } from '@/components/agent-studio/StaffList';
import { ConfigEditor } from '@/components/agent-studio/ConfigEditor';
import { CustomAgentsTab } from '@/components/agent-studio/CustomAgentsTab';
import { DeployTab } from '@/components/agent-studio/DeployTab';
import { OperatorEngineerToggle } from '@/components/shared/OperatorEngineerToggle';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Sparkles, Rocket, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AgentStudio() {
  const { viewMode } = useSystem();
  const isOperator = viewMode === 'operator';
  
  const [activeTab, setActiveTab] = useState('staff');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(
    staff.length > 0 ? staff[0].staff_id : null
  );
  const [configs, setConfigs] = useState<StaffRuntimeConfig[]>(staffConfigs);

  const selectedMember = staff.find(s => s.staff_id === selectedStaffId);
  const selectedConfig = configs.find(c => c.staff_id === selectedStaffId);
  const skillpack = selectedMember?.default_skillpack_id 
    ? getSkillpackById(selectedMember.default_skillpack_id) 
    : null;
  const toolCatalog = selectedMember?.default_skillpack_id
    ? getToolCatalog(selectedMember.default_skillpack_id)
    : [];

  const handleConfigChange = (newConfig: StaffRuntimeConfig) => {
    setConfigs(prev => 
      prev.map(c => c.staff_id === newConfig.staff_id ? newConfig : c)
    );
  };

  return (
    <div className={cn(
      'flex flex-col',
      '-m-4 md:-m-6 lg:-m-8',
      'h-[calc(100vh-3.5rem)]'
    )}>
      {/* Header Bar */}
      <div className={cn(
        'shrink-0 border-b border-border',
        'bg-gradient-to-r from-surface-1 via-background to-background'
      )}>
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <div className={cn(
              'h-9 w-9 rounded-xl flex items-center justify-center',
              'bg-gradient-to-br from-primary/20 to-primary/5',
              'border border-primary/20',
              'shadow-[0_0_20px_hsl(var(--primary)/0.1)]'
            )}>
              <Bot className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight leading-tight">
                {isOperator ? 'Agent Studio' : 'Agent Configuration'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={cn(
                'h-9 p-0.5 gap-0.5',
                'bg-surface-2 border border-border'
              )}>
                <TabsTrigger 
                  value="staff" 
                  className={cn(
                    'gap-1.5 px-4 text-xs font-medium transition-all duration-200',
                    'data-[state=active]:bg-background data-[state=active]:shadow-sm',
                    'data-[state=active]:text-primary'
                  )}
                >
                  <Users className="h-3.5 w-3.5" />
                  {isOperator ? 'Staff' : 'Registry'}
                </TabsTrigger>
                <TabsTrigger 
                  value="custom" 
                  className={cn(
                    'gap-1.5 px-4 text-xs font-medium transition-all duration-200',
                    'data-[state=active]:bg-background data-[state=active]:shadow-sm',
                    'data-[state=active]:text-primary'
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Custom
                </TabsTrigger>
                <TabsTrigger 
                  value="deploy" 
                  className={cn(
                    'gap-1.5 px-4 text-xs font-medium transition-all duration-200',
                    'data-[state=active]:bg-background data-[state=active]:shadow-sm',
                    'data-[state=active]:text-primary'
                  )}
                >
                  <Rocket className="h-3.5 w-3.5" />
                  Deploy
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="h-5 w-px bg-border" />
            <OperatorEngineerToggle />
          </div>
        </div>
      </div>

      {/* Content — 2-panel layout */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'staff' && (
          <div className="h-full flex">
            {/* Left Sidebar — compact staff list */}
            <div className={cn(
              'shrink-0 border-r border-border',
              'w-[260px] xl:w-[280px] 2xl:w-[300px]'
            )}>
              <StaffList
                staff={staff}
                configs={configs}
                selectedId={selectedStaffId}
                onSelect={setSelectedStaffId}
              />
            </div>

            {/* Main Content — full remaining space */}
            <div className="flex-1 min-w-0 bg-background overflow-auto">
              {selectedMember && selectedConfig ? (
                <ConfigEditor
                  member={selectedMember}
                  config={selectedConfig}
                  toolCatalog={toolCatalog}
                  providers={providers}
                  skillpack={skillpack || null}
                  onConfigChange={handleConfigChange}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className={cn(
                      'h-16 w-16 rounded-2xl mx-auto mb-4',
                      'bg-gradient-to-br from-primary/10 to-primary/5',
                      'border border-primary/10',
                      'flex items-center justify-center',
                      'shadow-[0_0_40px_hsl(var(--primary)/0.08)]'
                    )}>
                      <Users className="h-8 w-8 text-primary/40" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {isOperator ? 'Select a team member' : 'Select staff_id'}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Choose from the sidebar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <CustomAgentsTab />
        )}

        {activeTab === 'deploy' && (
          <DeployTab configs={configs} />
        )}
      </div>
    </div>
  );
}
