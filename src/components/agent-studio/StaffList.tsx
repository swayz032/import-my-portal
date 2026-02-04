import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';
import type { StaffMember, StaffRuntimeConfig } from '@/contracts/ecosystem';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StaffAvatar } from './StaffAvatar';
import { Search, Mic, Mail, MessageSquare, Cpu, Radio, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StaffListProps {
  staff: StaffMember[];
  configs: StaffRuntimeConfig[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const channelIcons: Record<string, React.ElementType> = {
  voice: Mic,
  email: Mail,
  text: MessageSquare,
  internal: Cpu,
  multi: Radio,
};

const channelLabels: Record<string, { operator: string; engineer: string }> = {
  voice: { operator: 'Voice', engineer: 'voice' },
  email: { operator: 'Email', engineer: 'email' },
  text: { operator: 'Chat', engineer: 'text' },
  internal: { operator: 'Internal', engineer: 'internal' },
  multi: { operator: 'All Channels', engineer: 'multi' },
};

const rolloutConfig: Record<string, { operator: string; color: string; percentage: number }> = {
  active: { operator: 'Live', color: 'text-success', percentage: 100 },
  draft: { operator: 'Draft', color: 'text-muted-foreground', percentage: 0 },
  proposed: { operator: 'Review', color: 'text-warning', percentage: 0 },
  paused: { operator: 'Paused', color: 'text-warning', percentage: 50 },
  deprecated: { operator: 'Retired', color: 'text-destructive', percentage: 0 },
};

export function StaffList({ staff, configs, selectedId, onSelect }: StaffListProps) {
  const { viewMode } = useSystem();
  const isOperator = viewMode === 'operator';
  const [search, setSearch] = useState('');

  const getConfig = (staffId: string) => configs.find(c => c.staff_id === staffId);

  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.title.toLowerCase().includes(search.toLowerCase()) ||
    member.staff_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-surface-1">
      {/* Premium Search Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-background border-border text-sm focus-visible:ring-primary/50"
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">
            {filteredStaff.length} {isOperator ? 'team members' : 'staff_items'}
          </span>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredStaff.map((member, index) => {
            const config = getConfig(member.staff_id);
            const isSelected = selectedId === member.staff_id;
            const rolloutState = config?.rollout_state || 'draft';
            const rollout = rolloutConfig[rolloutState];
            const channel = channelLabels[member.channel];
            const ChannelIcon = channelIcons[member.channel] || Radio;

            return (
              <button
                key={member.staff_id}
                onClick={() => onSelect(member.staff_id)}
                className={cn(
                  'w-full text-left rounded-xl transition-all duration-200',
                  'border bg-card hover:bg-accent/50',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  'group animate-fade-in',
                  isSelected 
                    ? 'border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.15)] bg-accent' 
                    : 'border-border hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-lg'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Premium Avatar */}
                    <StaffAvatar
                      staffId={member.staff_id}
                      name={member.name}
                      size="md"
                      status={rolloutState}
                      showStatus
                    />
                    
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground truncate">
                          {member.name}
                        </span>
                        {config?.enabled && (
                          <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {isOperator ? member.title : `${member.staff_id} • ${member.role}`}
                      </p>
                      
                      {/* Channel & Status Row */}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-[10px] px-2 py-0.5 h-5 gap-1',
                            'bg-primary/10 text-primary border-primary/20'
                          )}
                        >
                          <ChannelIcon className="h-3 w-3" />
                          {isOperator ? channel.operator : channel.engineer}
                        </Badge>
                        
                        {member.visibility === 'external' && (
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-2 py-0.5 h-5 bg-success/10 text-success border-success/20"
                          >
                            {isOperator ? 'Public' : 'external'}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Rollout Progress */}
                      {rolloutState === 'active' && (
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className={cn('font-medium', rollout.color)}>
                              {isOperator ? rollout.operator : rolloutState}
                            </span>
                            <span className="text-muted-foreground">100%</span>
                          </div>
                          <Progress value={100} className="h-1" />
                        </div>
                      )}
                      
                      {rolloutState !== 'active' && (
                        <div className="mt-3">
                          <Badge 
                            variant="outline"
                            className={cn(
                              'text-[10px] px-2 py-0.5',
                              rolloutState === 'draft' && 'bg-muted text-muted-foreground border-muted',
                              rolloutState === 'proposed' && 'bg-warning/10 text-warning border-warning/20',
                              rolloutState === 'paused' && 'bg-warning/10 text-warning border-warning/20',
                              rolloutState === 'deprecated' && 'bg-destructive/10 text-destructive border-destructive/20'
                            )}
                          >
                            {isOperator ? rollout.operator : rolloutState}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredStaff.length === 0 && (
            <div className="p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-3">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No staff found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
