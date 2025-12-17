import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Package, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  delivery_fee: number;
  order_status: string;
  created_at: string;
  delivery_address?: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchUserOrders();
    }
  }, [user?.email]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/orders/customer/${user?.email}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        addToast('Failed to fetch orders', 'error');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      addToast('Error fetching orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/orders/detail/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderDetails(order.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#10b981';
      case 'shipped':
        return '#3b82f6';
      case 'processing':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      delivered: 'badge-success',
      shipped: 'badge-info',
      processing: 'badge-warning',
      cancelled: 'badge-danger',
    };
    return colors[status] || 'badge-secondary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {selectedOrder ? (
        // Order Details View
        <div>
          <button
            className="btn btn-light mb-4 d-flex align-items-center gap-2"
            onClick={() => {
              setSelectedOrder(null);
              setOrderItems([]);
            }}
          >
            <ArrowLeft size={20} />
            Back to Orders
          </button>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">Order #{selectedOrder.order_number}</h5>
                  <p className="text-muted mb-0">
                    <Calendar size={16} className="me-2" />
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
                <div>
                  <span
                    className={`badge ${getStatusBadge(selectedOrder.order_status)}`}
                    style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {selectedOrder.order_status}
                  </span>
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* Order Status Timeline */}
              <div className="mb-4">
                <h6 className="mb-3">Order Status</h6>
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: getStatusColor(selectedOrder.order_status),
                      color: 'white',
                    }}
                  >
                    <Package size={16} />
                  </div>
                  <div>
                    <strong className="text-capitalize">{selectedOrder.order_status}</strong>
                    <p className="text-muted mb-0 small">
                      {selectedOrder.order_status === 'delivered'
                        ? 'Your order has been delivered'
                        : selectedOrder.order_status === 'shipped'
                          ? 'Your order is on its way'
                          : selectedOrder.order_status === 'processing'
                            ? 'We are processing your order'
                            : 'Your order has been cancelled'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-4">
                <h6 className="mb-3">Items Ordered</h6>
                <div className="table-responsive">
                  <table className="table table-sm border">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="row">
                <div className="col-md-6">
                  <div className="card bg-light border-0">
                    <div className="card-body">
                      <h6 className="card-title">Delivery Address</h6>
                      <p className="mb-0">
                        <MapPin size={16} className="me-2" />
                        {selectedOrder.delivery_address || 'No address provided'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-light border-0">
                    <div className="card-body">
                      <h6 className="card-title">Order Total</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(selectedOrder.total_amount - selectedOrder.delivery_fee)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                        <span>Delivery Fee:</span>
                        <span>{formatCurrency(selectedOrder.delivery_fee)}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <strong>Total:</strong>
                        <strong>{formatCurrency(selectedOrder.total_amount)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="mb-3">Contact Information</h6>
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-0">
                      <strong>Name:</strong> {selectedOrder.customer_name}
                    </p>
                    <p className="mb-0">
                      <strong>Email:</strong> {selectedOrder.customer_email}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-0">
                      <strong>Phone:</strong> {selectedOrder.customer_phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Orders List View
        <div>
          <div className="d-flex align-items-center gap-2 mb-4">
            <Link to="/shop" className="btn btn-light btn-sm">
              <ArrowLeft size={16} />
            </Link>
            <h3 className="mb-0">My Orders</h3>
          </div>

          {orders.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5">
              <Package size={48} className="mx-auto text-muted mb-3" />
              <p className="text-muted">No orders yet</p>
              <Link to="/shop" className="btn btn-primary btn-sm">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="row g-3">
              {orders.map((order) => (
                <div key={order.id} className="col-12">
                  <div
                    className="card border-0 shadow-sm cursor-pointer"
                    onClick={() => handleOrderClick(order)}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-md-4">
                          <p className="text-muted small mb-1">Order ID</p>
                          <h6 className="mb-0">#{order.order_number}</h6>
                        </div>
                        <div className="col-md-4">
                          <p className="text-muted small mb-1">Date</p>
                          <h6 className="mb-0">{formatDate(order.created_at)}</h6>
                        </div>
                        <div className="col-md-2">
                          <p className="text-muted small mb-1">Amount</p>
                          <h6 className="mb-0">{formatCurrency(order.total_amount)}</h6>
                        </div>
                        <div className="col-md-2 d-flex align-items-end justify-content-end">
                          <span
                            className={`badge ${getStatusBadge(order.order_status)}`}
                            style={{
                              padding: '8px 12px',
                              fontSize: '12px',
                              textTransform: 'capitalize',
                            }}
                          >
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
