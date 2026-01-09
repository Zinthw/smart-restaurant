"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  ChefHat,
  Bell,
  Sparkles,
  X,
  RefreshCw,
  LogOut,
  Filter,
  Volume2,
  VolumeX,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/menu-data";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.3:4000/api";

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  price_per_unit: string;
  total_price: string;
}

interface WaiterOrder {
  id: string;
  table_id: string;
  table_number: string;
  customer_name?: string;
  total_amount: string;
  status: "pending" | "accepted" | "preparing" | "ready" | "served" | "paid";
  created_at: string;
  notes?: string;
  items: OrderItem[];
}

const statusConfig = {
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
    icon: Bell,
  },
  served: {
    label: "Served",
    color: "bg-accent text-accent-foreground",
    icon: Sparkles,
  },
  paid: {
    label: "Paid",
    color: "bg-muted text-muted-foreground",
    icon: CheckCircle,
  },
};

export default function WaiterOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<WaiterOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTable, setFilterTable] = useState<string>("all");
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [rejectingOrder, setRejectingOrder] = useState<WaiterOrder | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");
  const [waiterName, setWaiterName] = useState("Waiter");

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem("waiterToken");
      if (!token) return;

      const response = await fetch(`${API_URL}/waiter/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem("waiterToken");
    const name = localStorage.getItem("waiterName");

    if (!token) {
      router.push("/waiter/login");
      return;
    }

    if (name) setWaiterName(name);
    fetchOrders();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders, router]);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const matchesTable =
      filterTable === "all" || order.table_number === filterTable;
    return matchesStatus && matchesTable;
  });

  const uniqueTables = [...new Set(orders.map((o) => o.table_number))].sort();

  const updateOrderStatus = async (
    orderId: string,
    action: "accept" | "reject" | "served"
  ) => {
    try {
      const token = localStorage.getItem("waiterToken");
      const response = await fetch(
        `${API_URL}/waiter/orders/${orderId}/${action}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body:
            action === "reject"
              ? JSON.stringify({ reason: rejectReason })
              : undefined,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update order");
      }

      fetchOrders();
    } catch (error: any) {
      console.error("Error updating order:", error);
      alert(error.message || "Có lỗi xảy ra");
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    updateOrderStatus(orderId, "accept");
  };

  const handleServeOrder = (orderId: string) => {
    updateOrderStatus(orderId, "served");
  };

  const handleRejectOrder = () => {
    if (!rejectingOrder || !rejectReason) return;
    updateOrderStatus(rejectingOrder.id, "reject");
    setRejectingOrder(null);
    setRejectReason("");
  };

  const handleLogout = () => {
    localStorage.removeItem("waiterToken");
    localStorage.removeItem("waiterName");
    router.push("/waiter/login");
  };

  const readyOrdersCount = orders.filter((o) => o.status === "ready").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-card-foreground">Orders</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {waiterName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {readyOrdersCount > 0 && (
              <Badge className="bg-success text-success-foreground">
                <Bell className="mr-1 h-3 w-3" />
                {readyOrdersCount} ready
              </Badge>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            >
              {isSoundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={fetchOrders}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/waiter/change-password")}
              title="Đổi mật khẩu"
            >
              <Key className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-t border-border px-4 py-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterTable} onValueChange={setFilterTable}>
            <SelectTrigger className="h-8 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tables</SelectItem>
              {uniqueTables.map((table) => (
                <SelectItem key={table} value={table}>
                  Table {table}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Orders List */}
      <main className="p-4">
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="mx-auto mb-4 h-12 w-12 text-muted-foreground animate-spin" />
            <h2 className="text-xl font-bold text-foreground">Đang tải...</h2>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-24 text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground">
              Không có đơn hàng
            </h2>
            <p className="text-muted-foreground">
              Đơn hàng sẽ hiển thị ở đây khi khách đặt
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;
              const isReady = order.status === "ready";

              return (
                <Card
                  key={order.id}
                  className={`overflow-hidden transition-all ${
                    isReady ? "ring-2 ring-success" : ""
                  }`}
                >
                  <CardContent className="p-0">
                    {/* Order Header */}
                    <div
                      className={`flex items-center justify-between p-3 ${
                        isReady ? "bg-success/10" : "border-b border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <span className="font-bold text-muted-foreground">
                            {order.table_number}
                          </span>
                        </div>
                        <div>
                          <span className="font-mono font-bold text-card-foreground">
                            #{order.id.slice(-6)}
                          </span>
                          <p className="text-xs text-muted-foreground">
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
                      <Badge className={config.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>

                    {/* Order Items */}
                    <div className="p-4">
                      {order.customer_name && (
                        <p className="mb-2 text-sm text-muted-foreground">
                          Khách: {order.customer_name}
                        </p>
                      )}
                      <div className="mb-3 space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-card-foreground">
                              {item.quantity}x {item.item_name}
                            </span>
                            <span className="text-muted-foreground">
                              {formatPrice(parseFloat(item.total_price))}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="mb-3 rounded bg-warning/10 p-2">
                          <p className="text-xs text-warning">
                            Note: {order.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <span className="font-bold text-primary">
                          {formatPrice(parseFloat(order.total_amount))}
                        </span>

                        {/* Actions based on status */}
                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptOrder(order.id)}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive bg-transparent"
                                onClick={() => setRejectingOrder(order)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {order.status === "ready" && (
                            <Button
                              className="bg-success hover:bg-success/90"
                              size="sm"
                              onClick={() => handleServeOrder(order.id)}
                            >
                              <Sparkles className="mr-1 h-4 w-4" />
                              Serve
                            </Button>
                          )}

                          {(order.status === "accepted" ||
                            order.status === "preparing") && (
                            <Badge variant="outline">In Kitchen</Badge>
                          )}

                          {order.status === "served" && (
                            <Badge variant="outline">Awaiting Payment</Badge>
                          )}

                          {order.status === "paid" && (
                            <Badge className="bg-muted text-muted-foreground">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Reject Dialog */}
      <Dialog
        open={!!rejectingOrder}
        onOpenChange={() => setRejectingOrder(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reject Order #{rejectingOrder?.id.slice(-6)}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-sm text-muted-foreground">
              Please provide a reason for rejecting this order. The customer
              will be notified.
            </p>
            <Textarea
              placeholder="e.g., Table not ready, Customer left..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingOrder(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectOrder}
              disabled={!rejectReason}
            >
              Reject Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
