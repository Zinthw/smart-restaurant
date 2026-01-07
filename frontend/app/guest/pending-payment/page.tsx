"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Banknote, Building2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/guest/bottom-navigation"
import { CartDrawer } from "@/components/guest/cart-drawer"
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
}

type PaymentMethod = "cash" | "card" | "transfer"

const paymentMethods = [
  { id: "cash" as const, label: "Tiền mặt", icon: Banknote, description: "Thanh toán tại quầy" },
  { id: "card" as const, label: "Thẻ ngân hàng", icon: CreditCard, description: "Visa, Mastercard, JCB" },
  { id: "transfer" as const, label: "Chuyển khoản", icon: Building2, description: "QR Code ngân hàng" },
]

export default function PendingPaymentPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash")
  const [isLoading, setIsLoading] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    // Get orders from localStorage - filter to served but unpaid orders
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    const servedOrders = storedOrders.filter((order: Order) => order.status === "served")
    setOrders(servedOrders)
  }, [])

  const grandTotal = orders.reduce((sum, order) => sum + order.subtotal, 0)

  const handlePayment = async () => {
    if (orders.length === 0) return

    setIsLoading(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Update orders to paid status
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    const updatedOrders = storedOrders.map((order: Order) =>
      orders.find((o) => o.id === order.id) ? { ...order, status: "paid", paidAt: new Date().toISOString() } : order,
    )
    localStorage.setItem("orders", JSON.stringify(updatedOrders))

    setIsLoading(false)
    router.push(`/guest/payment/${orders[0].id}`)
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="sticky top-0 z-50 border-b border-border bg-card px-4 py-3">
        <h1 className="text-lg font-bold text-card-foreground">Thanh toán</h1>
      </header>

      <main className="mx-auto max-w-lg p-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Chưa có đơn cần thanh toán</h2>
            <p className="mt-2 text-muted-foreground">Các đơn hàng đã phục vụ sẽ hiện ở đây</p>
            <Button className="mt-6" onClick={() => router.push("/guest/active-orders")}>
              Xem Đơn Hàng
            </Button>
          </div>
        ) : (
          <>
            {/* Orders Summary */}
            <div className="mb-4 rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h3 className="font-semibold text-card-foreground">Đơn hàng cần thanh toán ({orders.length})</h3>
              </div>
              <div className="divide-y divide-border">
                {orders.map((order) => (
                  <div key={order.id} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-sm font-medium text-card-foreground">#{order.id.slice(-6)}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="mb-2 space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="text-sm text-muted-foreground">Tạm tính</span>
                      <span className="font-medium text-card-foreground">{formatPrice(order.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4 rounded-lg border border-border bg-card p-4">
              <h3 className="mb-4 font-semibold text-card-foreground">Phương thức thanh toán</h3>
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const isSelected = selectedMethod === method.id

                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-4 transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${isSelected ? "text-primary" : "text-card-foreground"}`}>
                          {method.label}
                        </p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      {isSelected && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Fixed Bottom Summary */}
      {orders.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 border-t border-border bg-card p-4">
          <div className="mx-auto max-w-lg">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-muted-foreground">Tổng thanh toán</span>
              <span className="text-2xl font-bold text-primary">{formatPrice(grandTotal)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={handlePayment} disabled={isLoading}>
              {isLoading ? (
                "Đang xử lý..."
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Thanh toán {orders.length} đơn
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <BottomNavigation onCartClick={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
