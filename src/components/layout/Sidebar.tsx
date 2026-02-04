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
  { to: '/approvals', icon: CheckCircle, label: 'Approvals' },
  { to: '/activity', icon: Activity, label: 'Activity Log' },
  { to: '/safety', icon: Shield, label: 'Safety Mode' },
  { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
  { to: '/automation', icon: Zap, label: 'Automation' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/subscriptions', icon: CreditCard, label: 'Subscriptions & Sales' },
  { to: '/connected-apps', icon: Plug, label: 'Connected Apps' },
  { to: '/advanced', icon: Settings, label: 'Advanced' },
];

const businessControlItems = [
  { to: '/business/runway-burn', icon: Wallet, label: 'Runway & Burn' },
  { to: '/business/costs-usage', icon: Receipt, label: 'Costs & Usage' },
  { to: '/business/revenue-addons', icon: TrendingUp, label: 'Revenue & Add-ons' },
  { to: '/business/acquisition-analytics', icon: BarChart3, label: 'Acquisition Analytics' },
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

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const renderNavItem = (item: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) => {
    const isActive = location.pathname === item.to || 
      (item.to === '/home' && location.pathname === '/');
    
    const linkContent = (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onClose}
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
          isCollapsed && 'justify-center px-2'
        )}
      >
        {/* Active indicator bar */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
        )}
        <item.icon className={cn(
          'h-[18px] w-[18px] flex-shrink-0 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )} />
        {!isCollapsed && <span>{item.label}</span>}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.to} delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {item.label}
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
    setGroupOpen: (open: boolean) => void,
    groupIcon: React.ComponentType<{ className?: string }>
  ) => {
    const GroupIcon = groupIcon;
    const isAnyActive = items.some(item => location.pathname === item.to);

    if (isCollapsed) {
      return (
        <div className="space-y-1">
          {items.map(item => renderNavItem(item))}
        </div>
      );
    }

    return (
      <Collapsible open={isGroupOpen} onOpenChange={setGroupOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              isAnyActive && 'text-foreground'
            )}
          >
            <div className="flex items-center gap-3">
              <GroupIcon className={cn('h-[18px] w-[18px]', isAnyActive && 'text-primary')} />
              {title}
            </div>
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isGroupOpen && 'rotate-180')} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 space-y-0.5 mt-1">
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
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header with logo and collapse toggle */}
        <div className={cn(
          'flex items-center h-14 px-3 border-b border-border shrink-0',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-foreground tracking-tight">Aspire</span>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
          )}
          
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Desktop collapse toggle */}
          {!isCollapsed && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={onToggleCollapse}
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Collapse sidebar</TooltipContent>
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
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={onToggleCollapse}
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => renderNavItem(item))}

          {/* Business Control Group */}
          {viewMode === 'operator' && (
            <>
              <div className="pt-5 pb-2">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Business Control
                  </p>
                )}
              </div>
              {renderCollapsibleGroup('Business Control', businessControlItems, businessOpen, setBusinessOpen, Wallet)}
            </>
          )}

          {/* Skill Packs Group */}
          {viewMode === 'operator' && (
            <>
              <div className="pt-5 pb-2">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Skill Packs
                  </p>
                )}
              </div>
              {renderCollapsibleGroup('Skill Packs', skillPackItems, skillPacksOpen, setSkillPacksOpen, Package)}
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
