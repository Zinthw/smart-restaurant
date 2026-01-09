"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/menu-data"

interface CategoryTabsProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const activeButton = activeRef.current
      const containerRect = container.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()

      const scrollLeft =
        buttonRect.left - containerRect.left - containerRect.width / 2 + buttonRect.width / 2 + container.scrollLeft

      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      })
    }
  }, [activeCategory])

  return (
    <div className="sticky top-[60px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id
          return (
            <button
              key={category.id}
              ref={isActive ? activeRef : null}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
