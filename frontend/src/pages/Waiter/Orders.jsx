import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import '../../assets/waiter.css';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, orderId: null });
  const [rejectReason, setRejectReason] = useState('');

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Mock data - replace with real API calls later
  const mockOrders = [
    {
      id: 'ORD-0051',
      tableNumber: 'T5',
      status: 'pending',
      items: [
        { id: 1, name: 'Cá Hồi Nướng', quantity: 2, price: 270000, modifiers: ['Size: Lớn', '+ Salad phụ'] },
        { id: 2, name: 'Salad Caesar', quantity: 1, price: 60000, modifiers: [] },
        { id: 3, name: 'Súp Nấm', quantity: 1, price: 40000, modifiers: [], note: 'Không hành' }
      ],
      createdAt: new Date(),
      isNew: true
    },
    {
      id: 'ORD-0050',
      tableNumber: 'T3',
      status: 'pending',
      items: [
        { id: 4, name: 'Pasta Carbonara', quantity: 2, price: 150000, modifiers: [] },
        { id: 5, name: 'Rượu Vang Đỏ (Ly)', quantity: 1, price: 40000, modifiers: [] }
      ],
      createdAt: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      id: 'ORD-0049',
      tableNumber: 'T8',
      status: 'accepted',
      items: [
        { id: 6, name: 'Bít Tết Bò', quantity: 1, price: 160000, modifiers: ['Tái vừa'] },
        { id: 7, name: 'Khoai Tây Chiên', quantity: 1, price: 30000, modifiers: [] }
      ],
      createdAt: new Date(Date.now() - 8 * 60 * 1000)
    },
    {
      id: 'ORD-0047',
      tableNumber: 'T1',
      status: 'ready',
      items: [
        { id: 8, name: 'Cá Hồi Nướng', quantity: 1, price: 90000, modifiers: [] },
        { id: 9, name: 'Salad Caesar', quantity: 1, price: 60000, modifiers: [] }
      ],
      createdAt: new Date(Date.now() - 12 * 60 * 1000)
    }
  ];

  // Simulate API call with polling
  useEffect(() => {
    const fetchOrders = () => {
      setLoading(true);
      // Simulate API delay
      setTimeout(() => {
        setOrders(mockOrders);
        setLoading(false);
      }, 500);
    };

    fetchOrders();

    // Polling every 10 seconds for new orders
    const interval = setInterval(fetchOrders, 10000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Vừa xong';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    return `${hours} giờ trước`;
  };

  const handleAcceptOrder = (orderId) => {
    toast.loading('Đang chấp nhận đơn...', { id: 'accept' });
    
    // Simulate API call
    setTimeout(() => {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'accepted', isNew: false } : order
      ));
      toast.success('Đã chấp nhận và gửi vào bếp!', { id: 'accept' });
    }, 500);
  };

  const handleRejectOrder = () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    toast.loading('Đang từ chối đơn...', { id: 'reject' });
    
    // Simulate API call
    setTimeout(() => {
      setOrders(orders.filter(order => order.id !== rejectModal.orderId));
      setRejectModal({ open: false, orderId: null });
      setRejectReason('');
      toast.success('Đã từ chối đơn hàng', { id: 'reject' });
    }, 500);
  };

  const handleMarkServed = (orderId) => {
    toast.loading('Đang cập nhật...', { id: 'served' });
    
    // Simulate API call
    setTimeout(() => {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'served' } : order
      ));
      toast.success('Đã đánh dấu đã phục vụ!', { id: 'served' });
    }, 500);
  };

  const openRejectModal = (orderId) => {
    setRejectModal({ open: true, orderId });
    setRejectReason('');
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, orderId: null });
    setRejectReason('');
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'accepted') return order.status === 'accepted';
    if (activeTab === 'ready') return order.status === 'ready';
    return true;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const newOrdersCount = orders.filter(o => o.isNew).length;

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { label: 'Chờ Xác Nhận', class: 'pending' },
      accepted: { label: 'Đang Nấu', class: 'preparing' },
      ready: { label: 'Sẵn Sàng', class: 'ready' },
      served: { label: 'Đã Phục Vụ', class: 'served' }
    };
    return statusMap[status] || statusMap.pending;
  };

  return (
    <div className="waiter-container">
      {/* Header */}
      <div className="waiter-header">
        <h1>Quản Lý Đơn Hàng</h1>
        <div className="waiter-profile">
          <div className="notification-bell">
            <span style={{ fontSize: '28px', lineHeight: '1' }}>📺</span>
          </div>
          <div className="waiter-avatar">TN</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="waiter-tabs">
        <button 
          className={`waiter-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Chờ Xác Nhận
          {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
        </button>
        <button 
          className={`waiter-tab ${activeTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          Đã Chấp Nhận
        </button>
        <button 
          className={`waiter-tab ${activeTab === 'ready' ? 'active' : ''}`}
          onClick={() => setActiveTab('ready')}
        >
          Sẵn Sàng
        </button>
        <button 
          className={`waiter-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tất Cả Bàn
        </button>
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner"></div>
            <p>Đang tải đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Không có đơn hàng</h3>
            <p>Chưa có đơn hàng nào trong mục này</p>
          </div>
        ) : (
          filteredOrders
            .sort((a, b) => b.createdAt - a.createdAt)
            .map(order => (
              <div key={order.id} className={`order-card ${order.isNew ? 'new' : ''}`}>
                <div className="order-header">
                  <div className="order-table">
                    <div className="table-number">{order.tableNumber}</div>
                    <div className="order-info">
                      <strong>#{order.id}</strong><br />
                      <span>{order.items.length} món</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`status-tag ${getStatusTag(order.status).class}`}>
                      {getStatusTag(order.status).label}
                    </span>
                    <div className={`order-time ${order.isNew ? 'urgent' : ''}`}>
                      {getTimeAgo(order.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map(item => (
                    <div key={item.id} className="order-item">
                      <div style={{ display: 'flex' }}>
                        <span className="item-qty">{item.quantity}x</span>
                        <div>
                          <div className="item-name">{item.name}</div>
                          {item.modifiers.length > 0 && (
                            <div className="item-mods">{item.modifiers.join(', ')}</div>
                          )}
                          {item.note && (
                            <div className="item-notes">Ghi chú: {item.note}</div>
                          )}
                        </div>
                      </div>
                      <span>{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-actions">
                  {order.status === 'pending' && (
                    <>
                      <button 
                        className="btn-reject"
                        onClick={() => openRejectModal(order.id)}
                      >
                        Từ Chối
                      </button>
                      <button 
                        className="btn-accept"
                        onClick={() => handleAcceptOrder(order.id)}
                      >
                        Chấp Nhận & Gửi Bếp
                      </button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <button className="btn-serve" style={{ flex: 1 }}>
                      Xem Trong Bếp
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button 
                      className="btn-serve" 
                      style={{ flex: 1, background: '#27ae60' }}
                      onClick={() => handleMarkServed(order.id)}
                    >
                      Đánh Dấu Đã Phục Vụ
                    </button>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <>
          <div className="modal-overlay" onClick={closeRejectModal}></div>
          <div className="reject-modal">
            <div className="reject-modal-header">
              <h3>Từ Chối Đơn Hàng</h3>
              <button className="close-btn" onClick={closeRejectModal}>×</button>
            </div>
            <div className="reject-modal-body">
              <p>Vui lòng nhập lý do từ chối đơn hàng #{rejectModal.orderId}</p>
              <textarea
                className="reject-reason"
                placeholder="Ví dụ: Hết nguyên liệu, khách hàng yêu cầu hủy..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="4"
              ></textarea>
            </div>
            <div className="reject-modal-footer">
              <button className="btn-cancel" onClick={closeRejectModal}>
                Hủy
              </button>
              <button className="btn-confirm-reject" onClick={handleRejectOrder}>
                Xác Nhận Từ Chối
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
