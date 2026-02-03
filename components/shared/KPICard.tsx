import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label?: string;
  };
  status?: 'success' | 'warning' | 'critical' | 'info';
  icon?: ReactNode;
  linkTo?: string;
  linkLabel?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  status,
  icon,
  linkTo,
  linkLabel,
}: KPICardProps) {
  const statusColors = {
    success: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive',
    info: 'text-primary',
  };

  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {title}
        </span>
        {icon && (
          <div className={cn('p-1.5 rounded-md bg-surface-2', status && statusColors[status])}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className={cn(
          'text-2xl font-semibold text-text-primary',
          status && statusColors[status]
        )}>
          {value}
        </span>
        {trend && (
          <span className={cn(
            'flex items-center text-xs font-medium',
            trend.value >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {trend.value >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend.value)}%
            {trend.label && <span className="ml-1 text-text-tertiary">{trend.label}</span>}
          </span>
        )}
      </div>
      
      {subtitle && (
        <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
      )}
      
      {linkTo && (
        <Link
          to={linkTo}
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-2 font-medium"
        >
          {linkLabel || 'View details'}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
