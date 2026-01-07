"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authAPI } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  // Load saved email if remember me was checked before
  useEffect(() => {
    const savedEmail = localStorage.getItem("admin_saved_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Check if already logged in
    const token = localStorage.getItem("admin_token");
    if (token) {
      // Verify token is still valid
      authAPI
        .verifyToken()
        .then((res) => {
          if (res.valid) {
            const role = res.user.role;
            if (role === "kitchen") {
              router.replace("/kitchen");
            } else if (role === "waiter") {
              router.replace("/waiter/orders");
            } else {
              router.replace("/admin/dashboard");
            }
          } else {
            localStorage.removeItem("admin_token");
            setIsCheckingAuth(false);
          }
        })
        .catch(() => {
          // Token invalid, clear it
          localStorage.removeItem("admin_token");
          setIsCheckingAuth(false);
        });
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Call real API
      const response = await authAPI.login(email, password);

      localStorage.setItem("admin_token", response.token);
      localStorage.setItem(
        "adminName",
        response.user.name || response.user.email
      );
      localStorage.setItem("adminRole", response.user.role);
      localStorage.setItem("role", response.user.role);

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem("admin_saved_email", email);
      } else {
        localStorage.removeItem("admin_saved_email");
      }

      // Redirect based on role
      const role = response.user.role;
      if (role === "kitchen") {
        router.replace("/kitchen");
      } else if (role === "waiter") {
        router.replace("/waiter/orders");
      } else {
        router.replace("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Email hoặc mật khẩu không đúng");
    }

    setIsLoading(false);
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Đang kiểm tra phiên đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <ChefHat className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Smart Restaurant
          </h1>
          <p className="mt-2 text-muted-foreground">
            Hệ thống quản lý nhà hàng
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-card-foreground">
            Đăng nhập vào hệ thống
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@restaurant.com"
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
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <Link
                href="/admin/forgot-password"
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
        </div>
      </div>
    </div>
  );
}
