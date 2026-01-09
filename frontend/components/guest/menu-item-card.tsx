"use client"

import { Plus, Star } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { MenuItem } from "@/lib/menu-data"
import { formatPrice } from "@/lib/menu-data"

interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: () => void
  onClick: () => void
}

export function MenuItemCard({ item, onAddToCart, onClick }: MenuItemCardProps) {
  return (
    <Card className="group relative cursor-pointer overflow-hidden transition-all hover:shadow-lg" onClick={onClick}>
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="rounded-full bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground">
              Hết món
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 font-semibold text-card-foreground">{item.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        <div className="mt-2 flex items-center gap-1">
          <Star className="h-3 w-3 fill-warning text-warning" />
          <span className="text-xs font-medium text-card-foreground">{item.rating}</span>
          <span className="text-xs text-muted-foreground">({item.reviews})</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold text-primary">{formatPrice(item.price)}</span>
          <Button
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart()
            }}
            disabled={!item.isAvailable}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Thêm vào giỏ</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
