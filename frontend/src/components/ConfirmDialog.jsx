import React from 'react';

export default function ConfirmDialog({ 
  open, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  variant = 'warning' // 'warning' (màu cam) | 'danger' (màu đỏ) | 'success' (màu xanh)
}) {
  if (!open) return null;

  const getVariantConfig = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '⚠️',
          iconClass: 'danger',
          btnClass: 'btn-primary'
          // btnStyle: { background: '#e74c3c', borderColor: '#e74c3c' } // Override cứng thành đỏ tươi nếu muốn
        };
      case 'success':
        return {
          icon: '✅',
          iconClass: '',
          btnClass: 'btn-primary',
          btnStyle: { background: '#27ae60', borderColor: '#27ae60' }
        };
      default: // warning
        return {
          icon: '❓',
          iconClass: '',
          btnClass: 'btn-primary',
          btnStyle: {}
        };
    }
  };

  const config = getVariantConfig();

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className={`confirm-icon-wrapper ${config.iconClass}`}>
          {config.icon}
        </div>

        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button onClick={onCancel} className="btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>

          <button 
            onClick={onConfirm} 
            className={config.btnClass} 
            style={{ flex: 1, ...config.btnStyle }}
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}