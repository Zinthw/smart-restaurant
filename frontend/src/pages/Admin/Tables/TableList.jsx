import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { hasValidToken } from "../../../utils/authHelper";
import {
  getTables,
  createTable,
  updateTable,
  updateTableStatus,
  generateQR,
  regenerateAllQRs,
  deleteTable,
} from "../../../api/tables.api";
import TableFormModal from "./TableFormModal";
import QRModal from "./QRModal";
import ConfirmDialog from "../../../components/ConfirmDialog";

export default function TableList() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [confirm, setConfirm] = useState(null);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("number_asc");

  // Kiểm tra token khi component mount
  useEffect(() => {
    if (!hasValidToken()) {
      toast.error("Vui lòng đăng nhập lại");
      navigate("/admin/login");
    }
  }, [navigate]);

  const loadTables = async () => {
    // Kiểm tra token trước khi fetch
    if (!hasValidToken()) {
      console.warn("⚠️ Token không tồn tại, chuyển hướng đến login");
      navigate("/admin/login");
      return;
    }

    try {
      setLoading(true);
      const res = await getTables();

      let dataArray = [];
      if (res.data && Array.isArray(res.data)) {
        dataArray = res.data;
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        dataArray = res.data.data;
      } else if (Array.isArray(res)) {
        dataArray = res;
      }
      setTables(dataArray);
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách bàn:", error);
      toast.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleSave = async (data) => {
    try {
      if (selectedTable) await updateTable(selectedTable.id, data);
      else await createTable(data);
      toast.success(selectedTable ? "Cập nhật bàn thành công!" : "Tạo bàn mới thành công!");
      setShowForm(false);
      setSelectedTable(null);
      loadTables();
    } catch (error) {
      toast.error("Lỗi khi lưu thông tin bàn");
    }
  };

  // --- LOGIC XỬ LÝ CONFIRM CHUNG ---
  const executeConfirmAction = async () => {
    if (!confirm) return;

    // Xử lý logic dựa trên loại hành động (type)
    if (confirm.type === "TOGGLE_STATUS") {
      await handleToggleStatus(confirm.table);
    } else if (confirm.type === "REGEN_ALL") {
      await handleRegenerateAll();
    } else if (confirm.type === "DELETE_TABLE") {
      await handleDelete(confirm.table);
    }
  };

  const handleToggleStatus = async (table) => {
    try {
      await updateTableStatus(
        table.id,
        table.status === "active" ? "inactive" : "active"
      );
      toast.success("Cập nhật trạng thái thành công!");
      setConfirm(null);
      loadTables();
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  // Hàm xử lý Regenerate All
  const handleRegenerateAll = async () => {
    try {
      setLoading(true);
      // Gọi API regenerate all (giả định backend trả về success)
      await regenerateAllQRs();
      toast.success("Tạo lại tất cả mã QR thành công!");
      setConfirm(null); // Đóng modal
      loadTables(); // Tải lại để update timestamp mới (nếu có hiển thị)
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tạo lại mã QR");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = (format) => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
    const token = localStorage.getItem("admin_token");
    const url = `${apiUrl}/admin/tables/qr/download-all?format=${format}&token=${token}`;
    window.open(url, "_blank");
    toast.success(`Đang tải xuống tất cả mã QR dạng ${format.toUpperCase()}...`);
  };

  const handleGenerateQR = async (table) => {
    try {
      const res = await generateQR(table.id);
      const url = res.data?.url;
      if (url) {
        setQrUrl(url);
        setSelectedTable(table);
        setShowQR(true);
        toast.success("Tạo mã QR thành công!");
        loadTables();
      }
    } catch (error) {
      toast.error("Lỗi khi tạo mã QR");
    }
  };

  const handleDelete = async (table) => {
    try {
      setLoading(true);
      await deleteTable(table.id);
      toast.success("Xóa bàn thành công!");
      setConfirm(null);
      loadTables();
    } catch (error) {
      console.error("❌ Lỗi khi xóa bàn:", error);
      toast.error("Lỗi khi xóa bàn");
    } finally {
      setLoading(false);
    }
  };

  // Helper function để chuyển location sang tiếng Việt
  const translateLocation = (location) => {
    const locationMap = {
      'Indoor': 'Trong Nhà',
      'Outdoor': 'Ngoài Trời',
      'VIP Room': 'Phòng VIP',
      'VIP': 'Phòng VIP'
    };
    return locationMap[location] || location;
  };

  const getFilteredTables = () => {
    if (!tables || !Array.isArray(tables)) return [];
    let result = [...tables];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter((t) => {
        const tableNum = t.table_number
          ? String(t.table_number).toLowerCase()
          : "";
        const location = t.location ? String(t.location).toLowerCase() : "";
        const tableNumCamel = t.tableNumber
          ? String(t.tableNumber).toLowerCase()
          : "";
        return (
          tableNum.includes(lowerTerm) ||
          location.includes(lowerTerm) ||
          tableNumCamel.includes(lowerTerm)
        );
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (locationFilter !== "all") {
      result = result.filter(
        (t) => t.location && t.location === locationFilter
      );
    }

    result.sort((a, b) => {
      const numA = a.table_number || a.tableNumber || "";
      const numB = b.table_number || b.tableNumber || "";
      const capA = a.capacity || 0;
      const capB = b.capacity || 0;

      if (sortBy === "number_asc") {
        return String(numA).localeCompare(String(numB), undefined, {
          numeric: true,
        });
      }
      if (sortBy === "capacity_desc") return capB - capA;
      if (sortBy === "capacity_asc") return capA - capB;
      return 0;
    });

    return result;
  };

  const filteredTables = getFilteredTables();
  const totalTables = tables.length;
  const activeTables = tables.filter((t) => t.status === "active").length;
  const inactiveTables = totalTables - activeTables;
  const uniqueLocations = [
    ...new Set(tables.map((t) => t.location).filter(Boolean)),
  ];

  return (
    <>
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="page-title">Quản Lý Bàn</h1>
          <p className="page-subtitle">Quản lý bàn và tạo mã QR</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setSelectedTable(null);
            setShowForm(true);
          }}
        >
          + Thêm Bàn
        </button>
      </div>

      {/* Stats Cards (Giữ nguyên) */}
      <div
        className="stats-grid"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {/* ... (Code Stats Cards giữ nguyên) ... */}
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "#e8f8f5", color: "#27ae60" }}
          >
            🪑
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalTables}</div>
            <div className="stat-label">Tổng Số Bàn</div>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "#ebf5fb", color: "#3498db" }}
          >
            ✅
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeTables}</div>
            <div className="stat-label">Đang Hoạt Động</div>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "#fef9e7", color: "#f39c12" }}
          >
            🚫
          </div>
          <div className="stat-content">
            <div className="stat-value">{inactiveTables}</div>
            <div className="stat-label">Không Hoạt Động</div>
          </div>
        </div>
      </div>

      {/* Main Table Grid Area */}
      <div className="table-card">
        <div className="table-header">
          <h3>Tất Cả Bàn</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {/* Regenerate All */}
            <button
              className="btn-secondary"
              style={{
                backgroundColor: "#fff1f0",
                color: "#e74c3c",
                borderColor: "#ffccc7",
              }}
              onClick={() =>
                setConfirm({
                  type: "REGEN_ALL",
                  message:
                    "CẢNH BÁO: Thao tác này sẽ vô hiệu hóa TẤT CẢ mã QR hiện có. Khách hàng sẽ cần quét lại mã mới. Bạn có chắc chắn?",
                })
              }
            >
              🔄 Tạo Lại Tất Cả QR
            </button>

            <button
              className="btn-secondary"
              onClick={() => handleDownloadAll("png")}
            >
              ⬇️ Tải Tất Cả (ZIP)
            </button>
            <button
              className="btn-secondary"
              onClick={() => handleDownloadAll("pdf")}
            >
              📄 Tải Tất Cả (PDF)
            </button>
          </div>
        </div>

        {/* Filter Area */}
        <div className="filters-bar">
          <div className="search-box">
            <span style={{ color: "#95a5a6", fontSize: 18 }}>🔍</span>
            <input
              type="text"
              placeholder="Tìm số bàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất Cả Trạng Thái</option>
            <option value="active">Đang Hoạt Động</option>
            <option value="inactive">Không Hoạt Động</option>
          </select>
          <select
            className="filter-select"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="all">Tất Cả Vị Trí</option>
            <option value="Indoor">Trong Nhà</option>
            <option value="Outdoor">Ngoài Trời</option>
            <option value="VIP Room">Phòng VIP</option>
            {uniqueLocations.map(
              (loc) =>
                !["Indoor", "Outdoor", "VIP Room"].includes(loc) && (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                )
            )}
          </select>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="number_asc">Sắp Xếp: Số Bàn (Tăng Dần)</option>
            <option value="capacity_desc">Sắp Xếp: Sức Chứa (Cao-Thấp)</option>
            <option value="capacity_asc">Sắp Xếp: Sức Chứa (Thấp-Cao)</option>
          </select>
        </div>

        {loading ? (
          <div className="p-5 text-center">Đang tải...</div>
        ) : (
          <div className="tables-grid">
            {filteredTables.length > 0 ? (
              filteredTables.map((t) => (
                <div
                  key={t.id}
                  className={`table-tile ${
                    t.status === "active" ? "available" : "inactive"
                  }`}
                >
                  <div className="table-number">{t.table_number}</div>
                  <div
                    className={`table-status ${
                      t.status === "active" ? "available" : "inactive"
                    }`}
                  >
                    {t.status === "active" ? "✅ Sẵn Sàng" : "🚫 Không Hoạt Động"}
                  </div>
                  <div className="table-info">
                    <span>{t.capacity} chỗ</span>
                    <span>•</span>
                    <span>{translateLocation(t.location)}</span>
                  </div>
                  <div className="table-session">
                    {t.qrToken ? (
                      <div
                        className="session-detail"
                        style={{ color: "green" }}
                      >
                        QR Sẵn Sàng
                      </div>
                    ) : (
                      <div className="session-detail" style={{ color: "gray" }}>
                        Chưa Có QR
                      </div>
                    )}
                  </div>
                  <div className="table-actions">
                    <button
                      className="btn-small"
                      onClick={() => handleGenerateQR(t)}
                      title="QR Code"
                    >
                      QR
                    </button>
                    <button
                      className="btn-small"
                      onClick={() => {
                        setSelectedTable(t);
                        setShowForm(true);
                      }}
                      title="Chỉnh Sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-small"
                      onClick={() =>
                        setConfirm({
                          type: "DELETE_TABLE",
                          table: t,
                          message: `Delete table ${t.table_number}? This will remove its QR link.`,
                        })
                      }
                      title="Delete"
                    >
                      🗑️
                    </button>
                    <button
                      className="btn-small"
                      onClick={() =>
                        setConfirm({
                          type: "TOGGLE_STATUS", // Đánh dấu loại hành động
                          table: t,
                          message: `Change status to ${
                            t.status === "active" ? "Inactive" : "Active"
                          }?`,
                        })
                      }
                      title="Toggle Status"
                    >
                      {t.status === "active" ? "🔒" : "🔓"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "20px",
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                Không tìm thấy bàn nào phù hợp với bộ lọc.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <TableFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSave}
        initialData={selectedTable}
      />
      <QRModal
        open={showQR}
        onClose={() => setShowQR(false)}
        table={selectedTable}
        qrUrl={qrUrl}
      />

      {/* Confirm Dialog được nâng cấp để xử lý động */}
      <ConfirmDialog
        open={!!confirm}
        title="Xác Nhận Thao Tác"
        message={confirm?.message}
        onConfirm={executeConfirmAction} // Gọi hàm trung gian thay vì gọi trực tiếp
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
