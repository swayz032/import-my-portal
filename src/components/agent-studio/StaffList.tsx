import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';
import type { StaffMember, StaffRuntimeConfig } from '@/contracts/ecosystem';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StaffAvatar } from './StaffAvatar';
import { Search, Mic, Mail, MessageSquare, Cpu, Radio, CheckCircle } from 'lucide-react';

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
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 bg-background border-border text-xs focus-visible:ring-primary/50"
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {filteredStaff.length} {isOperator ? 'members' : 'items'}
          </span>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
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
                  'w-full text-left rounded-lg transition-all duration-200',
                  'border bg-card',
                  'focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50',
                  'group animate-fade-in',
                  isSelected 
                    ? 'border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.12)] bg-primary/[0.04]' 
                    : 'border-transparent hover:border-border hover:bg-accent/30'
                )}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Compact Avatar */}
                    <StaffAvatar
                      staffId={member.staff_id}
                      name={member.name}
                      size="sm"
                      status={rolloutState}
                      showStatus
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground truncate">
                          {member.name}
                        </span>
                        {config?.enabled && (
                          <CheckCircle className="h-3 w-3 text-success shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {isOperator ? member.title : `${member.staff_id} • ${member.role}`}
                      </p>
                    </div>
                    
                    {/* Right-side status */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-[9px] px-1.5 py-0 h-4 gap-1',
                          'bg-primary/10 text-primary border-primary/20'
                        )}
                      >
                        <ChannelIcon className="h-2.5 w-2.5" />
                        {isOperator ? channel.operator : channel.engineer}
                      </Badge>
                      
                      {rolloutState === 'active' ? (
                        <span className={cn('text-[9px] font-medium', rollout.color)}>
                          {isOperator ? '● Live' : 'active'}
                        </span>
                      ) : (
                        <Badge 
                          variant="outline"
                          className={cn(
                            'text-[9px] px-1.5 py-0 h-4',
                            rolloutState === 'draft' && 'bg-muted text-muted-foreground border-muted',
                            rolloutState === 'proposed' && 'bg-warning/10 text-warning border-warning/20',
                            rolloutState === 'paused' && 'bg-warning/10 text-warning border-warning/20',
                            rolloutState === 'deprecated' && 'bg-destructive/10 text-destructive border-destructive/20'
                          )}
                        >
                          {isOperator ? rollout.operator : rolloutState}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredStaff.length === 0 && (
            <div className="p-6 text-center">
              <Search className="h-4 w-4 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No staff found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
