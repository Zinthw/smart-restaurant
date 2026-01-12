"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.3:4000/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Link không hợp lệ. Vui lòng yêu cầu link mới.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Có lỗi xảy ra");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
          <h1 className="text-lg font-bold text-card-foreground">
            Đặt lại mật khẩu
          </h1>
        </header>

        <main className="mx-auto max-w-md p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-success/10 p-4">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Đặt lại mật khẩu thành công!
            </h2>
            <p className="mt-2 text-muted-foreground">
              Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push("/guest/login")}
            >
              Đăng nhập ngay
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Invalid token state
  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/guest/login")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-card-foreground">
            Đặt lại mật khẩu
          </h1>
        </header>

        <main className="mx-auto max-w-md p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-4">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Link không hợp lệ
            </h2>
            <p className="mt-2 text-muted-foreground">
              Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push("/guest/forgot-password")}
            >
              Yêu cầu link mới
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/guest/login")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold text-card-foreground">
          Đặt lại mật khẩu
        </h1>
      </header>

      <main className="mx-auto max-w-md p-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Tạo mật khẩu mới
          </h2>
          <p className="mt-2 text-muted-foreground">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ít nhất 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Nhớ mật khẩu rồi?{" "}
          <Link
            href="/guest/login"
            className="font-medium text-primary hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </main>
    </div>
  );
}
