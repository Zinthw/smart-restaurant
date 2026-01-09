"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Clock, CheckCircle, ChefHat, Bell, Sparkles, CreditCard, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/menu-data"
import { orderAPI } from "@/lib/api"

interface Order {
  id: string
  table_id: string
  status: "pending" | "accepted" | "preparing" | "ready" | "served" | "paid"
  total_amount: number
  created_at: string
  notes?: string
  items: Array<{
    id: string
    item_name: string
    quantity: number
    price_per_unit: number
    total_price: number
    modifiers_selected?: any
  }>
}

const statusSteps = [
  { key: "pending", label: "Chờ xác nhận", icon: Clock },
  { key: "accepted", label: "Đã xác nhận", icon: CheckCircle },
  { key: "preparing", label: "Đang nấu", icon: ChefHat },
  { key: "ready", label: "Sẵn sàng", icon: Bell },
  { key: "served", label: "Đã phục vụ", icon: Sparkles },
  { key: "paid", label: "Đã thanh toán", icon: CreditCard },
]

export default function OrderStatusPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchOrder = async () => {
    try {
      const data = await orderAPI.getOrder(orderId)
      setOrder(data as Order)
    } catch (error) {
      console.error("Failed to fetch order:", error)
      setOrder(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchOrder, 5000)
    return () => clearInterval(interval)
  }, [orderId])

  const getCurrentStepIndex = () => {
    if (!order) return 0
    return statusSteps.findIndex((step) => step.key === order.status)
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-card-foreground">Chi tiết đơn hàng</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-muted-foreground">Không tìm thấy đơn hàng</p>
          <Button className="mt-4" onClick={() => router.push("/guest/active-orders")}>
            Quay lại
          </Button>
        </div>
      </div>
    )
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/guest/active-orders")}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Quay lại</span>
        </Button>
        <h1 className="text-lg font-bold text-card-foreground">Chi tiết đơn hàng</h1>
      </header>

      <main className="mx-auto max-w-lg p-4">
        {/* Status Timeline */}
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <h3 className="mb-4 font-semibold text-card-foreground">Trạng thái đơn hàng</h3>
          <div className="relative">
            {statusSteps.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = index <= currentStepIndex
              const isCurrent = index === currentStepIndex

              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isCompleted
                          ? isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`h-8 w-0.5 ${index < currentStepIndex ? "bg-success" : "bg-muted"}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p
                      className={`font-medium ${
                        isCompleted ? (isCurrent ? "text-primary" : "text-card-foreground") : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.key === "ready" && "Món ăn đã sẵn sàng, nhân viên sẽ mang đến bàn của bạn"}
                        {step.key === "preparing" && "Đầu bếp đang chuẩn bị món ăn của bạn"}
                        {step.key === "pending" && "Đơn hàng đang chờ nhà bếp xác nhận"}
                        {step.key === "accepted" && "Đơn hàng đã được nhận, đang chuẩn bị"}
                        {step.key === "served" && "Món ăn đã được phục vụ, chúc ngon miệng!"}
                        {step.key === "paid" && "Cảm ơn bạn đã sử dụng dịch vụ"}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="font-semibold text-card-foreground">Món đã đặt ({order.items.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-3 p-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  <span className="text-2xl">🍽️</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-card-foreground">{item.item_name}</h4>
                      {item.modifiers_selected && (
                        <p className="text-xs text-muted-foreground">
                          {typeof item.modifiers_selected === 'string'
                            ? item.modifiers_selected
                            : Array.isArray(item.modifiers_selected)
                              ? item.modifiers_selected.map((m: any) => m.name).join(", ")
                              : ""}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                  </div>
                  <p className="mt-1 font-medium text-primary">{formatPrice(item.total_price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-card-foreground">Tổng cộng</span>
            <span className="text-xl font-bold text-primary">{formatPrice(order.total_amount)}</span>
          </div>
        </div>

        {/* Order Info */}
        <div className="rounded-lg border border-border bg-card p-4 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Mã đơn hàng</span>
            <span className="font-mono font-medium text-card-foreground">#{order.id.slice(-6)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Bàn</span>
            <span className="font-medium text-card-foreground">{order.table_id}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Thời gian</span>
            <span className="font-medium text-card-foreground">
              {new Date(order.created_at).toLocaleString("vi-VN")}
            </span>
          </div>
          {order.notes && (
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Ghi chú</span>
              <span className="text-right font-medium text-card-foreground">{order.notes}</span>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-4">
        <div className="mx-auto max-w-lg">
          <Button className="w-full" size="lg" onClick={() => router.push("/menu/guest")}>
            <Plus className="mr-2 h-4 w-4" />
            Gọi thêm món
          </Button>
        </div>
      </div>
    </div>
  )
}
