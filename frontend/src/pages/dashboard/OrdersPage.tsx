import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Input, Card, Modal, message, Select, Drawer, Divider } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface OrderItemType {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderType {
  key: string;
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_status: string;
  order_status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items?: OrderItemType[];
}

const OrdersPage = () => {
  const [data, setData] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/orders/all/list');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const orders = await response.json();
      const formattedData = orders.map((order: any) => ({
        ...order,
        key: order.id.toString()
      }));
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (record: OrderType) => {
    try {
      const response = await fetch(`http://localhost:5001/api/orders/detail/${record.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      const data = await response.json();
      setSelectedOrder({ ...record, items: data.items });
      setIsDrawerOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      message.error('Failed to load order details');
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    try {
      setIsUpdatingStatus(true);
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      message.success('Order status updated');
      fetchOrders();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const cancelOrder = (record: OrderType) => {
    Modal.confirm({
      title: 'Cancel Order',
      content: `Are you sure you want to cancel order ${record.order_number}?`,
      okText: 'Yes, Cancel',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:5001/api/orders/${record.id}/cancel`, {
            method: 'PUT'
          });

          if (!response.ok) {
            throw new Error('Failed to cancel order');
          }

          message.success('Order cancelled successfully');
          fetchOrders();
        } catch (error) {
          console.error('Error cancelling order:', error);
          message.error('Failed to cancel order');
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'processing';
      case 'processing':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredData = data.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchText.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchText.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || order.order_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<OrderType> = [
    {
      title: 'Order ID',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text) => <span className="font-medium">{text}</span>,
      responsive: ['md'],
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Email',
      dataIndex: 'customer_email',
      key: 'customer_email',
      responsive: ['lg'],
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (total) => `₦${parseFloat(total).toLocaleString('en-NG')}`,
      sorter: (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount),
    },
    {
      title: 'Status',
      dataIndex: 'order_status',
      key: 'order_status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Processing', value: 'processing' },
        { text: 'Shipped', value: 'shipped' },
        { text: 'Delivered', value: 'delivered' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.order_status === value,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      responsive: ['md'],
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => viewOrderDetails(record)}
          >
            View
          </Button>
          {record.order_status !== 'cancelled' && (
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => cancelOrder(record)}
            >
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-base sm:text-xl font-bold">Order Management</h2>
      </div>
      
      <Card className="overflow-hidden" style={{ padding: '12px 14px' }}>
        <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search orders..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 min-w-0 w-full sm:w-auto"
            size="small"
            style={{ fontSize: '12px' }}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            className="w-full sm:w-36"
            value={statusFilter}
            onChange={setStatusFilter}
            size="small"
            style={{ fontSize: '12px' }}
          >
            <Select.Option value="processing">Processing</Select.Option>
            <Select.Option value="shipped">Shipped</Select.Option>
            <Select.Option value="delivered">Delivered</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
          </Select>
        </div>
        
        <div className="overflow-x-auto">
          <Table 
            columns={columns} 
            dataSource={filteredData} 
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        </div>
      </Card>

      {/* Order Details Drawer */}
      <Drawer
        title={`Order - ${selectedOrder?.order_number}`}
        placement="right"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={Math.min(480, window.innerWidth - 20)}
        bodyStyle={{ padding: '10px 12px' }}
        headerStyle={{ padding: '10px 14px' }}
      >
        {selectedOrder && (
          <div className="flex flex-col gap-4">
            {/* Customer Info */}
            <div>
              <h3 className="font-bold text-sm mb-2">Customer Information</h3>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div>
                  <span className="font-semibold">Name:</span> {selectedOrder.customer_name}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {selectedOrder.customer_email}
                </div>
                <div>
                  <span className="font-semibold">Phone:</span> {selectedOrder.customer_phone}
                </div>
              </div>
            </div>

            <Divider style={{ margin: '6px 0' }} />

            {/* Delivery Address */}
            <div>
              <h3 className="font-bold text-sm mb-2">Delivery Address</h3>
              <div className="text-xs space-y-0.5">
                <div>{selectedOrder.street_address}</div>
                <div>{selectedOrder.city}, {selectedOrder.state} {selectedOrder.postal_code}</div>
                <div>{selectedOrder.country}</div>
              </div>
            </div>

            <Divider style={{ margin: '6px 0' }} />

            {/* Order Items */}
            <div>
              <h3 className="font-bold text-sm mb-2">Order Items</h3>
              <div className="space-y-1">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs border-b pb-1">
                    <span>{item.product_name} (x{item.quantity})</span>
                    <span>₦{parseFloat(item.subtotal.toString()).toLocaleString('en-NG')}</span>
                  </div>
                ))}
              </div>
            </div>

            <Divider style={{ margin: '6px 0' }} />

            {/* Order Summary */}
            <div>
              <h3 className="font-bold text-sm mb-2">Order Summary</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₦{parseFloat(selectedOrder.subtotal.toString()).toLocaleString('en-NG')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>₦{parseFloat(selectedOrder.delivery_fee.toString()).toLocaleString('en-NG')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t pt-1">
                  <span>Total:</span>
                  <span>₦{parseFloat(selectedOrder.total_amount.toString()).toLocaleString('en-NG')}</span>
                </div>
              </div>
            </div>

            <Divider style={{ margin: '6px 0' }} />

            {/* Order Status */}
            <div>
              <h3 className="font-bold text-sm mb-2">Order Status</h3>
              <div className="mb-2">
                <Tag color={getStatusColor(selectedOrder.order_status)}>
                  {selectedOrder.order_status.toUpperCase()}
                </Tag>
              </div>

              {selectedOrder.order_status !== 'cancelled' && selectedOrder.order_status !== 'delivered' && (
                <div className="space-y-1">
                  {selectedOrder.order_status === 'processing' && (
                    <Button 
                      type="primary" 
                      block
                      size="small"
                      loading={isUpdatingStatus}
                      onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                    >
                      Mark as Shipped
                    </Button>
                  )}
                  {selectedOrder.order_status === 'shipped' && (
                    <Button 
                      type="primary" 
                      block
                      size="small"
                      loading={isUpdatingStatus}
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              )}

              {selectedOrder.order_status !== 'cancelled' && selectedOrder.order_status !== 'delivered' && (
                <Button 
                  danger 
                  block
                  size="small"
                  className="mt-1"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    cancelOrder(selectedOrder);
                  }}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default OrdersPage;
