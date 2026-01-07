"use client"

import { useState } from "react"
import { Minus, Plus, Star, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import type { MenuItem, ModifierOption } from "@/lib/menu-data"
import { formatPrice } from "@/lib/menu-data"

interface ItemDetailModalProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: MenuItem, quantity: number, modifiers: ModifierOption[], notes: string) => void
}

export function ItemDetailModal({ item, isOpen, onClose, onAddToCart }: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedModifiers, setSelectedModifiers] = useState<ModifierOption[]>([])
  const [notes, setNotes] = useState("")

  if (!isOpen || !item) return null

  const modifierTotal = selectedModifiers.reduce((sum, mod) => sum + mod.price, 0)
  const totalPrice = (item.price + modifierTotal) * quantity

  const handleRadioChange = (modifierId: string, optionId: string) => {
    const modifier = item.modifiers?.find((m) => m.id === modifierId)
    if (!modifier) return

    const option = modifier.options.find((o) => o.id === optionId)
    if (!option) return

    setSelectedModifiers((prev) => {
      const filtered = prev.filter((m) => !modifier.options.some((o) => o.id === m.id))
      return [...filtered, option]
    })
  }

  const handleCheckboxChange = (option: ModifierOption, checked: boolean) => {
    setSelectedModifiers((prev) => (checked ? [...prev, option] : prev.filter((m) => m.id !== option.id)))
  }

  const handleAddToCart = () => {
    onAddToCart(item, quantity, selectedModifiers, notes)
    setQuantity(1)
    setSelectedModifiers([])
    setNotes("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card sm:rounded-2xl">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Đóng</span>
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-card-foreground">{item.name}</h2>
              <div className="mt-1 flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-sm font-medium text-card-foreground">{item.rating}</span>
                <span className="text-sm text-muted-foreground">({item.reviews} đánh giá)</span>
              </div>
            </div>
            <span className="text-xl font-bold text-primary">{formatPrice(item.price)}</span>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>

          {item.modifiers?.map((modifier) => (
            <div key={modifier.id} className="mt-4">
              <h3 className="font-medium text-card-foreground">
                {modifier.name}
                {modifier.required && <span className="ml-2 text-xs text-destructive">*Bắt buộc</span>}
              </h3>
              <div className="mt-2 space-y-2">
                {modifier.multiple ? (
                  modifier.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-3">
                      <Checkbox
                        id={option.id}
                        checked={selectedModifiers.some((m) => m.id === option.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                      />
                      <Label htmlFor={option.id} className="flex flex-1 cursor-pointer items-center justify-between">
                        <span>{option.name}</span>
                        {option.price > 0 && (
                          <span className="text-sm text-muted-foreground">+{formatPrice(option.price)}</span>
                        )}
                      </Label>
                    </div>
                  ))
                ) : (
                  <RadioGroup onValueChange={(value) => handleRadioChange(modifier.id, value)}>
                    {modifier.options.map((option) => (
                      <div key={option.id} className="flex items-center gap-3">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="flex flex-1 cursor-pointer items-center justify-between">
                          <span>{option.name}</span>
                          {option.price > 0 && (
                            <span className="text-sm text-muted-foreground">+{formatPrice(option.price)}</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            </div>
          ))}

          <div className="mt-4">
            <h3 className="font-medium text-card-foreground">Ghi chú</h3>
            <Textarea
              placeholder="Ví dụ: Không hành, ít cay..."
              className="mt-2 resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-border px-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button className="flex-1" size="lg" onClick={handleAddToCart} disabled={!item.isAvailable}>
              Thêm - {formatPrice(totalPrice)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
