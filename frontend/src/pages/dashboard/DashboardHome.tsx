import { ArrowUpOutlined, ShoppingCartOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

interface Stat {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change: number;
  color: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

const DashboardHome = () => {
  const [stats, setStats] = useState<Stat[]>([
    { title: 'Total Users', value: 0, icon: <UserOutlined />, change: 0, color: '#3b82f6' },
    { title: 'Total Products', value: 0, icon: <ShoppingCartOutlined />, change: 0, color: '#10b981' },
    { title: 'Total Orders', value: 0, icon: <ShoppingCartOutlined />, change: 0, color: '#f59e0b' },
    { title: 'Total Revenue', value: '₦0', icon: <DollarOutlined />, change: 0, color: '#8b5cf6' },
  ]);

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users count
      const usersResponse = await fetch('http://localhost:5001/api/admin/users');
      const usersData = usersResponse.ok ? await usersResponse.json() : [];
      const totalUsers = usersData.length;

      // Fetch products count
      const productsResponse = await fetch('http://localhost:5001/api/products');
      const productsData = productsResponse.ok ? await productsResponse.json() : [];
      const totalProducts = productsData.length;

      // Fetch orders
      const ordersResponse = await fetch('http://localhost:5001/api/orders/all/list');
      const ordersData = ordersResponse.ok ? await ordersResponse.json() : [];
      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce((sum: number, order: Order) => sum + parseFloat(order.total_amount.toString()), 0);

      // Get recent 5 orders
      const recent = ordersData.slice(0, 5);
      setRecentOrders(recent);

      // Update stats
      setStats([
        { 
          title: 'Total Users', 
          value: totalUsers, 
          icon: <UserOutlined />, 
          change: 12, 
          color: '#3b82f6' 
        },
        { 
          title: 'Total Products', 
          value: totalProducts, 
          icon: <ShoppingCartOutlined />, 
          change: 8, 
          color: '#10b981' 
        },
        { 
          title: 'Total Orders', 
          value: totalOrders, 
          icon: <ShoppingCartOutlined />, 
          change: 5, 
          color: '#f59e0b' 
        },
        { 
          title: 'Total Revenue', 
          value: `₦${totalRevenue.toLocaleString('en-NG')}`, 
          icon: <DollarOutlined />, 
          change: 15, 
          color: '#8b5cf6' 
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return '#10b981';
      case 'processing': return '#f59e0b';
      case 'shipped': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div>
      {/* Welcome Section */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1f3a', margin: '0 0 4px 0' }}>
          Welcome back! 👋
        </h1>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
          Here's what's happening with your business today
        </p>
      </div>

      {/* Stats Grid - Improved Responsiveness */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: '10px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '500' }}>
                  {stat.title}
                </p>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1f3a', margin: '0 0 4px 0' }}>
                  {stat.value}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
                  <ArrowUpOutlined style={{ color: '#10b981', fontSize: '10px' }} />
                  <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '500' }}>
                    {stat.change}%
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: stat.color,
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1f3a', margin: 0 }}>
            Recent Orders
          </h2>
          <a href="/dashboard/orders" style={{
            fontSize: '11px',
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: '500',
          }}>
            View all →
          </a>
        </div>
        
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '450px',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#6b7280' }}>Order ID</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#6b7280' }}>Customer</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#6b7280' }}>Amount</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontWeight: '600', color: '#6b7280' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '14px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '14px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order, index) => (
                  <tr key={index} style={{ borderBottom: index < recentOrders.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '500', color: '#1a1f3a' }}>
                      {order.order_number}
                    </td>
                    <td style={{ padding: '8px 12px', fontSize: '11px', color: '#6b7280' }}>
                      {order.customer_name.split(' ')[0]}
                    </td>
                    <td style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '500', color: '#1a1f3a' }}>
                      ₦{parseFloat(order.total_amount.toString()).toLocaleString('en-NG', { maximumFractionDigits: 0 })}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '500',
                        backgroundColor: `${getStatusColor(order.order_status)}15`,
                        color: getStatusColor(order.order_status),
                      }}>
                        {order.order_status.slice(0, 7).toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
