import { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Card, Modal, Form, message, Tag } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { FormInstance } from 'antd/es/form';
import { useRef } from 'react';

interface UserType {
  key: string;
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const UsersPage = () => {
  const [data, setData] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormInstance>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const users = await response.json();
      const formattedData = users.map((user: any) => ({
        ...user,
        key: user.id.toString()
      }));
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    formRef.current?.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    formRef.current?.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleDelete = (user: UserType) => {
    Modal.confirm({
      title: 'Delete User',
      content: `Are you sure you want to delete ${user.name}?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:5001/api/admin/users/${user.id}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            throw new Error('Failed to delete user');
          }
          message.success('User deleted successfully');
          fetchUsers();
        } catch (error) {
          console.error('Error deleting user:', error);
          message.error('Failed to delete user');
        }
      }
    });
  };

  const handleSubmitForm = async (values: any) => {
    try {
      setIsSubmitting(true);
      
      if (editingUser) {
        // Update existing user
        const response = await fetch(`http://localhost:5001/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            role: values.role
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update user');
        }
        message.success('User updated successfully');
      } else {
        // Create new user
        const response = await fetch('http://localhost:5001/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            password: values.password,
            role: values.role
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create user');
        }
        message.success('User created successfully');
      }
      
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error submitting user form:', error);
      message.error(error instanceof Error ? error.message : 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = data.filter(user =>
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<UserType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'],
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role?.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Join Date',
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-base sm:text-xl font-bold">User Management</h2>
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddUser}>
          Add User
        </Button>
      </div>
      
      <Card className="overflow-hidden" style={{ padding: '12px 14px' }}>
        <div className="mb-3 w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search users..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full sm:w-72"
            size="small"
            style={{ fontSize: 12 }}
          />
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

      {/* Add/Edit User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add New User'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={Math.min(450, window.innerWidth - 20)}
        bodyStyle={{ padding: '12px 14px' }}
      >
        <Form
          ref={formRef}
          layout="vertical"
          onFinish={handleSubmitForm}
        >
          <Form.Item
            label={<span style={{ fontSize: 12 }}>Full Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter full name' }]}
            style={{ marginBottom: 10 }}
          >
            <Input size="small" placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontSize: 12 }}>Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
            style={{ marginBottom: 10 }}
          >
            <Input type="email" size="small" placeholder="Enter email" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label={<span style={{ fontSize: 12 }}>Password</span>}
              name="password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input.Password size="small" placeholder="Enter password" />
            </Form.Item>
          )}

          <Form.Item
            label={<span style={{ fontSize: 12 }}>Role</span>}
            name="role"
            initialValue="user"
            rules={[{ required: true, message: 'Please select role' }]}
            style={{ marginBottom: 10 }}
          >
            <select className="form-select" style={{ width: '100%', padding: '4px 8px', fontSize: 12, borderRadius: 2, border: '1px solid #d9d9d9' }}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </Form.Item>

          <div className="flex gap-2 justify-end">
            <Button size="small" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" size="small" htmlType="submit" loading={isSubmitting}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
