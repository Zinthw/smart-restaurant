"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Printer, Star, Home, Gift, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/menu-data"
import { paymentAPI, orderAPI } from "@/lib/api"

interface Receipt {
  restaurant: string
  address: string
  orderId: string
  date: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
}

interface Order {
  id: string
  table_id: string
  status: string
  total_amount: number
  created_at: string
}

export default function PaymentSuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const router = useRouter()
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [loyaltyPoints, setLoyaltyPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get order details
        const orderData = await orderAPI.getOrder(orderId)
        setOrder(orderData as Order)

        // Try to get receipt (may fail if order wasn't paid yet)
        try {
          const receiptData = await paymentAPI.getReceipt(orderId)
          setReceipt(receiptData)
        } catch {
          // Receipt not available, use order data instead
        }

        // Calculate loyalty points (1 point per 10,000 VND)
        const points = Math.floor(orderData.total_amount / 10000)
        setLoyaltyPoints(points)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [orderId])

  const handlePrint = () => {
    window.print()
  }

  // Calculate tax and total from receipt or order
  const subtotal = receipt?.total || order?.total_amount || 0
  const tax = subtotal * 0.1
  const total = subtotal + tax

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-md p-6">
        {/* Success Animation */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Thanh toán thành công!</h1>
          <p className="mt-2 text-muted-foreground">Cảm ơn bạn đã sử dụng dịch vụ</p>
        </div>

        {/* Receipt */}
        <div className="mb-6 rounded-lg border border-border bg-card print:border-0 print:shadow-none" id="receipt">
          <div className="border-b border-border p-4 text-center print:border-dashed">
            <h2 className="text-lg font-bold text-card-foreground">Smart Restaurant</h2>
            <p className="text-sm text-muted-foreground">123 Đường ABC, Quận 1, TP.HCM</p>
            <p className="text-sm text-muted-foreground">ĐT: 028 1234 5678</p>
          </div>

          <div className="border-b border-border p-4 print:border-dashed">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mã đơn:</span>
              <span className="font-mono font-medium text-card-foreground">
                #{receipt?.orderId?.slice(-6) || order?.id.slice(-6)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bàn:</span>
              <span className="font-medium text-card-foreground">{order?.table_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Thời gian:</span>
              <span className="font-medium text-card-foreground">
                {receipt?.date || (order && new Date(order.created_at).toLocaleString("vi-VN"))}
              </span>
            </div>
          </div>

          <div className="border-b border-border p-4 print:border-dashed">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-muted-foreground">Món</th>
                  <th className="pb-2 text-center text-muted-foreground">SL</th>
                  <th className="pb-2 text-right text-muted-foreground">Giá</th>
                </tr>
              </thead>
              <tbody>
                {receipt?.items.map((item: { name: string; quantity: number; price: number }, index: number) => (
                  <tr key={index}>
                    <td className="py-1 text-card-foreground">{item.name}</td>
                    <td className="py-1 text-center text-card-foreground">{item.quantity}</td>
                    <td className="py-1 text-right text-card-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span className="text-card-foreground">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">VAT (10%)</span>
              <span className="text-card-foreground">{formatPrice(tax)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-2">
              <span className="font-bold text-card-foreground">Tổng cộng</span>
              <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Loyalty Points Earned */}
        {loyaltyPoints > 0 && (
          <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">Bạn đã tích được</p>
                <p className="text-lg font-bold text-primary">+{loyaltyPoints} điểm</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 print:hidden">
          <Button variant="outline" className="w-full bg-transparent" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            In hóa đơn
          </Button>

          <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/guest/review")}>
            <Star className="mr-2 h-4 w-4" />
            Đánh giá món ăn
          </Button>

          <Button className="w-full" onClick={() => router.push("/menu/guest")}>
            <Home className="mr-2 h-4 w-4" />
            Về Menu
          </Button>
        </div>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt,
          #receipt * {
            visibility: visible;
          }
          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
          }
        }
      `}</style>
    </div>
  )
}
