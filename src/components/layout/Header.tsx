import { Menu, Bell, User, Bot, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSystem } from '@/contexts/SystemContext';
import { useAuth } from '@/contexts/AuthContext';
import { OperatorEngineerToggle } from '@/components/shared/OperatorEngineerToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { systemState } = useSystem();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  // Extract username from email (before @)
  const displayName = user?.email?.split('@')[0] || 'User';

  return (
    <header className="h-14 border-b border-border bg-black flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-subtle" />
            <span className="font-semibold text-text-primary">Zenith Solutions</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-text-secondary text-sm">
            <span className="text-border">|</span>
            <span>Suite 120</span>
            <span className="text-border">•</span>
            <span>Office 14</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Operator/Engineer Toggle */}
        <div className="hidden md:block">
          <OperatorEngineerToggle />
        </div>
        
        {systemState.safetyMode && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 border border-warning/30">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-xs font-medium text-warning">Safety Mode Active</span>
          </div>
        )}
        
        {/* LLM Ops Desk Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/llm-ops-desk">
                <Bot className="h-5 w-5 text-primary" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>LLM Ops Desk</p>
          </TooltipContent>
        </Tooltip>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-3 border-l border-border h-auto py-1">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden sm:block text-sm text-text-primary">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
