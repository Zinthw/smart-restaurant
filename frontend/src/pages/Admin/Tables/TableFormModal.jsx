import { useForm } from "react-hook-form";
import { useEffect } from "react";

export default function TableFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Map location tiếng Việt sang tiếng Anh (cho backend)
  const locationToEnglish = (vnLocation) => {
    const map = {
      'Trong Nhà': 'Indoor',
      'Ngoài Trời': 'Outdoor',
      'Phòng VIP': 'VIP Room'
    };
    return map[vnLocation] || vnLocation;
  };

  // Map location tiếng Anh sang tiếng Việt (cho hiển thị)
  const locationToVietnamese = (enLocation) => {
    const map = {
      'Indoor': 'Trong Nhà',
      'Outdoor': 'Ngoài Trời',
      'VIP Room': 'Phòng VIP',
      'VIP': 'Phòng VIP'
    };
    return map[enLocation] || enLocation;
  };

  useEffect(() => {
    if (initialData) {
      // Khi edit, chuyển location từ tiếng Anh sang tiếng Việt
      reset({
        ...initialData,
        location: locationToVietnamese(initialData.location)
      });
    } else {
      reset({
        table_number: "",
        capacity: 2,
        location: "Trong Nhà",
        description: "",
      });
    }
  }, [initialData, reset, open]);

  // Wrapper để chuyển location sang tiếng Anh trước khi submit
  const handleFormSubmit = (data) => {
    const submittedData = {
      ...data,
      location: locationToEnglish(data.location)
    };
    onSubmit(submittedData);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <h3 style={{ margin: 0 }}>
            {initialData ? "Chỉnh Sửa Bàn" : "Thêm Bàn Mới"}
          </h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} style={{ padding: "20px" }}>
          <div className="form-group">
            <label className="form-label">Số Bàn</label>
            <input
              className="form-input"
              placeholder="Ví dụ: B-01"
              {...register("table_number", { required: true })}
            />
            {errors.table_number && (
              <span className="form-hint error">Bắt buộc</span>
            )}
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Sức Chứa</label>
              <input
                type="number"
                className="form-input"
                {...register("capacity", { required: true, min: 1, max: 20 })}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Vị Trí</label>
              <select className="form-input" {...register("location")}>
                <option>Trong Nhà</option>
                <option>Ngoài Trời</option>
                <option>Phòng VIP</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô Tả</label>
            <textarea
              className="form-input"
              rows="3"
              {...register("description")}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              Lưu Bàn
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
