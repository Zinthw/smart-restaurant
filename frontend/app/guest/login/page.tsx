"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { customerAuthAPI, API_BASE_URL } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function GuestLoginPage() {
  const router = useRouter();
  const { dispatch } = useCart();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Set mounted state on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Google Sign-In success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("kitchenToken");
      localStorage.removeItem("waiterToken");
      localStorage.removeItem("token");

      dispatch({ type: "CLEAR_CART" });

      const idToken = credentialResponse.credential;

      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập Google thất bại");
      }
      
      const token = data.accessToken || data.token;
      // Dùng response.token (backend trả về token key)
      localStorage.setItem("token", token);
      localStorage.setItem("customerToken", token);
      
      if (data.user) {
        localStorage.setItem("customerName", data.user.full_name || data.user.name);
        localStorage.setItem("customerInfo", JSON.stringify(data.user));
      }
      
      router.push("/menu/guest");
    } catch (err: any) {
      setError(err.message || "Đăng nhập Google thất bại");
    }
  };

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
      const user = response.user;
      localStorage.setItem(
        "customerToken",
        response.token
      );
      localStorage.setItem("customerName", user.full_name || user.fullName || "");
      localStorage.setItem("customerId", user.id);
      localStorage.setItem("customerInfo", JSON.stringify(user));

      router.push("/menu/guest");
    } catch (err: any) {
      setError(
        err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  if (!mounted) return null;

  return (
    <GoogleOAuthProvider clientId={clientId}>
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
            <Link href="/" className="hover:underline">
              Chọn role khác
            </Link>
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

          <div className="w-full flex justify-center min-h-[40px]">
             {clientId ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Đăng nhập Google thất bại")}
                  theme="outline"
                  size="large"
                  width="100%"
                  shape="rectangular"
                  text="signin_with"
                />
             ) : (
                <p className="text-red-500 text-sm">Chưa cấu hình Google Client ID</p>
             )}
          </div>

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
    </GoogleOAuthProvider>
  );
}
