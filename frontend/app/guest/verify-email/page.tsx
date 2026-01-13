"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Token xác thực không hợp lệ")
      return
    }

    // Verify email token
    const verifyEmail = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
        const response = await fetch(
          `${API_URL}/auth/verify-email?token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage(data.message || "Xác thực tài khoản thành công!")
          
          // Auto redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/guest/login")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(data.message || "Xác thực thất bại")
        }
      } catch (error: any) {
        console.error("Verify email error:", error);
        setStatus("error")
        setMessage(error.message || "Có lỗi xảy ra. Vui lòng thử lại sau.")
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Đang xác thực...</h1>
              <p className="mt-2 text-muted-foreground">Vui lòng chờ trong giây lát</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Xác thực thành công!</h1>
              <p className="mt-2 text-muted-foreground">{message}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Đang chuyển hướng đến trang đăng nhập...
              </p>
            </div>
            <Button onClick={() => router.push("/guest/login")} size="lg" className="w-full">
              Đăng nhập ngay
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Xác thực thất bại</h1>
              <p className="mt-2 text-muted-foreground">{message}</p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => router.push("/guest/register")} size="lg" className="w-full">
                Đăng ký lại
              </Button>
              <Link href="/guest/login" className="block text-sm text-primary hover:underline">
                Quay lại trang đăng nhập
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
