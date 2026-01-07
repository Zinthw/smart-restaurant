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
  categories as mockCategories,
  menuItems as mockMenuItems,
  type MenuItem,
  type ModifierOption,
  type Category,
} from "@/lib/menu-data";
import { menuAPI } from "@/lib/api";

export default function GuestMenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Data states
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [loading, setLoading] = useState(true);
  const [tableId, setTableId] = useState<string>("12");

  const { dispatch } = useCart();

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get table info from URL or localStorage
        const params = new URLSearchParams(window.location.search);
        const tableFromUrl = params.get("table");
        const tableFromStorage = localStorage.getItem("guest_table");

        if (tableFromUrl) {
          setTableId(tableFromUrl);
          localStorage.setItem(
            "guest_table",
            JSON.stringify({ tableId: tableFromUrl })
          );
        } else if (tableFromStorage) {
          const parsed = JSON.parse(tableFromStorage);
          setTableId(parsed.tableId || "12");
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
            image: item.image_url || item.image || "/placeholder.svg",
            category: item.category_id || item.category,
            rating: item.rating || 4.5,
            reviews: item.reviews || 0,
            isAvailable: item.is_available !== false,
            modifiers: item.modifiers || [],
          }));
          setMenuItems(apiItems);
        }
      } catch (error) {
        console.log("Using mock data - API not available:", error);
        // Keep using mock data if API fails
      } finally {
        setLoading(false);
      }
    };

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
  }, [searchQuery, activeCategory]);

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
    const modifierTotal = modifiers.reduce((sum, mod) => sum + mod.price, 0);
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
        tableId={tableId}
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
