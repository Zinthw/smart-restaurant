"use client";

import { useState, useEffect } from "react";
import { Search, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MenuHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  tableId?: string;
}

export function MenuHeader({
  searchQuery,
  onSearchChange,
  tableId,
}: MenuHeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const name = localStorage.getItem("customerName");
    setIsLoggedIn(!!token);
    setCustomerName(name || "");
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-card-foreground">
            Smart Restaurant
          </h1>
          {tableId && (
            <p className="text-xs text-muted-foreground">Bàn {tableId}</p>
          )}
        </div>
        <Link href={isLoggedIn ? "/guest/profile" : "/guest/login"}>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <User className="h-5 w-5" />
            {isLoggedIn && (
              <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />
            )}
            <span className="sr-only">
              {isLoggedIn ? "Hồ sơ" : "Đăng nhập"}
            </span>
          </Button>
        </Link>
      </div>
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm món ăn..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
}
