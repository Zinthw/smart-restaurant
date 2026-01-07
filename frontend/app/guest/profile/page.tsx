"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Award, ChevronRight, Gift, History, LogOut, Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/guest/bottom-navigation"

const tierBenefits = [
  { tier: "Bronze", points: 0, discount: "5%", freeItem: false },
  { tier: "Silver", points: 1000, discount: "10%", freeItem: false },
  { tier: "Gold", points: 5000, discount: "15%", freeItem: true },
  { tier: "Platinum", points: 10000, discount: "20%", freeItem: true },
]

export default function GuestProfilePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250)
  const [currentTier, setCurrentTier] = useState("Silver")

  useEffect(() => {
    const token = localStorage.getItem("customerToken")
    const name = localStorage.getItem("customerName")

    if (token) {
      setIsLoggedIn(true)
      setCustomerName(name || "Khách hàng")
      setCustomerEmail("customer@example.com")
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("customerToken")
    localStorage.removeItem("customerName")
    router.push("/guest/login")
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-card-foreground">Hồ sơ</h1>
        </header>

        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Đăng nhập để xem hồ sơ</h2>
          <p className="mt-2 text-muted-foreground">Tích điểm và nhận ưu đãi khi đăng nhập</p>
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
        <h1 className="text-lg font-bold text-card-foreground">Hồ sơ</h1>
      </header>

      <main className="mx-auto max-w-lg p-4">
        {/* User Info Card */}
        <div className="mb-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-card-foreground">{customerName}</h2>
              <p className="text-sm text-muted-foreground">{customerEmail}</p>
            </div>
          </div>
        </div>

        {/* Loyalty Card */}
        <div className="mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary/80 p-4 text-primary-foreground">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span className="font-semibold">{currentTier}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4" />
            </div>
          </div>

          <div className="mb-2">
            <p className="text-sm opacity-80">Điểm tích lũy</p>
            <p className="text-3xl font-bold">{loyaltyPoints.toLocaleString()}</p>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-primary-foreground/20">
            <div className="h-full bg-primary-foreground/60" style={{ width: `${(loyaltyPoints / 5000) * 100}%` }} />
          </div>
          <p className="mt-1 text-xs opacity-80">Còn {(5000 - loyaltyPoints).toLocaleString()} điểm để lên Gold</p>
        </div>

        {/* Tier Benefits */}
        <div className="mb-4 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="font-semibold text-card-foreground">Ưu đãi thành viên</h3>
          </div>
          <div className="divide-y divide-border">
            {tierBenefits.map((tier) => (
              <div
                key={tier.tier}
                className={`flex items-center justify-between p-4 ${tier.tier === currentTier ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      tier.tier === currentTier ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`font-medium ${tier.tier === currentTier ? "text-primary" : "text-card-foreground"}`}>
                      {tier.tier}
                    </p>
                    <p className="text-xs text-muted-foreground">{tier.points.toLocaleString()}+ điểm</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-card-foreground">Giảm {tier.discount}</p>
                  {tier.freeItem && <p className="text-xs text-muted-foreground">+ Món miễn phí</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-between bg-transparent"
            onClick={() => router.push("/guest/history")}
          >
            <span className="flex items-center gap-3">
              <History className="h-5 w-5" />
              Lịch sử đơn hàng
            </span>
            <ChevronRight className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between bg-transparent"
            onClick={() => router.push("/guest/rewards")}
          >
            <span className="flex items-center gap-3">
              <Gift className="h-5 w-5" />
              Đổi điểm thưởng
            </span>
            <ChevronRight className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between text-destructive hover:text-destructive bg-transparent"
            onClick={handleLogout}
          >
            <span className="flex items-center gap-3">
              <LogOut className="h-5 w-5" />
              Đăng xuất
            </span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
