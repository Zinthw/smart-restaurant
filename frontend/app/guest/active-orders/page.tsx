"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Clock,
  ChefHat,
  Bell,
  CheckCircle,
  CreditCard,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/guest/bottom-navigation";
import { CartDrawer } from "@/components/guest/cart-drawer";
import { formatPrice } from "@/lib/menu-data";
import { orderAPI, customerAPI } from "@/lib/api";

interface Order {
  id: string;
  table_id: string;
  table_number: number;
  status: "pending" | "accepted" | "preparing" | "ready" | "served" | "paid";
  total_amount: number;
  created_at: string;
  items: Array<{
    id: string;
    name?: string; // from customerAPI
    item_name?: string; // from tableAPI
    quantity: number;
    price: number;
    total_price: number;
  }>;
}

const statusConfig = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-warning text-warning-foreground",
    icon: Clock,
  },
  accepted: {
    label: "Đã xác nhận",
    color: "bg-info text-info-foreground",
    icon: CheckCircle,
  },
  preparing: {
    label: "Đang nấu",
    color: "bg-primary text-primary-foreground",
    icon: ChefHat,
  },
  ready: {
    label: "Sẵn sàng",
    color: "bg-success text-success-foreground",
    icon: Bell,
  },
  served: {
    label: "Đã phục vụ",
    color: "bg-accent text-accent-foreground",
    icon: CheckCircle,
  },
  paid: {
    label: "Đã thanh toán",
    color: "bg-muted text-muted-foreground",
    icon: CreditCard,
  },
};

export default function ActiveOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableId, setTableId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let data: any[] = [];

      // Nếu đã đăng nhập, lấy đơn hàng theo customer
      if (isLoggedIn) {
        const customerOrders = await customerAPI.getOrders();
        // Filter to show only active orders (not paid)
        data = (customerOrders.orders || []).filter(
          (order: any) => order.status !== "paid"
        );
      }
      // Nếu chưa đăng nhập, lấy đơn hàng theo bàn
      else if (tableId) {
        const tableOrders = await orderAPI.getTableOrders(tableId);
        data = (tableOrders || []).filter(
          (order: any) => order.status !== "paid"
        );
      }

      setOrders(data as Order[]);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check login status
    const token = localStorage.getItem("customerToken");
    setIsLoggedIn(!!token);

    // Get table ID from guest_table storage
    const guestTable = localStorage.getItem("guest_table");
    if (guestTable) {
      try {
        const parsed = JSON.parse(guestTable);
        setTableId(parsed.tableId || null);
      } catch {
        setTableId(null);
      }
    }
  }, []);

  useEffect(() => {
    // Fetch when login status or tableId changes
    if (isLoggedIn || tableId) {
      fetchOrders();
      // Poll for updates every 10 seconds
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    } else {
      setIsLoading(false);
    }
  }, [tableId, isLoggedIn]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <h1 className="text-lg font-bold text-card-foreground">
          Đơn hàng của bạn
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchOrders}
          disabled={isLoading}
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">Làm mới</span>
        </Button>
      </header>

      <main className="p-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Chưa có đơn hàng
            </h2>
            <p className="mt-2 text-muted-foreground">
              Đặt món ngay để bắt đầu
            </p>
            <Button className="mt-6" onClick={() => router.push("/menu/guest")}>
              Xem Menu
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-lg border border-border bg-card"
                  onClick={() => router.push(`/guest/orders/${order.id}`)}
                >
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-card-foreground">
                          #{order.id.slice(-6)}
                        </span>
                      </div>
                      <Badge className={config.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Timer className="h-4 w-4" />
                      {formatTime(order.created_at)}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Bàn {order.table_number}</span>
                    </div>

                    <div className="mb-3 space-y-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-card-foreground">
                            {item.quantity}x {item.name || item.item_name}
                          </span>
                          <span className="text-muted-foreground">
                            {formatPrice(item.total_price || item.price)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{order.items.length - 3} món khác
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <span className="font-medium text-card-foreground">
                        Tổng cộng
                      </span>
                      <span className="font-bold text-primary">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/guest/orders/${order.id}`);
                      }}
                    >
                      Xem Chi Tiết
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNavigation onCartClick={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
