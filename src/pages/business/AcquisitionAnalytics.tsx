import { useState } from 'react';
import { Panel } from '@/components/shared/Panel';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable } from '@/components/shared/DataTable';
import { ModeText } from '@/components/shared/ModeText';
import { ModeDetails } from '@/components/shared/ModeDetails';
import { useSystem } from '@/contexts/SystemContext';
import { acquisitionAnalyticsData, ChannelPerformance, AgeRangeData, GenderData } from '@/data/businessSeed';
import { formatPercent } from '@/lib/formatters';
import { 
  Users, 
  TrendingUp, 
  Target, 
  BarChart3, 
  UserCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Cell
} from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FUNNEL_COLORS = ['hsl(187, 82%, 53%)', 'hsl(187, 82%, 45%)', 'hsl(187, 82%, 37%)', 'hsl(187, 82%, 29%)'];

export default function AcquisitionAnalytics() {
  const { viewMode } = useSystem();

  const funnelData = [
    { name: 'Visits', value: acquisitionAnalyticsData.funnel.visits, fill: FUNNEL_COLORS[0] },
    { name: 'Signups', value: acquisitionAnalyticsData.funnel.signups, fill: FUNNEL_COLORS[1] },
    { name: 'Activated', value: acquisitionAnalyticsData.funnel.activated, fill: FUNNEL_COLORS[2] },
    { name: 'Paid', value: acquisitionAnalyticsData.funnel.paid, fill: FUNNEL_COLORS[3] },
  ];

  const operatorChannelColumns = [
    { key: 'source', header: 'Channel' },
    { key: 'signups', header: 'Signups', render: (c: ChannelPerformance) => <span className="font-medium">{c.signups}</span> },
    { key: 'paid', header: 'Paid', render: (c: ChannelPerformance) => <span className="font-medium">{c.paid}</span> },
    { 
      key: 'conversionRate', 
      header: 'Success Rate', 
      render: (c: ChannelPerformance) => (
        <span className={c.conversionRate > 5 ? 'text-success' : 'text-text-secondary'}>
          {formatPercent(c.conversionRate)}
        </span>
      )
    },
  ];

  const engineerChannelColumns = [
    { key: 'id', header: 'ID', render: (c: ChannelPerformance) => <span className="font-mono text-xs">{c.id}</span> },
    { key: 'source', header: 'Source' },
    { key: 'medium', header: 'Medium' },
    { key: 'campaign', header: 'Campaign', render: (c: ChannelPerformance) => <span className="text-text-secondary">{c.campaign || '—'}</span> },
    { key: 'visits', header: 'Visits' },
    { key: 'signups', header: 'Signups' },
    { key: 'activated', header: 'Activated' },
    { key: 'paid', header: 'Paid' },
    { key: 'conversionRate', header: 'Conv %', render: (c: ChannelPerformance) => formatPercent(c.conversionRate) },
  ];

  const ageChartData = acquisitionAnalyticsData.demographics.ageRanges.map(a => ({
    name: a.range,
    signups: a.signups,
    conversions: a.conversions,
    rate: a.conversionRate,
  }));

  const genderChartData = acquisitionAnalyticsData.demographics.genders.map(g => ({
    name: g.gender.charAt(0).toUpperCase() + g.gender.slice(1).replace('_', ' '),
    signups: g.signups,
    conversions: g.conversions,
    rate: g.conversionRate,
  }));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">
          <ModeText operator="Acquisition Analytics" engineer="Acquisition Analytics" />
        </h1>
        <p className="page-subtitle">
          <ModeText 
            operator="Where your customers come from" 
            engineer="Channel performance, funnel metrics, and demographic analysis" 
          />
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title={viewMode === 'operator' ? 'Signups (7 days)' : 'Signups 7d'}
          value={acquisitionAnalyticsData.signups7d}
          subtitle={`${acquisitionAnalyticsData.signups30d} in 30 days`}
          icon={<Users className="h-4 w-4" />}
          status="success"
        />
        <KPICard
          title={viewMode === 'operator' ? 'Visitor → Signup' : 'Conversion Rate'}
          value={formatPercent(acquisitionAnalyticsData.conversionRate)}
          icon={<TrendingUp className="h-4 w-4" />}
          status="info"
        />
        <KPICard
          title={viewMode === 'operator' ? 'Best Channel' : 'Top Channel'}
          value={acquisitionAnalyticsData.topChannel}
          icon={<Target className="h-4 w-4" />}
          status="success"
        />
        <KPICard
          title={viewMode === 'operator' ? 'Best Age Group' : 'Best Converting Age'}
          value={acquisitionAnalyticsData.bestConvertingAgeRange}
          icon={<BarChart3 className="h-4 w-4" />}
          status="success"
        />
        <KPICard
          title={viewMode === 'operator' ? 'Best Gender' : 'Best Converting Gender'}
          value={acquisitionAnalyticsData.bestConvertingGender.charAt(0).toUpperCase() + acquisitionAnalyticsData.bestConvertingGender.slice(1)}
          icon={<UserCircle className="h-4 w-4" />}
          status="success"
        />
      </div>

      {/* What Needs Attention */}
      <Panel title={viewMode === 'operator' ? 'What Needs Attention' : 'Action Items'}>
        <div className="space-y-3">
          {acquisitionAnalyticsData.attentionItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border">
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-text-secondary">{item.meaning}</p>
              </div>
              <Button variant="outline" size="sm" className="ml-4">
                {item.nextStep}
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </Panel>

      <Tabs defaultValue="channels" className="w-full">
        <TabsList>
          <TabsTrigger value="channels">
            <ModeText operator="Channels" engineer="Channel Performance" />
          </TabsTrigger>
          <TabsTrigger value="funnel">
            <ModeText operator="Funnel" engineer="Conversion Funnel" />
          </TabsTrigger>
          <TabsTrigger value="demographics">
            <ModeText operator="Demographics" engineer="Age & Gender" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-6 mt-6">
          <Panel title={viewMode === 'operator' ? 'Traffic Sources' : 'Channel Performance'} noPadding>
            <DataTable
              columns={viewMode === 'operator' ? operatorChannelColumns : engineerChannelColumns}
              data={acquisitionAnalyticsData.channels}
              keyExtractor={(c) => c.id}
            />
          </Panel>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title={viewMode === 'operator' ? 'Your Funnel' : 'Conversion Funnel'}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(220 18% 11%)', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: 'rgba(255,255,255,0.92)'
                      }}
                    />
                    <Funnel
                      data={funnelData}
                      dataKey="value"
                      nameKey="name"
                      isAnimationActive
                    >
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <LabelList position="right" fill="rgba(255,255,255,0.8)" fontSize={12} />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title={viewMode === 'operator' ? 'Funnel Numbers' : 'Funnel Metrics'}>
              <div className="space-y-4">
                {[
                  { label: 'Visits', value: acquisitionAnalyticsData.funnel.visits, prev: null },
                  { label: 'Signups', value: acquisitionAnalyticsData.funnel.signups, prev: acquisitionAnalyticsData.funnel.visits },
                  { label: 'Activated', value: acquisitionAnalyticsData.funnel.activated, prev: acquisitionAnalyticsData.funnel.signups },
                  { label: 'Paid', value: acquisitionAnalyticsData.funnel.paid, prev: acquisitionAnalyticsData.funnel.activated },
                ].map((step, idx) => (
                  <div key={step.label} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{step.label}</span>
                      <div className="text-right">
                        <span className="font-medium">{step.value.toLocaleString()}</span>
                        {step.prev && (
                          <span className="text-xs text-text-secondary ml-2">
                            ({((step.value / step.prev) * 100).toFixed(1)}% of previous)
                          </span>
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={(step.value / acquisitionAnalyticsData.funnel.visits) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6 mt-6">
          <Alert className="bg-surface-1 border-border">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <ModeDetails
                summary={
                  <span className="text-sm">
                    {viewMode === 'operator' 
                      ? 'Demographics data from analytics (aggregated, consenting users only)'
                      : `Data source: ${acquisitionAnalyticsData.demographics.dataSource.toUpperCase()}`
                    }
                  </span>
                }
                details={
                  <div className="text-xs text-text-secondary space-y-1 mt-2">
                    <p>{acquisitionAnalyticsData.demographics.note}</p>
                    <p>Unknown age: {formatPercent(acquisitionAnalyticsData.demographics.unknownAgePercent)}</p>
                    <p>Unknown gender: {formatPercent(acquisitionAnalyticsData.demographics.unknownGenderPercent)}</p>
                  </div>
                }
              />
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Range */}
            <Panel title={viewMode === 'operator' ? 'By Age Group' : 'Age Range Distribution'}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={12} width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(220 18% 11%)', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: 'rgba(255,255,255,0.92)'
                      }}
                    />
                    <Bar dataKey="signups" fill="hsl(187, 82%, 53%)" name="Signups" />
                    <Bar dataKey="conversions" fill="hsl(142, 71%, 45%)" name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {acquisitionAnalyticsData.demographics.ageRanges.slice(0, 3).map((age) => (
                  <div key={age.range} className="flex justify-between text-sm">
                    <span>{age.range}</span>
                    <span className="text-text-secondary">
                      {age.signups} signups • {formatPercent(age.conversionRate)} conv
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Gender */}
            <Panel title={viewMode === 'operator' ? 'By Gender' : 'Gender Distribution'}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genderChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={12} width={120} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(220 18% 11%)', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        color: 'rgba(255,255,255,0.92)'
                      }}
                    />
                    <Bar dataKey="signups" fill="hsl(262, 83%, 58%)" name="Signups" />
                    <Bar dataKey="conversions" fill="hsl(38, 92%, 50%)" name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {acquisitionAnalyticsData.demographics.genders.slice(0, 3).map((gender) => (
                  <div key={gender.gender} className="flex justify-between text-sm">
                    <span>{gender.gender.charAt(0).toUpperCase() + gender.gender.slice(1).replace('_', ' ')}</span>
                    <span className="text-text-secondary">
                      {gender.signups} signups • {formatPercent(gender.conversionRate)} conv
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Cross-tab note */}
          <Panel title={viewMode === 'operator' ? 'Age × Gender' : 'Cross-Tabulation'}>
            <div className="p-6 text-center text-text-secondary">
              <p className="text-sm">
                {viewMode === 'operator' 
                  ? 'Not enough data yet to show age and gender together'
                  : 'Cross-tabulation requires minimum sample size threshold. Current data: Limited'
                }
              </p>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
