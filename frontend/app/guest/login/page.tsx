"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { customerAuthAPI } from "@/lib/api";
import { useCart } from "@/lib/cart-context";

export default function GuestLoginPage() {
  const router = useRouter();
  const { dispatch } = useCart();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Clear cart from previous session before logging in new user
      dispatch({ type: "CLEAR_CART" });

      // Call real API
      const response = await customerAuthAPI.login(email, password);

      // Store customer token and info
      localStorage.setItem(
        "customerToken",
        response.token || response.accessToken
      );
      localStorage.setItem("customerName", response.customer.fullName);
      localStorage.setItem("customerId", response.customer.id);
      localStorage.setItem("customerInfo", JSON.stringify(response.customer));

      router.push("/menu/guest");
    } catch (err: any) {
      setError(
        err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // In production, this would initiate OAuth flow
    // For now, redirect to menu as guest
    router.push("/menu/guest");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Quay lại</span>
          </Button>
        </Link>
        <h1 className="text-lg font-bold text-card-foreground">Đăng nhập</h1>
        <span className="text-sm text-muted-foreground ml-auto">
          <Link href="/" className="hover:underline">Chọn role khác</Link>
        </span>
      </header>

      <main className="mx-auto max-w-md p-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-3xl">🍽️</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Chào mừng trở lại!
          </h2>
          <p className="mt-2 text-muted-foreground">
            Đăng nhập để tích điểm và theo dõi đơn hàng
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Ghi nhớ đăng nhập
              </Label>
            </div>
            <Link
              href="/guest/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-sm text-muted-foreground">
              hoặc
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent"
          size="lg"
          onClick={handleGoogleLogin}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Đăng nhập với Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link
            href="/guest/register"
            className="font-medium text-primary hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </main>
    </div>
  );
}
