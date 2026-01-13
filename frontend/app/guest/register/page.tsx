"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { customerAuthAPI } from "@/lib/api"

// Helper: Validate Password Strength
function validatePassword(password: string) {
  const checks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
  
  const allValid = Object.values(checks).every(v => v)
  
  return { checks, allValid }
}

export default function GuestRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const passwordValidation = validatePassword(formData.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setError("")

    try {
      // Validate full name
      if (!formData.fullName.trim()) {
        throw new Error("Họ và tên là bắt buộc")
      }
      
      // Validate password strength
      if (!passwordValidation.allValid) {
        throw new Error("Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu bên dưới.")
      }

      // Call real API
      await customerAuthAPI.register({
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        email: formData.email,
        password: formData.password,
      })

      setSuccess(true)
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/guest/login")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Quay lại</span>
        </Button>
        <h1 className="text-lg font-bold text-card-foreground">Đăng ký</h1>
      </header>

      <main className="mx-auto max-w-md p-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Tạo tài khoản mới</h2>
          <p className="mt-2 text-muted-foreground">Đăng ký để nhận ưu đãi và tích điểm</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600">
              ✅ Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Họ và tên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0901234567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Mật khẩu <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mạnh"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setPasswordFocused(true)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {(passwordFocused || formData.password) && (
              <div className="mt-2 space-y-1 rounded-lg border bg-muted/50 p-3 text-xs">
                <p className="font-medium text-foreground">Yêu cầu mật khẩu:</p>
                <div className="space-y-1">
                  <PasswordCheck 
                    valid={passwordValidation.checks.minLength} 
                    label="Ít nhất 8 ký tự" 
                  />
                  <PasswordCheck 
                    valid={passwordValidation.checks.hasUpperCase} 
                    label="Có chữ hoa (A-Z)" 
                  />
                  <PasswordCheck 
                    valid={passwordValidation.checks.hasLowerCase} 
                    label="Có chữ thường (a-z)" 
                  />
                  <PasswordCheck 
                    valid={passwordValidation.checks.hasNumber} 
                    label="Có số (0-9)" 
                  />
                  <PasswordCheck 
                    valid={passwordValidation.checks.hasSpecialChar} 
                    label="Có ký tự đặc biệt (!@#$...)" 
                  />
                </div>
              </div>
            )}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link href="/guest/login" className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </main>
    </div>
  )
}

// Password Check Component
function PasswordCheck({ valid, label }: { valid: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {valid ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span className={valid ? "text-green-600" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  )
}
