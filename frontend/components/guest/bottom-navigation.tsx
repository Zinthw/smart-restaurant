"use client"

import { Home, ShoppingCart, ClipboardList, CreditCard } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"

interface BottomNavigationProps {
  onCartClick?: () => void
}

export function BottomNavigation({ onCartClick }: BottomNavigationProps) {
  const pathname = usePathname()
  const { itemCount } = useCart()

  const navItems = [
    { href: "/menu/guest", icon: Home, label: "Menu", isCart: false },
    { href: "#", icon: ShoppingCart, label: "Giỏ hàng", isCart: true },
    { href: "/guest/active-orders", icon: ClipboardList, label: "Đơn hàng", isCart: false },
    { href: "/guest/pending-payment", icon: CreditCard, label: "Thanh toán", isCart: false },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.href !== "#" && pathname === item.href
          const Icon = item.icon

          if (item.isCart) {
            return (
              <button
                key={item.label}
                onClick={onCartClick}
                className="relative flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-xs">{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
