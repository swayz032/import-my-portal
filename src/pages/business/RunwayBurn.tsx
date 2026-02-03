import { useState } from 'react';
import { Panel } from '@/components/shared/Panel';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable } from '@/components/shared/DataTable';
import { ModeText } from '@/components/shared/ModeText';
import { ModeDetails } from '@/components/shared/ModeDetails';
import { useSystem } from '@/contexts/SystemContext';
import { runwayBurnData, CostCategory } from '@/data/businessSeed';
import { formatCurrency, formatTimeAgo } from '@/lib/formatters';
import { 
  DollarSign, 
  Clock, 
  Wallet, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  Calculator,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function RunwayBurn() {
  const { viewMode } = useSystem();
  const [selectedCategory, setSelectedCategory] = useState<CostCategory | null>(null);
  
  // Scenario planner state
  const [devSpend, setDevSpend] = useState(28000);
  const [marketingSpend, setMarketingSpend] = useState(8500);
  const [legalCpa, setLegalCpa] = useState(3800);
  const [apiCosts, setApiCosts] = useState(5200);
  const [customerCount, setCustomerCount] = useState(50);

  const getOperatorStatus = (changePercent: number) => {
    if (changePercent > 10) return 'Needs attention';
    if (changePercent > 5) return 'Growing';
    if (changePercent < -5) return 'Decreasing';
    return 'Done';
  };

  const scenarioBurn = devSpend + marketingSpend + legalCpa + apiCosts + 2000; // +2000 for misc
  const scenarioRunway = runwayBurnData.cashOnHand / scenarioBurn;
  const revenuePerCustomer = 250; // avg
  const projectedRevenue = customerCount * revenuePerCustomer;
  const grossMargin = projectedRevenue > 0 ? ((projectedRevenue - scenarioBurn) / projectedRevenue * 100) : 0;
  const costPerAction = scenarioBurn / (customerCount * 100); // assume 100 actions per customer

  const operatorColumns = [
    { key: 'category', header: 'Category' },
    { 
      key: 'thisMonth', 
      header: 'This Month', 
      render: (c: CostCategory) => <span className="font-medium">{formatCurrency(c.thisMonth)}</span> 
    },
    { key: 'meaning', header: 'What This Is' },
    { 
      key: 'nextStep', 
      header: 'Next Step', 
      render: (c: CostCategory) => (
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          {c.nextStep}
          <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      )
    },
    { 
      key: 'updatedAt', 
      header: 'Updated', 
      render: (c: CostCategory) => <span className="text-text-secondary text-xs">{formatTimeAgo(c.updatedAt)}</span> 
    },
  ];

  const engineerColumns = [
    { key: 'id', header: 'ID', render: (c: CostCategory) => <span className="font-mono text-xs">{c.id}</span> },
    { key: 'category', header: 'Category' },
    { 
      key: 'thisMonth', 
      header: 'This Month', 
      render: (c: CostCategory) => <span className="font-medium">{formatCurrency(c.thisMonth)}</span> 
    },
    { 
      key: 'change', 
      header: 'Change', 
      render: (c: CostCategory) => {
        const change = ((c.thisMonth - c.lastMonth) / c.lastMonth * 100);
        return (
          <span className={change > 0 ? 'text-warning' : 'text-success'}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
        );
      }
    },
    { key: 'meaning', header: 'Description' },
    { 
      key: 'nextStep', 
      header: 'Action', 
      render: (c: CostCategory) => (
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          {c.nextStep}
          <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">
          <ModeText operator="Runway & Burn" engineer="Runway & Burn Analysis" />
        </h1>
        <p className="page-subtitle">
          <ModeText 
            operator="How long your money will last" 
            engineer="Cash flow analysis and scenario planning" 
          />
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title={viewMode === 'operator' ? 'Monthly Spending' : 'Monthly Burn'}
          value={formatCurrency(runwayBurnData.monthlyBurn)}
          icon={<DollarSign className="h-4 w-4" />}
          status="info"
        />
        <KPICard
          title="Runway"
          value={`${runwayBurnData.runway.toFixed(1)} months`}
          icon={<Clock className="h-4 w-4" />}
          status={runwayBurnData.runway < 12 ? 'warning' : 'success'}
        />
        <KPICard
          title={viewMode === 'operator' ? 'Cash Available' : 'Cash on Hand'}
          value={formatCurrency(runwayBurnData.cashOnHand)}
          icon={<Wallet className="h-4 w-4" />}
          status="success"
        />
        <KPICard
          title={viewMode === 'operator' ? 'Biggest Cost' : 'Top Cost Driver'}
          value={runwayBurnData.biggestCostDriver}
          icon={<TrendingUp className="h-4 w-4" />}
          status="info"
        />
        <KPICard
          title={viewMode === 'operator' ? 'Change This Month' : 'Burn Change MoM'}
          value={`+${runwayBurnData.burnChangePercent}%`}
          icon={<AlertCircle className="h-4 w-4" />}
          status="warning"
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">
            <ModeText operator="Overview" engineer="Cost Overview" />
          </TabsTrigger>
          <TabsTrigger value="planner">
            <Calculator className="h-4 w-4 mr-2" />
            <ModeText operator="Plan Ahead" engineer="Scenario Planner" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* What Needs Attention */}
          <Panel title={viewMode === 'operator' ? 'What Needs Attention' : 'Action Items'}>
            <div className="space-y-3">
              {runwayBurnData.attentionItems.map((item) => (
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

          {/* Cost Categories Table */}
          <Panel title={viewMode === 'operator' ? 'Cost Breakdown' : 'Cost Categories'} noPadding>
            <DataTable
              columns={viewMode === 'operator' ? operatorColumns : engineerColumns}
              data={runwayBurnData.costCategories}
              keyExtractor={(c) => c.id}
              onRowClick={(c) => setSelectedCategory(c)}
            />
          </Panel>
        </TabsContent>

        <TabsContent value="planner" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <Panel title={viewMode === 'operator' ? 'Adjust Spending' : 'Scenario Inputs'}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Engineering</span>
                    <span className="font-medium">{formatCurrency(devSpend)}</span>
                  </div>
                  <Slider
                    value={[devSpend]}
                    onValueChange={([v]) => setDevSpend(v)}
                    min={10000}
                    max={50000}
                    step={1000}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Marketing</span>
                    <span className="font-medium">{formatCurrency(marketingSpend)}</span>
                  </div>
                  <Slider
                    value={[marketingSpend]}
                    onValueChange={([v]) => setMarketingSpend(v)}
                    min={0}
                    max={25000}
                    step={500}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Legal & CPA</span>
                    <span className="font-medium">{formatCurrency(legalCpa)}</span>
                  </div>
                  <Slider
                    value={[legalCpa]}
                    onValueChange={([v]) => setLegalCpa(v)}
                    min={1000}
                    max={10000}
                    step={100}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API & Infrastructure</span>
                    <span className="font-medium">{formatCurrency(apiCosts)}</span>
                  </div>
                  <Slider
                    value={[apiCosts]}
                    onValueChange={([v]) => setApiCosts(v)}
                    min={1000}
                    max={15000}
                    step={200}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Customer Count</span>
                    <span className="font-medium">{customerCount}</span>
                  </div>
                  <Slider
                    value={[customerCount]}
                    onValueChange={([v]) => setCustomerCount(v)}
                    min={10}
                    max={500}
                    step={5}
                  />
                </div>
              </div>
            </Panel>

            {/* Outputs */}
            <Panel title={viewMode === 'operator' ? 'What This Means' : 'Scenario Outputs'}>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-surface-1 border border-border">
                  <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                    {viewMode === 'operator' ? 'Monthly Spending' : 'Projected Burn'}
                  </p>
                  <p className="text-2xl font-semibold">{formatCurrency(scenarioBurn)}</p>
                </div>

                <div className="p-4 rounded-lg bg-surface-1 border border-border">
                  <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                    {viewMode === 'operator' ? 'How Long Cash Lasts' : 'Runway'}
                  </p>
                  <p className={`text-2xl font-semibold ${scenarioRunway < 12 ? 'text-warning' : 'text-success'}`}>
                    {scenarioRunway.toFixed(1)} months
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-surface-1 border border-border">
                  <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                    {viewMode === 'operator' ? 'Profit Margin Estimate' : 'Gross Margin'}
                  </p>
                  <p className={`text-2xl font-semibold ${grossMargin < 0 ? 'text-destructive' : 'text-success'}`}>
                    {grossMargin.toFixed(1)}%
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-surface-1 border border-border">
                  <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                    {viewMode === 'operator' ? 'Cost Per Action' : 'Cost Per Action'}
                  </p>
                  <p className="text-2xl font-semibold">{formatCurrency(costPerAction)}</p>
                </div>
              </div>
            </Panel>
          </div>
        </TabsContent>
      </Tabs>

      {/* Details Sheet */}
      <Sheet open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedCategory?.category}</SheetTitle>
            <SheetDescription>
              {viewMode === 'operator' ? 'Vendor breakdown' : 'Detailed cost breakdown'}
            </SheetDescription>
          </SheetHeader>
          {selectedCategory && (
            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-lg bg-surface-1 border border-border">
                <p className="text-sm text-text-secondary mb-2">This Month Total</p>
                <p className="text-2xl font-semibold">{formatCurrency(selectedCategory.thisMonth)}</p>
              </div>

              <ModeDetails
                summary={
                  <div>
                    <p className="text-sm font-medium mb-1">Vendors</p>
                    <p className="text-xs text-text-secondary">{selectedCategory.vendors.length} line items</p>
                  </div>
                }
                details={
                  <div className="space-y-2">
                    {selectedCategory.vendors.map((vendor, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-surface-2">
                        <div>
                          <p className="text-sm">{vendor.name}</p>
                          <p className="text-xs text-text-tertiary">{vendor.type}</p>
                        </div>
                        <span className="font-medium">{formatCurrency(vendor.amount)}</span>
                      </div>
                    ))}
                  </div>
                }
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
