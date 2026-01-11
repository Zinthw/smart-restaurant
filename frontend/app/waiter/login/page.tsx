"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function WaiterLoginPage() {
  const router = useRouter();
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

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("waiterToken");
    if (token) {
      router.push("/waiter/orders");
      return;
    }

    // Load remembered credentials
    const savedEmail = localStorage.getItem("waiterRememberEmail");
    const savedRemember = localStorage.getItem("waiterRememberMe") === "true";
    if (savedEmail && savedRemember) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // Check if user is waiter or has permission
      if (
        data.user.role !== "waiter" &&
        data.user.role !== "admin" &&
        data.user.role !== "super_admin"
      ) {
        throw new Error("Bạn không có quyền truy cập trang này");
      }

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("waiterRememberEmail", email);
        localStorage.setItem("waiterRememberMe", "true");
      } else {
        localStorage.removeItem("waiterRememberEmail");
        localStorage.removeItem("waiterRememberMe");
      }

      // Store token and info
      localStorage.setItem("waiterToken", data.token || data.accessToken);
      localStorage.setItem("waiterName", data.user.email.split("@")[0]);
      localStorage.setItem("waiterRole", data.user.role);

      router.push("/waiter/orders");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Chọn role khác
        </Link>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Waiter Portal</h1>
          <p className="mt-2 text-muted-foreground">
            Đăng nhập để quản lý đơn hàng
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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
                placeholder="waiter@restaurant.com"
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Nhớ đăng nhập
                </label>
              </div>
              <Link
                href="/waiter/forgot-password"
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

          <div className="mt-6 rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
            <p className="font-medium">Tài khoản demo:</p>
            <p>Email: waiter1@res.com</p>
            <p>Mật khẩu: 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
