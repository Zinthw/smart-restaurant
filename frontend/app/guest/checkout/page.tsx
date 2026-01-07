"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Gift, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/menu-data"

export default function CheckoutPage() {
  const router = useRouter()
  const { state, subtotal, dispatch } = useCart()
  const [tableId, setTableId] = useState<string | null>(null)
  const [customerToken, setCustomerToken] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250)

  useEffect(() => {
    // Get table ID and customer info from localStorage
    const storedTableId = localStorage.getItem("tableId") || "12"
    const storedToken = localStorage.getItem("customerToken")
    const storedName = localStorage.getItem("customerName")

    setTableId(storedTableId)
    setCustomerToken(storedToken)
    if (storedName) setCustomerName(storedName)
  }, [])

  const handlePlaceOrder = async () => {
    if (!customerToken && (!customerName || !customerPhone)) {
      return
    }

    setIsLoading(true)

    // Simulate order creation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate order ID
    const orderId = `ORD${Date.now().toString().slice(-6)}`

    // Store order in localStorage for demo
    const order = {
      id: orderId,
      items: state.items,
      tableId,
      customerName,
      customerPhone,
      notes,
      subtotal,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    localStorage.setItem("orders", JSON.stringify([...existingOrders, order]))

    // Clear cart
    dispatch({ type: "CLEAR_CART" })

    setIsLoading(false)
    router.push(`/guest/orders/${orderId}`)
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-card-foreground">Đặt món</h1>
        </header>
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <span className="text-4xl">🛒</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Giỏ hàng trống</h2>
          <p className="mt-2 text-muted-foreground">Hãy thêm món ăn vào giỏ hàng trước khi đặt</p>
          <Button className="mt-6" onClick={() => router.push("/menu/guest")}>
            Xem Menu
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Quay lại</span>
        </Button>
        <h1 className="text-lg font-bold text-card-foreground">Đặt món</h1>
      </header>

      <main className="mx-auto max-w-lg p-4">
        {/* Table Info */}
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-card-foreground">Bàn {tableId}</p>
            <p className="text-sm text-muted-foreground">Smart Restaurant</p>
          </div>
        </div>

        {/* Customer Info (if not logged in) */}
        {!customerToken && (
          <div className="mb-4 rounded-lg border border-border bg-card p-4">
            <h3 className="mb-4 font-semibold text-card-foreground">Thông tin khách hàng</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ tên</Label>
                <Input
                  id="name"
                  placeholder="Nhập họ tên"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Loyalty Points (if logged in) */}
        {customerToken && (
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-card-foreground">Điểm tích lũy</p>
                <p className="text-sm text-muted-foreground">{loyaltyPoints.toLocaleString()} điểm</p>
              </div>
              <Button variant="outline" size="sm">
                Đổi điểm
              </Button>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="mb-4 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="font-semibold text-card-foreground">Món đã chọn ({state.items.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {state.items.map((item) => (
              <div key={item.id} className="flex gap-3 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.menuItem.image || "/placeholder.svg"}
                    alt={item.menuItem.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-card-foreground">{item.menuItem.name}</h4>
                      {item.selectedModifiers.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {item.selectedModifiers.map((m) => m.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                  </div>
                  <p className="mt-1 font-medium text-primary">{formatPrice(item.totalPrice * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Notes */}
        <div className="mb-4 rounded-lg border border-border bg-card p-4">
          <Label htmlFor="notes" className="mb-2 block font-semibold text-card-foreground">
            Ghi chú đơn hàng
          </Label>
          <Textarea
            id="notes"
            placeholder="Ví dụ: Không cay, ít đường..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </main>

      {/* Fixed Bottom Summary */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-4">
        <div className="mx-auto max-w-lg">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-muted-foreground">Tổng cộng</span>
            <span className="text-xl font-bold text-primary">{formatPrice(subtotal)}</span>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handlePlaceOrder}
            disabled={isLoading || (!customerToken && (!customerName || !customerPhone))}
          >
            {isLoading ? "Đang đặt món..." : "Đặt món"}
          </Button>
        </div>
      </div>
    </div>
  )
}
