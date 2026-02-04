import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSystem } from '@/contexts/SystemContext';
import type { StaffMember, StaffRuntimeConfig } from '@/contracts/ecosystem';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search } from 'lucide-react';

// Staff avatar imports
import avaAvatar from '@/assets/staff/ava.png';
import sarahAvatar from '@/assets/staff/sarah.png';
import eliAvatar from '@/assets/staff/eli.png';
import quinnAvatar from '@/assets/staff/quinn.png';
import noraAvatar from '@/assets/staff/nora.png';

interface StaffListProps {
  staff: StaffMember[];
  configs: StaffRuntimeConfig[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const staffAvatars: Record<string, string> = {
  ava: avaAvatar,
  sarah: sarahAvatar,
  eli: eliAvatar,
  quinn: quinnAvatar,
  nora: noraAvatar,
};

const channelLabels: Record<string, { operator: string; engineer: string }> = {
  voice: { operator: 'Voice', engineer: 'voice' },
  email: { operator: 'Email', engineer: 'email' },
  text: { operator: 'Chat', engineer: 'text' },
  internal: { operator: 'Internal', engineer: 'internal' },
  multi: { operator: 'All', engineer: 'multi' },
};

const rolloutLabels: Record<string, { operator: string; color: string }> = {
  active: { operator: 'Live', color: 'bg-success/20 text-success border-success/30' },
  draft: { operator: 'Draft', color: 'bg-muted text-muted-foreground border-border' },
  proposed: { operator: 'Review', color: 'bg-warning/20 text-warning border-warning/30' },
  paused: { operator: 'Paused', color: 'bg-warning/20 text-warning border-warning/30' },
  deprecated: { operator: 'Retired', color: 'bg-destructive/20 text-destructive border-destructive/30' },
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-background border-border text-sm"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredStaff.map((member) => {
            const config = getConfig(member.staff_id);
            const isSelected = selectedId === member.staff_id;
            const rollout = rolloutLabels[config?.rollout_state || 'draft'];
            const channel = channelLabels[member.channel];
            const avatarUrl = staffAvatars[member.staff_id];

            return (
              <button
                key={member.staff_id}
                onClick={() => onSelect(member.staff_id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-all duration-150',
                  'hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  isSelected && 'bg-accent border border-primary/20 shadow-sm'
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={member.name} />
                    ) : null}
                    <AvatarFallback className="text-lg bg-surface-2">
                      {member.avatar_emoji}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate text-sm">
                        {member.name}
                      </span>
                      {!isOperator && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {member.staff_id}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {isOperator ? member.title : member.role}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Badge 
                        variant="outline" 
                        className={cn('text-[10px] px-1.5 py-0 h-5', rollout.color)}
                      >
                        {isOperator ? rollout.operator : config?.rollout_state || 'draft'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-primary/20"
                      >
                        {isOperator ? channel.operator : channel.engineer}
                      </Badge>
                      {member.visibility === 'external' && (
                        <Badge 
                          variant="outline" 
                          className="text-[10px] px-1.5 py-0 h-5"
                        >
                          {isOperator ? 'Public' : 'external'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredStaff.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No staff found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
