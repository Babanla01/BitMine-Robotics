import { Card, Row, Col, Select } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from 'react';

const { Option } = Select;

interface Order {
  id: number;
  total_amount: number;
  created_at: string;
  order_status: string;
}

interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  salesData: Array<{ name: string; sales: number }>;
  revenueData: Array<{ name: string; revenue: number }>;
}

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    salesData: [],
    revenueData: [],
  });

  const [loading, setLoading] = useState(true);

  const categoryData = [
    { name: 'Electronics', value: 400 },
    { name: 'Clothing', value: 300 },
    { name: 'Books', value: 200 },
    { name: 'Home', value: 200 },
    { name: 'Other', value: 100 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch orders data
      const ordersResponse = await fetch('http://localhost:5001/api/orders/all/list');
      const ordersData: Order[] = ordersResponse.ok ? await ordersResponse.json() : [];

      // Fetch users count
      const usersResponse = await fetch('http://localhost:5001/api/users');
      const usersData = usersResponse.ok ? await usersResponse.json() : [];

      // Calculate stats
      const totalOrders = ordersData.length;
      const totalSales = ordersData.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0);
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      const totalCustomers = usersData.length;

      // Generate monthly data from orders
      const monthlyData: { [key: string]: { sales: number; revenue: number; count: number } } = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      ordersData.forEach(order => {
        const date = new Date(order.created_at);
        const monthName = months[date.getMonth()];
        
        if (!monthlyData[monthName]) {
          monthlyData[monthName] = { sales: 0, revenue: 0, count: 0 };
        }
        
        monthlyData[monthName].count += 1;
        monthlyData[monthName].sales += parseFloat(order.total_amount.toString());
        monthlyData[monthName].revenue += parseFloat(order.total_amount.toString());
      });

      // Format data for charts
      const salesData = months.map(month => ({
        name: month,
        sales: monthlyData[month]?.count || 0,
      }));

      const revenueData = months.map(month => ({
        name: month,
        revenue: Math.round(monthlyData[month]?.revenue || 0),
      }));

      setAnalytics({
        totalSales,
        totalOrders,
        totalCustomers,
        averageOrderValue,
        salesData,
        revenueData,
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Analytics Dashboard</h2>
        <Select defaultValue="last30" style={{ width: '100%', maxWidth: 200 }} size="small">
          <Option value="last7">Last 7 Days</Option>
          <Option value="last30">Last 30 Days</Option>
          <Option value="last90">Last 90 Days</Option>
          <Option value="thisYear">This Year</Option>
        </Select>
      </div>

      <Row gutter={[12, 12]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <div className="text-xs text-gray-500 mb-1">Total Sales</div>
            <div className="text-lg sm:text-xl font-bold truncate">₦{analytics.totalSales.toLocaleString('en-NG', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-green-500">From {analytics.totalOrders} orders</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <div className="text-xs text-gray-500 mb-1">Total Orders</div>
            <div className="text-lg sm:text-xl font-bold">{analytics.totalOrders}</div>
            <div className="text-xs text-green-500">{analytics.totalOrders > 0 ? '+' : '0'} orders</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <div className="text-xs text-gray-500 mb-1">Total Customers</div>
            <div className="text-lg sm:text-xl font-bold">{analytics.totalCustomers}</div>
            <div className="text-xs text-green-500">{analytics.totalCustomers} users</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <div className="text-xs text-gray-500 mb-1">Avg Order Value</div>
            <div className="text-lg sm:text-xl font-bold truncate">₦{Math.round(analytics.averageOrderValue).toLocaleString('en-NG')}</div>
            <div className="text-xs text-green-500">Per order</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title="Sales Overview" size="small">
            <div style={{ height: 250, minHeight: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.salesData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={40} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#8884d8" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Categories" size="small">
            <div style={{ height: 250, minHeight: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent = 0 }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24}>
          <Card title="Revenue Trend" size="small">
            <div style={{ height: 250, minHeight: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={60} />
                  <Tooltip formatter={(value) => `₦${(value as number).toLocaleString('en-NG')}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsPage;
