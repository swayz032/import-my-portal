import { useState, useEffect, ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useSystem } from '@/contexts/SystemContext';
import { AlertTriangle } from 'lucide-react';
import { AvaFloatingButton } from '@/components/ava/AvaFloatingButton';
import { approvals, incidents } from '@/data/seed';

interface AppLayoutProps {
  children: ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = 'aspire_sidebar_collapsed';

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored ? JSON.parse(stored) : false;
  });
  const { systemState } = useSystem();

  // Sync collapse state with localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Calculate Ava notifications
  const pendingApprovals = approvals.filter(a => a.status === 'Pending').length;
  const openIncidents = incidents.filter(i => i.status === 'Open').length;
  const avaNotifications = pendingApprovals + openIncidents;

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {systemState.safetyMode && (
          <div className="safety-banner">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>
              <strong>Safety Mode is active.</strong> Write operations are restricted and risky automations are paused.
            </span>
          </div>
        )}
        
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Floating Ava Assistant - always available */}
      <AvaFloatingButton 
        hasNotifications={avaNotifications > 0}
        notificationCount={avaNotifications}
      />
    </div>
  );
}
