"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getImageUrl } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Star,
  Grid,
  List,
  RefreshCw,
  CheckSquare,
  MoreVertical,
  ImagePlus,
  X,
  Upload,
  Link,
  Loader2,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatPrice } from "@/lib/menu-data";
import { adminAPI, API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  description?: string;
  price: number;
  status: "available" | "unavailable" | "sold_out";
  prep_time_minutes?: number;
  is_chef_recommended?: boolean;
  photos?: Array<{ id: string; url: string; is_primary: boolean }>;
  modifier_groups?: string[];
}

interface Category {
  id: string;
  name: string;
  status: string;
}

interface ModifierGroup {
  id: string;
  name: string;
  selection_type: string;
  is_required: boolean;
  options: Array<{ id: string; name: string; price_adjustment: number }>;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  available: {
    label: "Available",
    color: "bg-success text-success-foreground",
  },
  unavailable: {
    label: "Unavailable",
    color: "bg-muted text-muted-foreground",
  },
  sold_out: {
    label: "Sold Out",
    color: "bg-destructive text-destructive-foreground",
  },
};

export default function MenuItemsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Select mode
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Photo management
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [managingItem, setManagingItem] = useState<MenuItem | null>(null);
  const [photoUrls, setPhotoUrls] = useState("");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Modifiers
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    prep_time_minutes: "15",
    is_chef_recommended: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, categoriesRes, modifiersRes] = await Promise.all([
        adminAPI.items.getAll({ limit: 100 }),
        adminAPI.categories.getAll(),
        adminAPI.modifiers.getAll(),
      ]);
      setItems(itemsRes.data);
      setModifierGroups(modifiersRes);
      setCategories(categoriesRes);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      item.category_id.toString() === selectedCategory;
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category_id: "",
      prep_time_minutes: "15",
      is_chef_recommended: false,
    });
    setSelectedModifiers([]);
    setEditingItem(null);
  };

  // Toggle select mode
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedItems([]);
  };

  // Toggle item selection
  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Select all filtered items
  const selectAllItems = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((i) => i.id));
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedItems.length} item(s)?`
      )
    )
      return;

    try {
      await Promise.all(selectedItems.map((id) => adminAPI.items.delete(id)));
      toast({
        title: "Success",
        description: `Deleted ${selectedItems.length} item(s)`,
      });
      setSelectedItems([]);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete items",
        variant: "destructive",
      });
    }
  };

  // Bulk status change
  const handleBulkStatusChange = async (status: string) => {
    if (selectedItems.length === 0) return;

    try {
      await Promise.all(
        selectedItems.map((id) => adminAPI.items.updateStatus(id, status))
      );
      toast({
        title: "Success",
        description: `Updated ${selectedItems.length} item(s) to ${status}`,
      });
      setSelectedItems([]);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update items",
        variant: "destructive",
      });
    }
  };

  // Photo management
  const handleOpenPhotoDialog = (item: MenuItem) => {
    setManagingItem(item);
    setPhotoUrls("");
    setPhotoDialogOpen(true);
  };

  const handleAddPhotosFromUrl = async () => {
    if (!managingItem || !photoUrls.trim()) return;

    setUploadingPhotos(true);
    try {
      const urls = photoUrls
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u);
      await adminAPI.items.addPhotosFromUrl(managingItem.id, urls);
      toast({ title: "Success", description: "Photos added successfully" });
      setPhotoUrls("");
      fetchData();
      // Refresh managing item
      const updated = await adminAPI.items.getById(managingItem.id);
      setManagingItem({ ...managingItem, photos: updated.photos });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add photos",
        variant: "destructive",
      });
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!managingItem || !e.target.files?.length) return;

    setUploadingPhotos(true);
    try {
      const files = Array.from(e.target.files);
      await adminAPI.items.uploadPhotos(managingItem.id, files);
      toast({ title: "Success", description: "Photos uploaded successfully" });
      fetchData();
      // Refresh managing item
      const updated = await adminAPI.items.getById(managingItem.id);
      setManagingItem({ ...managingItem, photos: updated.photos });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload photos",
        variant: "destructive",
      });
    } finally {
      setUploadingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!managingItem) return;
    if (!confirm("Delete this photo?")) return;

    try {
      await adminAPI.items.deletePhoto(managingItem.id, photoId);
      toast({ title: "Success", description: "Photo deleted" });
      setManagingItem({
        ...managingItem,
        photos: managingItem.photos?.filter((p) => p.id !== photoId),
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete photo",
        variant: "destructive",
      });
    }
  };

  const handleSetPrimaryPhoto = async (photoId: number) => {
    if (!managingItem) return;

    try {
      await adminAPI.items.setPrimaryPhoto(managingItem.id, photoId);
      toast({ title: "Success", description: "Primary photo updated" });
      setManagingItem({
        ...managingItem,
        photos: managingItem.photos?.map((p) => ({
          ...p,
          is_primary: p.id === photoId,
        })),
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update primary photo",
        variant: "destructive",
      });
    }
  };

  // Export data
  const handleExportData = () => {
    const dataStr = JSON.stringify(filteredItems, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `menu-items-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenEditDialog = async (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      category_id: item.category_id.toString(),
      prep_time_minutes: (item.prep_time_minutes || 15).toString(),
      is_chef_recommended: item.is_chef_recommended || false,
    });

    // Load modifiers from API
    try {
      const modifierGroupIds = await adminAPI.items.getModifiers(item.id);
      console.log("Loaded modifiers for item:", item.id, modifierGroupIds);
      setSelectedModifiers(modifierGroupIds);
    } catch (err) {
      console.error("Failed to load modifiers:", err);
      setSelectedModifiers([]);
    }

    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.category_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        category_id: formData.category_id, // Keep as UUID string
        prep_time_minutes: parseInt(formData.prep_time_minutes) || 15,
        is_chef_recommended: formData.is_chef_recommended,
      };

      let itemId: string | undefined;
      if (editingItem) {
        await adminAPI.items.update(editingItem.id, payload);
        itemId = editingItem.id;
        toast({ title: "Success", description: "Item updated successfully" });
      } else {
        const newItem = await adminAPI.items.create(payload);
        itemId = newItem?.id;
        toast({ title: "Success", description: "Item created successfully" });
      }

      // Always save modifiers (even empty array to clear them)
      if (itemId) {
        try {
          console.log(
            "Saving modifiers for item:",
            itemId,
            "modifiers:",
            selectedModifiers
          );
          await adminAPI.items.setModifiers(itemId, selectedModifiers);
          console.log("Modifiers saved successfully");
        } catch (err) {
          console.error("Failed to save modifiers:", err);
        }
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save item",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const newStatus =
        item.status === "available" ? "unavailable" : "available";
      await adminAPI.items.updateStatus(item.id, newStatus);
      toast({ title: "Success", description: `Item marked as ${newStatus}` });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      await adminAPI.items.delete(item.id);
      toast({ title: "Success", description: "Item deleted successfully" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const getItemImage = (item: MenuItem) => {
    const primaryPhoto = item.photos?.find((p) => p.is_primary);
    const photoUrl = primaryPhoto?.url || item.photos?.[0]?.url;
    return getImageUrl(photoUrl);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Menu Items</h1>
            <p className="text-muted-foreground">Manage your restaurant menu</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Select Mode Toggle */}
            <Button
              variant={isSelectMode ? "default" : "outline"}
              size="sm"
              onClick={toggleSelectMode}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              {isSelectMode ? "Exit Select" : "Select"}
            </Button>

            {/* Show when in select mode */}
            {isSelectMode && (
              <>
                <Button variant="outline" size="sm" onClick={selectAllItems}>
                  {selectedItems.length === filteredItems.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedItems.length === 0}
                    >
                      Actions ({selectedItems.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleBulkStatusChange("available")}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Mark Available
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkStatusChange("unavailable")}
                    >
                      <EyeOff className="mr-2 h-4 w-4" />
                      Mark Unavailable
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkStatusChange("sold_out")}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Mark Sold Out
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleBulkDelete}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Export */}
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Edit Item" : "Add New Item"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Item name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Item description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (VND) *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(v) =>
                          setFormData({ ...formData, category_id: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prep_time">Prep Time (min)</Label>
                      <Input
                        id="prep_time"
                        type="number"
                        value={formData.prep_time_minutes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            prep_time_minutes: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="recommended"
                        checked={formData.is_chef_recommended}
                        onCheckedChange={(v) =>
                          setFormData({ ...formData, is_chef_recommended: v })
                        }
                      />
                      <Label htmlFor="recommended">Chef Recommended</Label>
                    </div>
                  </div>

                  {/* Modifier Groups Selection */}
                  {modifierGroups.length > 0 && (
                    <div className="space-y-2">
                      <Label>Modifiers (Optional)</Label>
                      <div className="max-h-40 overflow-y-auto rounded-lg border p-3 space-y-2">
                        {modifierGroups.map((group) => (
                          <div
                            key={group.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`mod-${group.id}`}
                              checked={selectedModifiers.includes(group.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedModifiers([
                                    ...selectedModifiers,
                                    group.id,
                                  ]);
                                } else {
                                  setSelectedModifiers(
                                    selectedModifiers.filter(
                                      (id) => id !== group.id
                                    )
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`mod-${group.id}`}
                              className="flex-1 text-sm cursor-pointer"
                            >
                              <span className="font-medium">{group.name}</span>
                              <span className="text-muted-foreground ml-2">
                                ({group.options?.length || 0} options)
                                {group.is_required && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 text-xs"
                                  >
                                    Required
                                  </Badge>
                                )}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select modifier groups that apply to this item
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting
                      ? "Saving..."
                      : editingItem
                      ? "Update"
                      : "Add Item"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                  <SelectItem value="sold_out">Sold Out</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1 rounded-lg border border-border p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
                <CardContent className="p-4">
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="mb-3 h-4 w-full" />
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === "grid" ? (
          /* Items Grid */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => {
              const config =
                statusConfig[item.status] || statusConfig.available;
              return (
                <Card
                  key={item.id}
                  className={`overflow-hidden ${
                    isSelectMode && selectedItems.includes(item.id)
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  <div className="relative aspect-square">
                    {isSelectMode && (
                      <div className="absolute left-2 top-2 z-10">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                          className="bg-background"
                        />
                      </div>
                    )}
                    <Image
                      src={getItemImage(item)}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    {item.status !== "available" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <Badge className={config.color}>{config.label}</Badge>
                      </div>
                    )}
                    {item.is_chef_recommended && (
                      <Badge className="absolute right-2 top-2 bg-warning text-warning-foreground">
                        <Star className="mr-1 h-3 w-3" /> Chef Pick
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-semibold text-card-foreground line-clamp-1">
                        {item.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="ml-2 shrink-0 text-xs"
                      >
                        {item.photos?.length || 0} 📷
                      </Badge>
                    </div>
                    <p className="mb-2 text-xs text-muted-foreground">
                      {item.category_name ||
                        categories.find((c) => c.id === item.category_id)?.name}
                    </p>
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                      {item.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">
                        {formatPrice(item.price)}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenPhotoDialog(item)}
                          title="Manage Photos"
                        >
                          <ImagePlus className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenEditDialog(item)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenPhotoDialog(item)}
                            >
                              <ImagePlus className="mr-2 h-4 w-4" />
                              Manage Photos
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(item)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-sm text-muted-foreground">
                        Available
                      </span>
                      <Switch
                        checked={item.status === "available"}
                        onCheckedChange={() => handleToggleAvailability(item)}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Items List */
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {isSelectMode && (
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={
                            selectedItems.length === filteredItems.length &&
                            filteredItems.length > 0
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedItems(filteredItems.map((i) => i.id));
                            } else {
                              setSelectedItems([]);
                            }
                          }}
                        />
                      </th>
                    )}
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                      Item
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                      Category
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                      Price
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                      Photos
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="p-4 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const config =
                      statusConfig[item.status as keyof typeof statusConfig] ||
                      statusConfig.available;
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-border last:border-0 ${
                          selectedItems.includes(item.id) ? "bg-primary/5" : ""
                        }`}
                      >
                        {isSelectMode && (
                          <td className="p-4">
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={() =>
                                toggleItemSelection(item.id)
                              }
                            />
                          </td>
                        )}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                              <Image
                                src={getItemImage(item)}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-card-foreground">
                                {item.name}
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {item.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {item.category_name ||
                              categories.find((c) => c.id === item.category_id)
                                ?.name}
                          </Badge>
                        </td>
                        <td className="p-4 font-medium text-card-foreground">
                          {formatPrice(item.price)}
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="gap-1">
                            📷 {item.photos?.length || 0}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={config.color}>{config.label}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenPhotoDialog(item)}
                              title="Manage Photos"
                            >
                              <ImagePlus className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleOpenEditDialog(item)}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOpenPhotoDialog(item)}
                                >
                                  <ImagePlus className="mr-2 h-4 w-4" />
                                  Manage Photos
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(item)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No items found</p>
          </div>
        )}
      </div>

      {/* Photo Management Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Photos - {managingItem?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Photos */}
            <div>
              <Label className="text-sm font-medium">
                Current Photos ({managingItem?.photos?.length || 0})
              </Label>
              {managingItem?.photos && managingItem.photos.length > 0 ? (
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {managingItem.photos.map((photo: any, index: number) => (
                    <div
                      key={photo.id || index}
                      className="group relative aspect-square overflow-hidden rounded-lg border"
                    >
                      <Image
                        src={getImageUrl(photo.photo_url || photo.url)}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {photo.is_primary && (
                        <Badge className="absolute left-2 top-2 bg-primary">
                          Primary
                        </Badge>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        {!photo.is_primary && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSetPrimaryPhoto(photo.id)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePhoto(photo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 rounded-lg border-2 border-dashed p-6 text-center text-muted-foreground">
                  No photos yet
                </div>
              )}
            </div>

            {/* Upload Photos */}
            <div>
              <Label className="text-sm font-medium">Upload Photos</Label>
              <div className="mt-2">
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingPhotos}
                />
                <label htmlFor="photo-upload">
                  <Button
                    variant="outline"
                    className="w-full cursor-pointer"
                    disabled={uploadingPhotos}
                    asChild
                  >
                    <span>
                      {uploadingPhotos ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Choose Files
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Add from URL */}
            <div>
              <Label className="text-sm font-medium">Add Photos from URL</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Enter one URL per line
              </p>
              <Textarea
                placeholder={
                  "https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"
                }
                value={photoUrls}
                onChange={(e) => setPhotoUrls(e.target.value)}
                rows={3}
              />
              <Button
                className="mt-2"
                onClick={handleAddPhotosFromUrl}
                disabled={!photoUrls.trim() || uploadingPhotos}
              >
                {uploadingPhotos ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Link className="mr-2 h-4 w-4" />
                    Add URLs
                  </>
                )}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
