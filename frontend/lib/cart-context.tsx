"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { MenuItem, ModifierOption } from "./menu-data"

export interface CartItem {
  id: string
  menuItem: MenuItem
  quantity: number
  selectedModifiers: ModifierOption[]
  notes?: string
  totalPrice: number
}

interface CartState {
  items: CartItem[]
  tableId: string | null
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "id"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_TABLE"; payload: string }

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const newItem: CartItem = {
        ...action.payload,
        id: generateId(),
      }
      return {
        ...state,
        items: [...state.items, newItem],
      }
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
        ),
      }
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      }
    case "SET_TABLE":
      return {
        ...state,
        tableId: action.payload,
      }
    default:
      return state
  }
}

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  itemCount: number
  subtotal: number
} | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    tableId: null,
  })

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = state.items.reduce((sum, item) => {
    const price = typeof item.totalPrice === 'number' ? item.totalPrice : parseFloat(item.totalPrice || 0)
    const qty = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || 0)
    return sum + (isNaN(price) || isNaN(qty) ? 0 : price * qty)
  }, 0)

  return <CartContext.Provider value={{ state, dispatch, itemCount, subtotal }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
