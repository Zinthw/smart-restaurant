"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { qrAPI } from "@/lib/api"

export default function MenuRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")

  useEffect(() => {
    const tableId = searchParams.get("table")
    const token = searchParams.get("token")

    if (!tableId || !token) {
      // No QR params, just redirect to menu
      router.replace("/menu/guest")
      return
    }

    // Verify QR token with backend
    const verifyQR = async () => {
      try {
        const result = await qrAPI.verify(tableId, token)
        
        if (result.valid) {
          // Store table info in localStorage for guest ordering
          localStorage.setItem("guest_table", JSON.stringify({
            tableId: tableId,
            tableNumber: result.table?.number || tableId,
            verifiedAt: new Date().toISOString()
          }))
          localStorage.setItem("tableId", tableId)
          
          // Redirect to guest menu
          router.replace("/menu/guest")
        } else {
          setError("Mã QR không hợp lệ hoặc đã hết hạn")
        }
      } catch (err: any) {
        console.error("QR verification failed:", err)
        setError(err.message || "Không thể xác thực mã QR. Vui lòng thử lại.")
      }
    }

    verifyQR()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-4">
          <span className="text-4xl">❌</span>
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Lỗi xác thực</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => router.push("/menu/guest")}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
        >
          Về Menu
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Đang xác thực bàn...</p>
    </div>
  )
}
