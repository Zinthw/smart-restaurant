"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Package,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/lib/menu-data";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DailyReport {
  date: string;
  total_orders: string;
  revenue: string;
}

interface TopItem {
  name: string;
  total_sold: string;
  revenue: string;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);

  // Reports data
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);

  const fetchReports = async () => {
    try {
      setLoading(true);

      // Fetch summary and top items
      const [summaryData, topItemsData, dailyData] = await Promise.all([
        adminAPI.reports.getSummary(),
        adminAPI.reports.getTopItems(),
        adminAPI.reports.getDailyReport(
          startDate || undefined,
          endDate || undefined
        ),
      ]);

      // Calculate totals from daily reports
      let revenue = 0;
      let orders = 0;

      if (dailyData && dailyData.length > 0) {
        dailyData.forEach((day: DailyReport) => {
          revenue += parseFloat(day.revenue) || 0;
          orders += parseInt(day.total_orders) || 0;
        });
      } else {
        // Use today's data if no daily reports
        revenue = parseFloat(summaryData.today.revenue_today) || 0;
        orders = parseInt(summaryData.today.orders_today) || 0;
      }

      setTotalRevenue(revenue);
      setTotalOrders(orders);
      setAvgOrderValue(orders > 0 ? revenue / orders : 0);

      setDailyReports(dailyData || []);
      setTopItems(topItemsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReports();
    }
  }, [startDate, endDate]);

  const handleExportPDF = () => {
    toast({ title: "Export PDF", description: "Exporting PDF report..." });
  };

  const handleExportExcel = () => {
    toast({ title: "Export Excel", description: "Exporting Excel report..." });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">
              View and export business analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReports}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Date Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    className="pl-9"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="endDate"
                    type="date"
                    className="pl-9"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={fetchReports} disabled={loading}>
                Apply Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                      <DollarSign className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {formatPrice(totalRevenue)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {totalOrders.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                      <TrendingUp className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Avg Order Value
                      </p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {formatPrice(avgOrderValue)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : topItems.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No data available
                </p>
              ) : (
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.total_sold} sold
                        </p>
                      </div>
                      <span className="font-medium text-card-foreground">
                        {formatPrice(parseFloat(item.revenue))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ))}
                </div>
              ) : dailyReports.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No data available for selected period
                </p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {dailyReports.slice(0, 10).map((day) => (
                    <div
                      key={day.date}
                      className="flex items-center justify-between border-b border-border pb-2"
                    >
                      <span className="text-sm text-muted-foreground">
                        {new Date(day.date).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {day.total_orders} orders
                      </span>
                      <span className="font-medium text-card-foreground">
                        {formatPrice(parseFloat(day.revenue))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
