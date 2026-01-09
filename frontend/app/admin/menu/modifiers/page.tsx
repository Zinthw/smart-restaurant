"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  Settings,
} from "lucide-react";
import { formatPrice } from "@/lib/menu-data";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ModifierOption {
  id: number;
  name: string;
  price_adjustment: number;
  status: string;
}

interface ModifierGroup {
  id: number;
  name: string;
  selection_type: "single" | "multiple";
  min_selection: number;
  max_selection: number;
  is_required: boolean;
  options: ModifierOption[];
}

export default function ModifiersPage() {
  const { toast } = useToast();
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

  // Add/Edit Group Dialog
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: "",
    selection_type: "single" as "single" | "multiple",
    min_selection: 0,
    max_selection: 1,
    required: false,
  });
  const [savingGroup, setSavingGroup] = useState(false);

  // Add/Edit Option Dialog
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<ModifierOption | null>(
    null
  );
  const [optionGroupId, setOptionGroupId] = useState<number | null>(null);
  const [optionForm, setOptionForm] = useState({
    name: "",
    price_adjustment: 0,
  });
  const [savingOption, setSavingOption] = useState(false);

  // Fetch modifier groups
  const fetchModifierGroups = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.modifiers.getAll();
      setModifierGroups(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load modifier groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModifierGroups();
  }, []);

  // Open group dialog for create
  const handleOpenCreateGroup = () => {
    setEditingGroup(null);
    setGroupForm({
      name: "",
      selection_type: "single",
      min_selection: 0,
      max_selection: 1,
      required: false,
    });
    setIsGroupDialogOpen(true);
  };

  // Open group dialog for edit
  const handleOpenEditGroup = (group: ModifierGroup) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      selection_type: group.selection_type,
      min_selection: group.min_selection,
      max_selection: group.max_selection,
      required: group.is_required,
    });
    setIsGroupDialogOpen(true);
  };

  // Save group (create or update)
  const handleSaveGroup = async () => {
    if (!groupForm.name.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingGroup(true);
      if (editingGroup) {
        await adminAPI.modifiers.updateGroup(editingGroup.id, groupForm);
        toast({ title: "Success", description: "Modifier group updated" });
      } else {
        await adminAPI.modifiers.createGroup(groupForm);
        toast({ title: "Success", description: "Modifier group created" });
      }
      setIsGroupDialogOpen(false);
      fetchModifierGroups();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save modifier group",
        variant: "destructive",
      });
    } finally {
      setSavingGroup(false);
    }
  };

  // Delete group
  const handleDeleteGroup = async (group: ModifierGroup) => {
    if (
      !confirm(
        `Are you sure you want to delete "${group.name}"? This will also delete all its options.`
      )
    ) {
      return;
    }

    try {
      await adminAPI.modifiers.deleteGroup(group.id);
      toast({ title: "Success", description: "Modifier group deleted" });
      fetchModifierGroups();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete modifier group",
        variant: "destructive",
      });
    }
  };

  // Open option dialog for create
  const handleOpenCreateOption = (groupId: number) => {
    setEditingOption(null);
    setOptionGroupId(groupId);
    setOptionForm({ name: "", price_adjustment: 0 });
    setIsOptionDialogOpen(true);
  };

  // Open option dialog for edit
  const handleOpenEditOption = (groupId: number, option: ModifierOption) => {
    setEditingOption(option);
    setOptionGroupId(groupId);
    setOptionForm({
      name: option.name,
      price_adjustment: option.price_adjustment,
    });
    setIsOptionDialogOpen(true);
  };

  // Save option (create or update)
  const handleSaveOption = async () => {
    if (!optionForm.name.trim()) {
      toast({
        title: "Error",
        description: "Option name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingOption(true);
      if (editingOption) {
        await adminAPI.modifiers.updateOption(editingOption.id, optionForm);
        toast({ title: "Success", description: "Option updated" });
      } else if (optionGroupId) {
        await adminAPI.modifiers.addOption(optionGroupId, optionForm);
        toast({ title: "Success", description: "Option added" });
      }
      setIsOptionDialogOpen(false);
      fetchModifierGroups();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save option",
        variant: "destructive",
      });
    } finally {
      setSavingOption(false);
    }
  };

  // Delete option
  const handleDeleteOption = async (option: ModifierOption) => {
    if (!confirm(`Are you sure you want to delete "${option.name}"?`)) {
      return;
    }

    try {
      await adminAPI.modifiers.deleteOption(option.id);
      toast({ title: "Success", description: "Option deleted" });
      fetchModifierGroups();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete option",
        variant: "destructive",
      });
    }
  };

  const toggleExpanded = (id: number) => {
    setExpandedGroup(expandedGroup === id ? null : id);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Modifiers</h1>
            <p className="text-muted-foreground">
              Manage item customization options ({modifierGroups.length} groups)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchModifierGroups}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={handleOpenCreateGroup}>
              <Plus className="mr-2 h-4 w-4" />
              Add Group
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modifier Groups List */}
        {!loading && (
          <div className="space-y-4">
            {modifierGroups.map((group) => (
              <Card key={group.id}>
                <CardContent className="p-0">
                  {/* Group Header */}
                  <div
                    className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50"
                    onClick={() => toggleExpanded(group.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Settings className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">
                          {group.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {group.selection_type === "single"
                              ? "Single Select"
                              : "Multiple Select"}
                          </Badge>
                          {group.is_required && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                          {group.selection_type === "multiple" && (
                            <Badge variant="outline" className="text-xs">
                              Min: {group.min_selection} | Max:{" "}
                              {group.max_selection}
                            </Badge>
                          )}
                          <Badge className="text-xs">
                            {group.options?.length || 0} options
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditGroup(group);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      {expandedGroup === group.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Options Section - Expanded */}
                  {expandedGroup === group.id && (
                    <div className="border-t border-border p-4 bg-muted/20">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="font-medium text-card-foreground">
                          Options
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCreateOption(group.id)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add Option
                        </Button>
                      </div>

                      {group.options && group.options.length > 0 ? (
                        <div className="space-y-2">
                          {group.options.map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-card-foreground">
                                  {option.name}
                                </span>
                                {option.status !== "active" && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {option.status}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`text-sm font-medium ${
                                    option.price_adjustment > 0
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {option.price_adjustment > 0
                                    ? `+${formatPrice(option.price_adjustment)}`
                                    : "Free"}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    handleOpenEditOption(group.id, option)
                                  }
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDeleteOption(option)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                          <p className="text-sm text-muted-foreground">
                            No options yet. Add your first option!
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && modifierGroups.length === 0 && (
          <div className="py-12 text-center">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No modifier groups yet</h3>
            <p className="mt-2 text-muted-foreground">
              Create modifier groups like Size, Toppings, Spice Level, etc.
            </p>
            <Button className="mt-4" onClick={handleOpenCreateGroup}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Group
            </Button>
          </div>
        )}

        {/* Add/Edit Group Dialog */}
        <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGroup
                  ? "Edit Modifier Group"
                  : "Add New Modifier Group"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name *</Label>
                <Input
                  id="groupName"
                  placeholder="e.g., Size, Toppings, Spice Level"
                  value={groupForm.name}
                  onChange={(e) =>
                    setGroupForm({ ...groupForm, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Selection Type</Label>
                <Select
                  value={groupForm.selection_type}
                  onValueChange={(value: "single" | "multiple") =>
                    setGroupForm({ ...groupForm, selection_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">
                      Single Select (Radio)
                    </SelectItem>
                    <SelectItem value="multiple">
                      Multiple Select (Checkbox)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {groupForm.selection_type === "multiple" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minSelection">Min Selection</Label>
                    <Input
                      id="minSelection"
                      type="number"
                      min={0}
                      value={groupForm.min_selection}
                      onChange={(e) =>
                        setGroupForm({
                          ...groupForm,
                          min_selection: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxSelection">Max Selection</Label>
                    <Input
                      id="maxSelection"
                      type="number"
                      min={1}
                      value={groupForm.max_selection}
                      onChange={(e) =>
                        setGroupForm({
                          ...groupForm,
                          max_selection: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label>Required</Label>
                  <p className="text-sm text-muted-foreground">
                    Customer must select an option
                  </p>
                </div>
                <Switch
                  checked={groupForm.required}
                  onCheckedChange={(checked) =>
                    setGroupForm({ ...groupForm, required: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsGroupDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveGroup} disabled={savingGroup}>
                {savingGroup && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingGroup ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Option Dialog */}
        <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingOption ? "Edit Option" : "Add New Option"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="optionName">Option Name *</Label>
                <Input
                  id="optionName"
                  placeholder="e.g., Small, Medium, Large"
                  value={optionForm.name}
                  onChange={(e) =>
                    setOptionForm({ ...optionForm, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceAdjustment">Price Adjustment (VND)</Label>
                <Input
                  id="priceAdjustment"
                  type="number"
                  min={0}
                  step={1000}
                  placeholder="0 for free, or additional price"
                  value={optionForm.price_adjustment}
                  onChange={(e) =>
                    setOptionForm({
                      ...optionForm,
                      price_adjustment: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter 0 if this option is free, or the additional amount to
                  add to the item price
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOptionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveOption} disabled={savingOption}>
                {savingOption && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingOption ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
