import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatisticCard } from "./StatisticCard";
import { UserActivity } from "./UserActivity";
import { AlertTriangle, ChevronUp, Users, Clock, MapPin, CheckCircle2, XCircle, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const COLORS = ['#1E3A8A', '#10B981', '#FBBF24', '#F43F5E'];

export function AdminDashboard() {
  const [viewPeriod, setViewPeriod] = useState<"day" | "week" | "month">("week");

  // Fetch statistics
  const { data: cspStats, isLoading: loadingCspStats } = useQuery({
    queryKey: ['/api/stats/csps'],
    staleTime: 60000, // 1 minute
  });

  const { data: transactionStats, isLoading: loadingTransactionStats } = useQuery({
    queryKey: ['/api/stats/transactions'],
    staleTime: 60000,
  });

  const { data: alertStats, isLoading: loadingAlertStats } = useQuery({
    queryKey: ['/api/stats/alerts'],
    staleTime: 60000,
  });

  const { data: auditStats, isLoading: loadingAuditStats } = useQuery({
    queryKey: ['/api/stats/audits'],
    staleTime: 60000,
  });

  // Mock data for visualizations
  const cspStatusData = [
    { name: 'Active', value: cspStats?.active || 8750 },
    { name: 'Pending', value: cspStats?.pending || 1220 },
    { name: 'Inactive', value: cspStats?.inactive || 1850 },
    { name: 'Suspended', value: cspStats?.suspended || 180 },
  ];

  const transactionVolumeData = [
    { name: 'Mon', value: 4200000 },
    { name: 'Tue', value: 3800000 },
    { name: 'Wed', value: 4500000 },
    { name: 'Thu', value: 4100000 },
    { name: 'Fri', value: 5200000 },
    { name: 'Sat', value: 4800000 },
    { name: 'Sun', value: 3500000 },
  ];

  const alertSeverityData = [
    { name: 'Low', value: alertStats?.low || 345 },
    { name: 'Medium', value: alertStats?.medium || 215 },
    { name: 'High', value: alertStats?.high || 78 },
    { name: 'Critical', value: alertStats?.critical || 12 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <Tabs value={viewPeriod} onValueChange={(v) => setViewPeriod(v as any)}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatisticCard 
          title="Total CSPs" 
          value={cspStats?.total || "12,000+"} 
          description={cspStats?.growth ? `${cspStats.growth}% from last month` : "8% from last month"} 
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend="up"
        />
        <StatisticCard 
          title="Transaction Volume" 
          value={transactionStats?.volume ? formatCurrency(transactionStats.volume) : "₹4.2B+"} 
          description={transactionStats?.growth ? `${transactionStats.growth}% from last period` : "12% from last period"} 
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          trend="up"
        />
        <StatisticCard 
          title="Active Alerts" 
          value={alertStats?.active || "65"} 
          description={alertStats?.critical ? `${alertStats.critical} critical alerts` : "12 critical alerts"} 
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          trend={alertStats?.trend || "up"}
          trendColor={alertStats?.trend === "down" ? "text-green-600" : "text-red-600"}
        />
        <StatisticCard 
          title="Pending Audits" 
          value={auditStats?.pending || "42"} 
          description={auditStats?.completed ? `${auditStats.completed} completed this week` : "128 completed this week"} 
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          trend={auditStats?.trend || "down"}
          trendColor={auditStats?.trend === "down" ? "text-green-600" : "text-red-600"}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>
              Daily transaction volume for the current week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => 
                      new Intl.NumberFormat('en-IN', { 
                        notation: 'compact',
                        compactDisplay: 'short',
                        maximumFractionDigits: 1,
                      }).format(value)
                    } 
                  />
                  <Tooltip 
                    formatter={(value) => 
                      new Intl.NumberFormat('en-IN', { 
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0,
                      }).format(Number(value))
                    } 
                  />
                  <Legend />
                  <Bar dataKey="value" name="Volume" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>CSP Status Distribution</CardTitle>
            <CardDescription>
              Current status of all CSPs in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cspStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cspStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [Number(value).toLocaleString(), "CSPs"]} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Distribution and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alert Severity Distribution</CardTitle>
            <CardDescription>
              Active alerts by severity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alertSeverityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {alertSeverityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Alerts"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions across the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserActivity limit={5} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
