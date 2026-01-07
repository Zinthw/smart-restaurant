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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  QrCode,
  Trash2,
  Users,
  RefreshCw,
  Pencil,
  Download,
  Printer,
  MoreVertical,
  FileImage,
  FileText,
  Loader2,
  CheckSquare,
} from "lucide-react";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Table {
  id: number;
  table_number: number;
  capacity: number;
  location: string;
  description?: string;
  status: "active" | "occupied" | "reserved" | "inactive";
  qr_code?: string;
  qr_token?: string;
  qr_token_created_at?: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Available", color: "bg-success text-success-foreground" },
  occupied: { label: "Occupied", color: "bg-primary text-primary-foreground" },
  reserved: { label: "Reserved", color: "bg-warning text-warning-foreground" },
  inactive: { label: "Inactive", color: "bg-muted text-muted-foreground" },
};

const locations = ["indoor", "outdoor", "vip", "terrace"];

export default function TablesPage() {
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [showQrDialog, setShowQrDialog] = useState<Table | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [submitting, setSubmitting] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [regeneratingAll, setRegeneratingAll] = useState(false);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    table_number: "",
    capacity: "4",
    location: "indoor",
    description: "",
  });

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.tables.getAll();
      setTables(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch tables",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const filteredTables = tables.filter(
    (table) => filterStatus === "all" || table.status === filterStatus
  );

  const resetForm = () => {
    setFormData({
      table_number: "",
      capacity: "4",
      location: "indoor",
      description: "",
    });
    setEditingTable(null);
  };

  // Toggle select mode
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedTables([]);
  };

  // Toggle table selection
  const toggleTableSelection = (tableId: number) => {
    setSelectedTables((prev) =>
      prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId]
    );
  };

  // Select all filtered tables
  const selectAllTables = () => {
    if (selectedTables.length === filteredTables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(filteredTables.map((t) => t.id));
    }
  };

  // Generate QR for a single table
  const handleGenerateQR = async (table: Table) => {
    setQrLoading(true);
    setQrImageUrl(null);
    try {
      const result = await adminAPI.tables.generateQR(table.id);
      setQrImageUrl(result.qrImageDataUrl);
      toast({
        title: "Success",
        description: `QR code generated for Table ${table.table_number}`,
      });
      fetchTables(); // Refresh to get updated qr_token
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate QR",
        variant: "destructive",
      });
    } finally {
      setQrLoading(false);
    }
  };

  // Download QR for single table
  const handleDownloadQR = (table: Table, format: "png" | "pdf") => {
    const url = adminAPI.tables.downloadQR(table.id, format);
    const token = localStorage.getItem("admin_token");
    // Open in new window with auth (or direct download)
    window.open(`${url}&token=${token}`, "_blank");
  };

  // Download all QR codes
  const handleDownloadAllQR = (format: "png" | "pdf") => {
    const url = adminAPI.tables.downloadAllQR(format);
    const token = localStorage.getItem("admin_token");
    window.open(`${url}&token=${token}`, "_blank");
  };

  // Regenerate all QR codes
  const handleRegenerateAllQR = async () => {
    if (
      !confirm(
        "This will regenerate QR codes for ALL active tables. Old QR codes will become invalid. Continue?"
      )
    )
      return;

    setRegeneratingAll(true);
    try {
      const result = await adminAPI.tables.regenerateAllQR();
      toast({
        title: "Success",
        description: result.message,
      });
      fetchTables();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate QR codes",
        variant: "destructive",
      });
    } finally {
      setRegeneratingAll(false);
    }
  };

  // Print QR codes for selected tables
  const handlePrintSelected = () => {
    if (selectedTables.length === 0) {
      toast({
        title: "No tables selected",
        description: "Please select at least one table to print",
        variant: "destructive",
      });
      return;
    }

    // Create print window with selected QR codes
    const selectedTableData = tables.filter((t) =>
      selectedTables.includes(t.id)
    );
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Codes - Selected Tables</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .qr-page { page-break-after: always; text-align: center; padding: 50px; }
          .qr-page:last-child { page-break-after: auto; }
          .table-number { font-size: 36px; font-weight: bold; margin-bottom: 20px; }
          .qr-placeholder { width: 300px; height: 300px; margin: 0 auto 20px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; }
          .location { color: #666; font-size: 18px; }
          .scan-text { margin-top: 20px; font-size: 24px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="padding: 20px; background: #f0f0f0; margin-bottom: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
            🖨️ Print QR Codes
          </button>
          <span style="margin-left: 20px;">Selected: ${
            selectedTableData.length
          } table(s)</span>
        </div>
        ${selectedTableData
          .map(
            (table) => `
          <div class="qr-page">
            <div class="table-number">Table ${table.table_number}</div>
            <div class="qr-placeholder">
              ${
                table.qr_token
                  ? `<img src="${window.location.origin}/api/admin/tables/${table.id}/qr/download?format=png" width="280" onerror="this.parentElement.innerHTML='QR Not Generated'">`
                  : "QR Not Generated"
              }
            </div>
            <div class="scan-text">Scan to Order</div>
            <div class="location">${table.location}${
              table.description ? ` • ${table.description}` : ""
            }</div>
          </div>
        `
          )
          .join("")}
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getQRUrl = (table: Table) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/menu/guest?table=${table.id}`;
  };

  const handleOpenEditDialog = (table: Table) => {
    setEditingTable(table);
    setFormData({
      table_number: table.table_number.toString(),
      capacity: table.capacity.toString(),
      location: table.location,
      description: table.description || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.table_number || !formData.capacity) {
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
        table_number: parseInt(formData.table_number),
        capacity: parseInt(formData.capacity),
        location: formData.location,
        description: formData.description || undefined,
      };

      if (editingTable) {
        await adminAPI.tables.update(editingTable.id, payload);
        toast({ title: "Success", description: "Table updated successfully" });
      } else {
        await adminAPI.tables.create(payload);
        toast({ title: "Success", description: "Table created successfully" });
      }

      setIsAddDialogOpen(false);
      resetForm();
      fetchTables();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save table",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTable = async (table: Table) => {
    if (table.status === "occupied") {
      toast({
        title: "Cannot Delete",
        description:
          "Cannot delete an occupied table. Please clear orders first.",
        variant: "destructive",
      });
      return;
    }

    if (
      !confirm(`Are you sure you want to delete Table ${table.table_number}?`)
    )
      return;

    try {
      await adminAPI.tables.delete(table.id);
      toast({ title: "Success", description: "Table deleted successfully" });
      fetchTables();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete table",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (table: Table, newStatus: string) => {
    try {
      await adminAPI.tables.update(table.id, {
        table_number: table.table_number,
        capacity: table.capacity,
        location: table.location,
        description: table.description,
        status: newStatus,
      });
      toast({ title: "Success", description: "Status updated" });
      fetchTables();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tables</h1>
            <p className="text-muted-foreground">
              Manage restaurant tables and QR codes
            </p>
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
                <Button variant="outline" size="sm" onClick={selectAllTables}>
                  {selectedTables.length === filteredTables.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintSelected}
                  disabled={selectedTables.length === 0}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print ({selectedTables.length})
                </Button>
              </>
            )}

            {/* QR Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownloadAllQR("png")}>
                  <FileImage className="mr-2 h-4 w-4" />
                  Download All (PNG ZIP)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadAllQR("pdf")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Download All (PDF)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleRegenerateAllQR}
                  disabled={regeneratingAll}
                  className="text-warning"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      regeneratingAll ? "animate-spin" : ""
                    }`}
                  />
                  {regeneratingAll ? "Regenerating..." : "Regenerate All QR"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchTables}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Dialog
              open={isAddDialogOpen}
              onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Table
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTable ? "Edit Table" : "Add New Table"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="tableNumber">Table Number *</Label>
                    <Input
                      id="tableNumber"
                      type="number"
                      placeholder="e.g., 1"
                      value={formData.table_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          table_number: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Select
                      value={formData.capacity}
                      onValueChange={(v) =>
                        setFormData({ ...formData, capacity: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 4, 6, 8, 10, 12].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} seats
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(v) =>
                        setFormData({ ...formData, location: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc.charAt(0).toUpperCase() + loc.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="e.g., Near window"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting
                      ? "Saving..."
                      : editingTable
                      ? "Update"
                      : "Add Table"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Status Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All ({tables.length})
              </Button>
              {Object.entries(statusConfig).map(([status, config]) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {config.label} (
                  {tables.filter((t) => t.status === status).length})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tables Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="mb-4 h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTables.map((table) => {
              const config = statusConfig[table.status] || statusConfig.active;

              return (
                <Card
                  key={table.id}
                  className={`overflow-hidden ${
                    isSelectMode && selectedTables.includes(table.id)
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isSelectMode && (
                          <Checkbox
                            checked={selectedTables.includes(table.id)}
                            onCheckedChange={() =>
                              toggleTableSelection(table.id)
                            }
                          />
                        )}
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                          <span className="text-xl font-bold text-muted-foreground">
                            {table.table_number}
                          </span>
                        </div>
                      </div>
                      <Badge className={config.color}>{config.label}</Badge>
                    </div>

                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{table.capacity} seats</span>
                      {table.qr_token && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          QR ✓
                        </Badge>
                      )}
                    </div>

                    <p className="mb-4 text-xs text-muted-foreground capitalize">
                      📍 {table.location}
                      {table.description && ` • ${table.description}`}
                    </p>

                    <div className="space-y-2">
                      <Select
                        value={table.status}
                        onValueChange={(value) =>
                          handleStatusChange(table, value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => {
                            setShowQrDialog(table);
                            setQrImageUrl(null);
                          }}
                        >
                          <QrCode className="mr-1 h-4 w-4" />
                          QR
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenEditDialog(table)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadQR(table, "png")}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download QR (PNG)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadQR(table, "pdf")}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Download QR (PDF)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteTable(table)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* QR Code Dialog */}
        <Dialog
          open={!!showQrDialog}
          onOpenChange={() => {
            setShowQrDialog(null);
            setQrImageUrl(null);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                QR Code - Table {showQrDialog?.table_number}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center py-6">
              {/* QR Image Display */}
              <div className="mb-4 flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted overflow-hidden">
                {qrLoading ? (
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                ) : qrImageUrl ? (
                  <img
                    src={qrImageUrl}
                    alt={`QR Code for Table ${showQrDialog?.table_number}`}
                    className="h-full w-full object-contain"
                  />
                ) : showQrDialog?.qr_token ? (
                  <div className="text-center p-4">
                    <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      QR exists. Click &quot;Generate/Refresh&quot; to preview.
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      No QR code generated yet
                    </p>
                  </div>
                )}
              </div>

              <p className="mb-2 text-center text-sm text-muted-foreground">
                Scan to access the menu for Table {showQrDialog?.table_number}
              </p>
              <p className="text-center text-xs text-muted-foreground break-all px-4">
                {showQrDialog && getQRUrl(showQrDialog)}
              </p>

              {showQrDialog?.qr_token_created_at && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Last generated:{" "}
                  {new Date(showQrDialog.qr_token_created_at).toLocaleString()}
                </p>
              )}
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => {
                  setShowQrDialog(null);
                  setQrImageUrl(null);
                }}
              >
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (showQrDialog) {
                    navigator.clipboard.writeText(getQRUrl(showQrDialog));
                    toast({
                      title: "Copied!",
                      description: "URL copied to clipboard",
                    });
                  }
                }}
              >
                Copy URL
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      showQrDialog && handleDownloadQR(showQrDialog, "png")
                    }
                  >
                    <FileImage className="mr-2 h-4 w-4" />
                    PNG Image
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      showQrDialog && handleDownloadQR(showQrDialog, "pdf")
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF Document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={() => showQrDialog && handleGenerateQR(showQrDialog)}
                disabled={qrLoading}
              >
                {qrLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {showQrDialog?.qr_token ? "Refresh QR" : "Generate QR"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {!loading && filteredTables.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No tables found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
