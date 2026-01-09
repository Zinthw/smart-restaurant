"use client";

import { useState, useMemo, useEffect } from "react";
import { BottomNavigation } from "@/components/guest/bottom-navigation";
import { CartDrawer } from "@/components/guest/cart-drawer";
import { CategoryTabs } from "@/components/guest/category-tabs";
import { ItemDetailModal } from "@/components/guest/item-detail-modal";
import { MenuHeader } from "@/components/guest/menu-header";
import { MenuItemCard } from "@/components/guest/menu-item-card";
import { useCart } from "@/lib/cart-context";
import {
  type MenuItem,
  type ModifierOption,
  type Category,
} from "@/lib/menu-data";
import { menuAPI, getImageUrl } from "@/lib/api";

export default function GuestMenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tableNumber, setTableNumber] = useState<string>("");

  const { dispatch } = useCart();

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Get table info from localStorage (saved when scanning QR)
      const tableFromStorage = localStorage.getItem("guest_table");

      if (tableFromStorage) {
        try {
          const parsed = JSON.parse(tableFromStorage);
          // Ưu tiên tableNumber (số bàn thực tế), fallback sang tableId
          setTableNumber(parsed.tableNumber || parsed.tableId || "");
        } catch {
          setTableNumber("");
        }
      }

      // Fetch categories
      const categoriesRes = await menuAPI.getCategories();
      if (categoriesRes.data && categoriesRes.data.length > 0) {
        const apiCategories: Category[] = [
          { id: "all", name: "Tất cả", icon: "🍽️" },
          ...categoriesRes.data.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon || "🍴",
          })),
        ];
        setCategories(apiCategories);
      }

      // Fetch menu items
      const itemsRes = await menuAPI.getItems();
      if (itemsRes.data && itemsRes.data.length > 0) {
        const apiItems: MenuItem[] = itemsRes.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: item.price,
          image: getImageUrl(item.primary_photo),
          category: item.category_id || item.category,
          rating: item.rating || 4.5,
          reviews: item.reviews || 0,
          isAvailable:
            item.is_available !== false && item.status !== "sold_out",
          modifiers: item.modifiers || [],
        }));
        setMenuItems(apiItems);
      }
    } catch (err: any) {
      console.error("API Error:", err);
      setError(
        err.message || "Không thể tải menu. Vui lòng kiểm tra kết nối mạng."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, activeCategory]);

  const handleQuickAdd = (item: MenuItem) => {
    if (item.modifiers && item.modifiers.length > 0) {
      setSelectedItem(item);
      setIsDetailOpen(true);
    } else {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          menuItem: item,
          quantity: 1,
          selectedModifiers: [],
          totalPrice: item.price,
        },
      });
    }
  };

  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    modifiers: ModifierOption[],
    notes: string
  ) => {
    const modifierTotal = modifiers.reduce((acc, mod) => acc + mod.price, 0);
    dispatch({
      type: "ADD_ITEM",
      payload: {
        menuItem: item,
        quantity,
        selectedModifiers: modifiers,
        notes,
        totalPrice: item.price + modifierTotal,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MenuHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tableId={tableNumber}
      />

      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Đang tải menu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-destructive text-4xl">❌</div>
            <p className="text-destructive font-medium mb-2">Lỗi tải dữ liệu</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Thử lại
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Không tìm thấy món ăn phù hợp
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAddToCart={() => handleQuickAdd(item)}
                onClick={() => {
                  setSelectedItem(item);
                  setIsDetailOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNavigation onCartClick={() => setIsCartOpen(true)} />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <ItemDetailModal
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedItem(null);
        }}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
