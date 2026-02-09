import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Home,
  CheckCircle,
  Activity,
  Shield,
  AlertTriangle,
  Users,
  CreditCard,
  Plug,
  Settings,
  X,
  PanelLeftClose,
  PanelLeft,
  Wallet,
  Receipt,
  TrendingUp,
  BarChart3,
  Package,
  Cpu,
  ChevronDown,
  Zap,
  Inbox,
  Server,
  Bot,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSystem } from '@/contexts/SystemContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SIDEBAR_COLLAPSED_KEY = 'aspire_sidebar_collapsed';

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/approvals', icon: CheckCircle, label: 'Approvals', engineerLabel: 'Authority Queue' },
  { to: '/receipts', icon: Receipt, label: 'Proof Log', engineerLabel: 'Receipts' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/outbox', icon: Inbox, label: 'Tasks', engineerLabel: 'Outbox' },
  { to: '/safety', icon: Shield, label: 'Safety' },
  { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
  { to: '/automation', icon: Zap, label: 'Automation' },
  { to: '/connected-apps', icon: Plug, label: 'Services', engineerLabel: 'Providers' },
  { to: '/provider-call-log', icon: Server, label: 'Call Log', engineerLabel: 'Provider Logs' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/subscriptions', icon: CreditCard, label: 'Billing', engineerLabel: 'Subscriptions' },
  { to: '/advanced', icon: Settings, label: 'Settings', engineerLabel: 'Advanced' },
];

const businessControlItems = [
  { to: '/business/runway-burn', icon: Wallet, label: 'Runway & Burn' },
  { to: '/business/costs-usage', icon: Receipt, label: 'Costs & Usage' },
  { to: '/business/revenue-addons', icon: TrendingUp, label: 'Revenue' },
  { to: '/business/acquisition-analytics', icon: BarChart3, label: 'Analytics' },
];

const skillPackItems = [
  { to: '/skill-packs/registry', icon: Package, label: 'Registry' },
  { to: '/skill-packs/analytics', icon: Cpu, label: 'Analytics' },
];

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const { viewMode } = useSystem();
  const [businessOpen, setBusinessOpen] = useState(location.pathname.startsWith('/business'));
  const [skillPacksOpen, setSkillPacksOpen] = useState(location.pathname.startsWith('/skill-packs'));

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const renderNavItem = (item: { to: string; icon: React.ComponentType<{ className?: string }>; label: string; engineerLabel?: string }) => {
    const isActive = location.pathname === item.to || 
      (item.to === '/home' && location.pathname === '/');
    
    const displayLabel = viewMode === 'engineer' && item.engineerLabel ? item.engineerLabel : item.label;
    
    const linkContent = (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onClose}
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors duration-150',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
          isActive
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground',
          isCollapsed && 'justify-center px-2'
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full" />
        )}
        <item.icon className={cn(
          'h-4 w-4 flex-shrink-0 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground'
        )} />
        {!isCollapsed && <span>{displayLabel}</span>}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.to} delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {displayLabel}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  const renderCollapsibleGroup = (
    title: string,
    items: typeof businessControlItems,
    isGroupOpen: boolean,
    setGroupOpen: (open: boolean) => void
  ) => {
    const isAnyActive = items.some(item => location.pathname === item.to);

    if (isCollapsed) {
      return (
        <div className="space-y-0.5">
          {items.map(item => renderNavItem(item))}
        </div>
      );
    }

    return (
      <Collapsible open={isGroupOpen} onOpenChange={setGroupOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              'flex items-center justify-between w-full px-3 py-2 rounded-md text-[13px] font-medium transition-colors duration-150',
              'text-muted-foreground hover:bg-accent/40 hover:text-foreground',
              isAnyActive && 'text-foreground'
            )}
          >
            <span>{title}</span>
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', isGroupOpen && 'rotate-180')} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-3 space-y-0.5 mt-0.5">
          {items.map(item => renderNavItem(item))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col border-r border-border transition-all duration-300 ease-out lg:transform-none',
          'bg-sidebar',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-14' : 'w-56'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center h-14 px-3 border-b border-border shrink-0',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-xs">A</span>
              </div>
              <span className="font-semibold text-sm text-foreground tracking-tight">Aspire</span>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-xs">A</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-7 w-7"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          
          {!isCollapsed && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={onToggleCollapse}
                >
                  <PanelLeftClose className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Collapse</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <div className="hidden lg:flex justify-center py-2 border-b border-border">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={onToggleCollapse}
                >
                  <PanelLeft className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {/* Main nav items */}
          {navItems.map((item) => renderNavItem(item))}

          {/* Agent Studio group */}
          {!isCollapsed && (
            <div className="pt-4 pb-1.5">
              <p className="px-3 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                Agents
              </p>
            </div>
          )}
          {renderNavItem({ to: '/agent-studio', icon: Bot, label: 'Agent Studio' })}
          {renderNavItem({ to: '/agent-studio/create', icon: Plus, label: 'Create Agent' })}

          {/* Business section */}
          {viewMode === 'operator' && (
            <>
              {!isCollapsed && (
                <div className="pt-4 pb-1.5">
                  <p className="px-3 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                    Business
                  </p>
                </div>
              )}
              {renderCollapsibleGroup('Finance', businessControlItems, businessOpen, setBusinessOpen)}
            </>
          )}

          {/* Skill Packs */}
          {viewMode === 'operator' && (
            <>
              {!isCollapsed && (
                <div className="pt-4 pb-1.5">
                  <p className="px-3 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                    Skill Packs
                  </p>
                </div>
              )}
              {renderCollapsibleGroup('Packs', skillPackItems, skillPacksOpen, setSkillPacksOpen)}
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
