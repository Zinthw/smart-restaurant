"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BottomNavigation } from "@/components/guest/bottom-navigation"
import { formatPrice } from "@/lib/menu-data"

interface Order {
  id: string
  items: Array<{
    menuItem: { name: string }
    quantity: number
    totalPrice: number
  }>
  tableId: string
  status: string
  subtotal: number
  createdAt: string
  paidAt?: string
}

export default function OrderHistoryPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("customerToken")
    setIsLoggedIn(!!token)

    if (token) {
      // Get all orders from localStorage
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      // Sort by date, newest first
      const sortedOrders = storedOrders.sort(
        (a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      setOrders(sortedOrders)
    }
  }, [])

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-card-foreground">Lịch sử đơn hàng</h1>
        </header>

        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Đăng nhập để xem lịch sử</h2>
          <p className="mt-2 text-muted-foreground">Theo dõi tất cả đơn hàng của bạn</p>
          <Button className="mt-6" onClick={() => router.push("/guest/login")}>
            Đăng nhập
          </Button>
        </div>

        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Quay lại</span>
        </Button>
        <h1 className="text-lg font-bold text-card-foreground">Lịch sử đơn hàng</h1>
      </header>

      <main className="p-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Chưa có đơn hàng</h2>
            <p className="mt-2 text-muted-foreground">Đặt món để bắt đầu</p>
            <Button className="mt-6" onClick={() => router.push("/menu/guest")}>
              Xem Menu
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isPaid = order.status === "paid"
              const pointsEarned = Math.floor(order.subtotal / 10000)

              return (
                <div key={order.id} className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                      <span className="font-mono text-sm font-medium text-card-foreground">#{order.id.slice(-6)}</span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge
                      className={isPaid ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Đã thanh toán
                        </>
                      ) : (
                        <>
                          <Clock className="mr-1 h-3 w-3" />
                          {order.status === "served" ? "Chờ thanh toán" : "Đang xử lý"}
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="p-4">
                    <div className="mb-3 space-y-1">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-sm text-muted-foreground">+{order.items.length - 2} món khác</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <div>
                        <span className="font-bold text-primary">{formatPrice(order.subtotal)}</span>
                        {isPaid && pointsEarned > 0 && <p className="text-xs text-success">+{pointsEarned} điểm</p>}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                        onClick={() => router.push(isPaid ? `/guest/payment/${order.id}` : `/guest/orders/${order.id}`)}
                      >
                        {isPaid ? "Xem hóa đơn" : "Theo dõi"}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
