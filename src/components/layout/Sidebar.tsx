import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle,
  Activity,
  Shield,
  AlertTriangle,
  Users,
  CreditCard,
  Plug,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Receipt,
  TrendingUp,
  BarChart3,
  Package,
  Cpu,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSystem } from '@/contexts/SystemContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/approvals', icon: CheckCircle, label: 'Approvals' },
  { to: '/activity', icon: Activity, label: 'Activity Log' },
  { to: '/safety', icon: Shield, label: 'Safety Mode' },
  { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
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

  const renderNavItem = (item: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) => {
    const isActive = location.pathname === item.to || 
      (item.to === '/dashboard' && location.pathname === '/');
    
    const linkContent = (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2 focus:ring-offset-sidebar',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <item.icon className={cn(
          'h-5 w-5 flex-shrink-0',
          isActive ? 'text-primary' : 'text-sidebar-foreground'
        )} />
        {!isCollapsed && item.label}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.to} delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground">
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
              'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
              isAnyActive && 'text-sidebar-accent-foreground'
            )}
          >
            <div className="flex items-center gap-3">
              <GroupIcon className={cn('h-5 w-5', isAnyActive && 'text-primary')} />
              {title}
            </div>
            <ChevronDown className={cn('h-4 w-4 transition-transform', isGroupOpen && 'rotate-180')} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 space-y-1 mt-1">
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 bg-black border-r border-sidebar-border transform transition-all duration-200 ease-in-out lg:transform-none',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className={cn(
          'flex items-center h-14 px-4 border-b border-sidebar-border',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-sidebar-accent-foreground">Aspire Admin</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {navItems.map((item) => renderNavItem(item))}

          {/* Business Control Group - Only show when viewMode === 'operator' */}
          {viewMode === 'operator' && (
            <>
              <div className="pt-4 pb-2">
                {!isCollapsed && (
                  <p className="px-3 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                    Business Control
                  </p>
                )}
              </div>
              {renderCollapsibleGroup('Business Control', businessControlItems, businessOpen, setBusinessOpen, Wallet)}
            </>
          )}

          {/* Skill Packs Group - Only show when viewMode === 'operator' */}
          {viewMode === 'operator' && (
            <>
              <div className="pt-4 pb-2">
                {!isCollapsed && (
                  <p className="px-3 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                    Skill Packs
                  </p>
                )}
              </div>
              {renderCollapsibleGroup('Skill Packs', skillPackItems, skillPacksOpen, setSkillPacksOpen, Package)}
            </>
          )}
        </nav>

        {/* Collapse toggle button - desktop only */}
        <div className="absolute bottom-4 left-0 right-0 px-3 hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className={cn(
              'w-full text-sidebar-foreground hover:bg-sidebar-accent/50',
              isCollapsed ? 'justify-center px-2' : 'justify-start'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
