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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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
        const apiItems: MenuItem[] = itemsRes.data.map((item: any) => {
          const mappedItem = {
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
            modifiers: (item.modifiers || []).map((mod: any) => ({
              ...mod,
              multiple: mod.selection_type === 'multiple',
              required: mod.is_required || false,
              options: (mod.options || []).map((opt: any) => ({
                ...opt,
                price: opt.price_adjustment || opt.price || 0
              }))
            })),
          };
          // Debug log for first item with modifiers
          if (mappedItem.modifiers && mappedItem.modifiers.length > 0 && itemsRes.data.indexOf(item) === 0) {
            console.log('First item with modifiers:', mappedItem.name);
            console.log('Modifiers:', JSON.stringify(mappedItem.modifiers, null, 2));
          }
          return mappedItem;
        });
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

  // Reset page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  // Simple fuzzy search function
  const fuzzyMatch = (text: string, query: string): boolean => {
    if (!query) return true;
    const textLower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    const queryLower = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    
    // Exact match
    if (textLower.includes(queryLower)) return true;
    
    // Fuzzy match: allow 1-2 character differences
    const words = queryLower.split(/\s+/);
    return words.every(word => {
      if (word.length <= 2) return textLower.includes(word);
      
      // Check if word appears with minor typos
      for (let i = 0; i <= textLower.length - word.length; i++) {
        const substr = textLower.substr(i, word.length);
        let diff = 0;
        for (let j = 0; j < word.length; j++) {
          if (word[j] !== substr[j]) diff++;
          if (diff > 1) break;
        }
        if (diff <= 1) return true;
      }
      return false;
    });
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = 
        fuzzyMatch(item.name, searchQuery) ||
        fuzzyMatch(item.description, searchQuery);
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, activeCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage]);

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
      // Show success notification with theme colors
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-8 py-3.5 rounded-lg shadow-lg z-50 font-medium min-w-[280px] text-center';
      notification.textContent = `✓ Đã thêm ${item.name} vào giỏ hàng`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    }
  };

  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    modifiers: ModifierOption[],
    notes: string
  ) => {
    const modifierTotal = modifiers.reduce((acc, mod) => {
      const price = typeof mod.price === 'number' ? mod.price : parseFloat(mod.price || 0);
      console.log('Modifier:', mod.name, 'Price:', mod.price, 'Parsed:', price);
      return acc + (isNaN(price) ? 0 : price);
    }, 0);
    // Parse item.price to number to prevent string concatenation
    const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
    const finalTotal = itemPrice + modifierTotal;
    console.log('Item:', item.name, 'Base price:', item.price, 'Parsed base:', itemPrice, 'Modifier total:', modifierTotal, 'Final total:', finalTotal);
    dispatch({
      type: "ADD_ITEM",
      payload: {
        menuItem: item,
        quantity,
        selectedModifiers: modifiers,
        notes,
        totalPrice: finalTotal,
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
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {paginatedItems.map((item) => (
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                >
                  ← Trước
                </button>
                <span className="px-4 py-1 text-sm text-muted-foreground">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
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
