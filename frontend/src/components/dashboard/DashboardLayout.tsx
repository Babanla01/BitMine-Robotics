import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  DashboardOutlined, 
  UserOutlined, 
  ShoppingCartOutlined, 
  ShoppingOutlined, 
  BarChartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  TeamOutlined,
  BookOutlined,
  FolderOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

import type { ReactNode } from 'react'

const DashboardLayout = ({ children }: { children?: ReactNode }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', path: '/dashboard' },
    { key: 'users', icon: <UserOutlined />, label: 'Users', path: '/dashboard/users' },
    { key: 'categories', icon: <FolderOutlined />, label: 'Categories', path: '/dashboard/categories' },
    { key: 'products', icon: <ShoppingCartOutlined />, label: 'Products', path: '/dashboard/products' },
    { key: 'orders', icon: <ShoppingOutlined />, label: 'Orders', path: '/dashboard/orders' },
    { key: 'classes', icon: <BookOutlined />, label: 'Classes', path: '/dashboard/classes' },
    { key: 'tutors', icon: <FileTextOutlined />, label: 'Tutors', path: '/dashboard/tutors' },
    { key: 'partners', icon: <TeamOutlined />, label: 'Partners', path: '/dashboard/partners' },
    { key: 'analytics', icon: <BarChartOutlined />, label: 'Analytics', path: '/dashboard/analytics' },
  ];

  const selectedKey = menuItems.find(item => location.pathname.startsWith(item.path))?.key || 'dashboard';

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f5f7fa', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside 
        style={{
          width: collapsed ? '80px' : '260px',
          backgroundColor: '#1a1f3a',
          color: 'white',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflowY: 'auto',
        }}
      >
        {/* Logo Section */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {!collapsed && <span style={{ fontSize: '18px', fontWeight: 'bold' }}>BitMine Admin</span>}
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1, paddingTop: '20px' }}>
          {menuItems.map(item => (
            <Link
              key={item.key}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                color: selectedKey === item.key ? '#3b82f6' : 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                borderLeft: selectedKey === item.key ? '4px solid #3b82f6' : 'none',
                backgroundColor: selectedKey === item.key ? 'rgba(59,130,246,0.1)' : 'transparent',
                transition: 'all 0.2s ease',
                fontSize: '14px',
              }}
              onMouseEnter={(e) => {
                if (selectedKey !== item.key) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedKey !== item.key) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            backgroundColor: 'rgba(255,59,48,0.1)',
            border: 'none',
            color: '#ff3b30',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.2s ease',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,59,48,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,59,48,0.1)';
          }}
        >
          <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>
            <LogoutOutlined />
          </span>
          {!collapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <header style={{
          backgroundColor: 'white',
          padding: '12px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#1a1f3a',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1a1f3a',
              margin: 0,
            }}>
              {menuItems.find(item => item.key === selectedKey)?.label || 'Dashboard'}
            </h2>
          </div>

          {/* User Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              {getInitials(user?.name)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a1f3a' }}>
                {user?.name}
              </span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {user?.email}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          padding: '16px 20px',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            width: '100%',
            maxWidth: '1400px',
          }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
