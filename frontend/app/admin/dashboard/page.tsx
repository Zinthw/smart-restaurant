"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  ChefHat,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/lib/menu-data";
import { adminAPI } from "@/lib/api";

interface Order {
  id: number;
  table_id: number;
  table_number?: number;
  customer_name?: string;
  total_amount: string;
  status: string;
  created_at: string;
  items?: Array<{ item_name: string; quantity: number }>;
}

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  activeOrders: number;
  avgOrderValue: number;
}

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: {
    label: "Pending",
    color: "bg-warning text-warning-foreground",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: "bg-info text-info-foreground",
    icon: CheckCircle,
  },
  preparing: {
    label: "Preparing",
    color: "bg-primary text-primary-foreground",
    icon: ChefHat,
  },
  ready: {
    label: "Ready",
    color: "bg-success text-success-foreground",
    icon: CheckCircle,
  },
  served: {
    label: "Served",
    color: "bg-accent text-accent-foreground",
    icon: CheckCircle,
  },
  paid: {
    label: "Paid",
    color: "bg-muted text-muted-foreground",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-destructive text-destructive-foreground",
    icon: Clock,
  },
};

export default function AdminDashboardPage() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    activeOrders: 0,
    avgOrderValue: 0,
  });
  const [pendingCount, setPendingCount] = useState(0);
  const [preparingCount, setPreparingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // Fetch summary statistics
      const summaryData = await adminAPI.reports.getSummary();

      const todayOrders = parseInt(summaryData.today.orders_today) || 0;
      const todayRevenue = parseFloat(summaryData.today.revenue_today) || 0;
      const activeOrders = parseInt(summaryData.active.active_orders) || 0;

      setStats({
        todayRevenue,
        todayOrders,
        activeOrders,
        avgOrderValue: todayOrders > 0 ? todayRevenue / todayOrders : 0,
      });

      // Fetch recent orders
      const ordersData = await adminAPI.orders.getRecent(10);
      setRecentOrders(ordersData);

      // Count orders by status
      const pending = ordersData.filter(
        (o: Order) => o.status === "pending"
      ).length;
      const preparing = ordersData.filter(
        (o: Order) => o.status === "preparing"
      ).length;
      setPendingCount(pending);
      setPreparingCount(preparing);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const statsDisplay = [
    {
      title: "Today's Revenue",
      value: formatPrice(stats.todayRevenue),
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: stats.todayOrders.toString(),
      icon: ShoppingBag,
    },
    {
      title: "Active Orders",
      value: stats.activeOrders.toString(),
      icon: Users,
    },
    {
      title: "Avg Order Value",
      value: formatPrice(stats.avgOrderValue),
      icon: TrendingUp,
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))
            : statsDisplay.map((stat) => {
                const Icon = stat.icon;

                return (
                  <Card key={stat.title}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-card-foreground">
                          {stat.value}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {/* Quick Stats and Recent Orders */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">
                      Pending Orders
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Needs attention
                    </p>
                  </div>
                </div>
                <Badge className="bg-warning text-warning-foreground">
                  {pendingCount}
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <ChefHat className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">
                      In Kitchen
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Being prepared
                    </p>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  {preparingCount}
                </Badge>
              </div>

              <Button
                className="w-full bg-transparent"
                variant="outline"
                asChild
              >
                <a href="/admin/kds">View Kitchen Display</a>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <a href="/admin/orders">View All</a>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <ShoppingBag className="mx-auto mb-2 h-8 w-8" />
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.slice(0, 5).map((order) => {
                    const config =
                      statusConfig[order.status] || statusConfig.pending;
                    const StatusIcon = config.icon;

                    return (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <span className="text-sm font-medium text-muted-foreground">
                              T{order.table_number || order.table_id}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">
                              #{order.id.toString().padStart(6, "0")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.items?.length || 0} item
                              {(order.items?.length || 0) > 1 ? "s" : ""} •{" "}
                              {new Date(order.created_at).toLocaleTimeString(
                                "vi-VN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={config.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {config.label}
                          </Badge>
                          <span className="font-medium text-card-foreground">
                            {formatPrice(parseFloat(order.total_amount))}
                          </span>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
