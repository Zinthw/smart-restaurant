"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  ChefHat,
  Bell,
  X,
  RefreshCw,
  Volume2,
  VolumeX,
  Loader2,
  LogOut,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { kitchenAPI } from "@/lib/api";
import { formatPrice } from "@/lib/menu-data";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  modifiers: any;
  notes?: string;
  status: string;
}

interface KitchenOrder {
  order_id: string;
  table_id: string;
  table_number: string;
  order_status: string;
  created_at: string;
  customer_name?: string;
  items: OrderItem[];
}

const statusColumns = [
  { key: "pending", label: "Chờ nấu", icon: Clock, color: "bg-warning" },
  { key: "preparing", label: "Đang nấu", icon: ChefHat, color: "bg-primary" },
  { key: "ready", label: "Sẵn sàng", icon: Bell, color: "bg-success" },
];

export default function KitchenDisplayPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [rejectingOrder, setRejectingOrder] = useState<KitchenOrder | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [processingOrder, setProcessingOrder] = useState<number | null>(null);
  const [kitchenName, setKitchenName] = useState("Kitchen");
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await kitchenAPI.getOrders();
      setOrders(data);
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Kiểm tra đăng nhập TRƯỚC
    const token =
      localStorage.getItem("kitchenToken") ||
      localStorage.getItem("admin_token");
    
    // Nếu không có token -> Đá về login ngay lập tức & Dừng lại
    if (!token) {
      router.push("/kitchen/login");
      return;
    }

    // Có token rồi, tắt chế độ kiểm tra -> Cho phép render giao diện Bếp
    setIsAuthChecking(false);

    // Lấy tên hiển thị (nếu có)
    const name =
      localStorage.getItem("kitchenName") || localStorage.getItem("adminName");
    if (name) setKitchenName(name);

    // Có token rồi mới được gọi API
    fetchOrders();

    // Thiết lập polling (tự động cập nhật mỗi 5s)
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders, router]); // Dependency array gộp chung

  useEffect(() => {
    // Update time every second for elapsed time display
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const getElapsedTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const diff = Math.floor((currentTime.getTime() - created.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTimeColor = (createdAt: string) => {
    const created = new Date(createdAt);
    const diff = Math.floor(
      (currentTime.getTime() - created.getTime()) / 1000 / 60
    );
    if (diff >= 15) return "text-destructive";
    if (diff >= 10) return "text-warning";
    return "text-muted-foreground";
  };

  const handleAcceptOrder = async (orderId: string) => {
    setProcessingOrder(Number(orderId));
    try {
      await kitchenAPI.markPreparing(orderId);
      await fetchOrders();
      toast({
        title: "Success",
        description: "Order is now being prepared",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleItemStatusChange = async (itemId: string, newStatus: string) => {
    try {
      await kitchenAPI.updateItemStatus(itemId, newStatus);
      await fetchOrders();
      toast({
        title: "Success",
        description: `Item marked as ${newStatus}`,
      });
      // Play sound for ready status
      if (newStatus === 'ready' && isSoundEnabled) {
        // Would play notification sound in production
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const handleReadyOrder = async (orderId: string) => {
    setProcessingOrder(Number(orderId));
    try {
      await kitchenAPI.markReady(orderId);
      await fetchOrders();
      toast({
        title: "Success",
        description: "Order marked as ready",
      });
      // Play sound for ready status
      if (isSoundEnabled) {
        // Would play notification sound in production
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectingOrder || !rejectReason) return;
    // In production, this would call an API to reject the order
    toast({
      title: "Order Rejected",
      description: "Customer has been notified",
    });
    setRejectingOrder(null);
    setRejectReason("");
    fetchOrders();
  };

  const handleLogout = () => {
    localStorage.removeItem("kitchenToken");
    localStorage.removeItem("kitchenName");
    localStorage.removeItem("kitchenRole");
    router.push("/kitchen/login");
  };

  const getOrdersByStatus = (status: string) => {
    // Flatten items from all orders and filter by item status
    const allItems: Array<OrderItem & { order_id: string; table_number: string; created_at: string }> = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.status === status) {
          allItems.push({
            ...item,
            order_id: order.order_id,
            table_number: order.table_number,
            created_at: order.created_at
          });
        }
      });
    });
    return allItems;
  };

  if (isAuthChecking) {
    return null; 
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <ChefHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-card-foreground">
                Kitchen Display
              </h1>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </header>
        <main className="flex flex-1 gap-4 overflow-x-auto p-4">
          {statusColumns.map((column) => (
            <div key={column.key} className="w-80 shrink-0">
              <Skeleton className="h-12 w-full rounded-t-lg" />
              <div className="space-y-3 p-3">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <ChefHat className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-card-foreground">
              Kitchen Display
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            onClick={() => router.push("/kitchen/change-password")}
            title="Đổi mật khẩu"
          >
            <Key className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex flex-1 gap-4 overflow-x-auto p-4">
        {statusColumns.map((column) => {
          const Icon = column.icon;
          const columnOrders = getOrdersByStatus(column.key);

          return (
            <div
              key={column.key}
              className="flex flex-1 min-w-[320px] flex-col rounded-lg border border-border bg-card"
            >
              {/* Column Header */}
              <div
                className={`flex items-center gap-3 rounded-t-lg ${column.color} p-3`}
              >
                <Icon className="h-5 w-5 text-white" />
                <h2 className="font-semibold text-white">{column.label}</h2>
                <Badge className="ml-auto bg-white/20 text-white">
                  {columnOrders.length}
                </Badge>
              </div>

              {/* Orders */}
              <div className="flex-1 space-y-3 overflow-y-auto p-3">
                {columnOrders.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>Không có món</p>
                  </div>
                ) : (
                  columnOrders.map((item, index) => (
                    <div
                      key={`${item.order_id}-${item.id}-${index}`}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      {/* Item Header */}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            #{item.order_id.slice(-6)}
                          </span>
                          <Badge variant="outline">{item.table_number}</Badge>
                        </div>
                        <div
                          className={`flex items-center gap-1 text-sm font-mono ${getTimeColor(
                            item.created_at
                          )}`}
                        >
                          <Clock className="h-3 w-3" />
                          {getElapsedTime(item.created_at)}
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="mb-3">
                        <div className="rounded bg-muted p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-lg text-card-foreground">
                              {item.quantity}x {item.name}
                            </span>
                          </div>
                          {item.modifiers && (
                            <div className="text-xs text-muted-foreground mt-2 space-y-1">
                              {Array.isArray(item.modifiers) ? (
                                item.modifiers.map((mod: any, idx: number) => (
                                  <div key={idx}>• {mod.name} (+{formatPrice(mod.price || 0)})</div>
                                ))
                              ) : typeof item.modifiers === 'object' ? (
                                Object.entries(item.modifiers).map(([key, val], idx) => (
                                  <div key={idx}>• {key}: {String(val)}</div>
                                ))
                              ) : null}
                            </div>
                          )}
                          {item.notes && (
                            <p className="text-sm italic text-primary mt-2 font-medium">
                              📝 {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {column.key === "pending" && (
                          <Button
                            className="flex-1"
                            size="sm"
                            onClick={() => handleItemStatusChange(item.id, 'preparing')}
                          >
                            <ChefHat className="mr-1 h-4 w-4" />
                            Bắt đầu nấu
                          </Button>
                        )}
                        {column.key === "preparing" && (
                          <Button
                            className="flex-1 bg-success hover:bg-success/90"
                            size="sm"
                            onClick={() => handleItemStatusChange(item.id, 'ready')}
                          >
                            <Bell className="mr-1 h-4 w-4" />
                            Sẵn sàng
                          </Button>
                        )}
                        {column.key === "ready" && (
                          <div className="flex-1 text-center">
                            <p className="text-sm text-success font-medium">
                              ✓ Chờ waiter mang ra
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Reject Dialog */}
      <Dialog
        open={!!rejectingOrder}
        onOpenChange={() => setRejectingOrder(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order #{rejectingOrder?.order_id}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-sm text-muted-foreground">
              Please provide a reason for rejecting this order. The customer
              will be notified.
            </p>
            <Textarea
              placeholder="e.g., Ingredient unavailable, Kitchen closed..."
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
