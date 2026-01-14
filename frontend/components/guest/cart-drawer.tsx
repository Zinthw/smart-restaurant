"use client"

import { Minus, Plus, Trash2, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/menu-data"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter()
  const { state, dispatch, subtotal } = useCart()

  const handleCheckout = () => {
    onClose()
    router.push("/guest/checkout")
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-card shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-bold text-card-foreground">Giỏ hàng của bạn</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Đóng</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-card-foreground">Giỏ hàng trống</h3>
              <p className="mt-1 text-sm text-muted-foreground">Hãy thêm món ăn vào giỏ hàng của bạn</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-lg border border-border bg-card p-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={item.menuItem.image || "/placeholder.svg"}
                      alt={item.menuItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-card-foreground">{item.menuItem.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Giá gốc: {formatPrice(item.menuItem.price)}
                        </p>
                        {item.selectedModifiers.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {item.selectedModifiers.map((m) => {
                              const price = typeof m.price === 'number' ? m.price : parseFloat(m.price || 0);
                              return `${m.name} (+${formatPrice(isNaN(price) ? 0 : price)})`;
                            }).join(", ")}
                          </p>
                        )}
                        {item.notes && <p className="text-xs italic text-muted-foreground">{item.notes}</p>}
                      </div>
                      <button
                        onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Xóa</span>
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() =>
                            dispatch({
                              type: "UPDATE_QUANTITY",
                              payload: {
                                id: item.id,
                                quantity: Math.max(1, item.quantity - 1),
                              },
                            })
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          onClick={() => {
                            console.log('Cart item:', item.menuItem.name, 'totalPrice:', item.totalPrice, 'quantity:', item.quantity, 'display:', item.totalPrice * item.quantity);
                            dispatch({
                              type: "UPDATE_QUANTITY",
                              payload: {
                                id: item.id,
                                quantity: item.quantity + 1,
                              },
                            });
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-medium text-primary">{formatPrice(item.totalPrice * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {state.items.length > 0 && (
          <div className="border-t border-border p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-muted-foreground">Tạm tính</span>
              <span className="text-lg font-bold text-card-foreground">{formatPrice(subtotal)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={handleCheckout}>
              Đặt món ({state.items.length} món)
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
