import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Tag, Popconfirm, message, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface ClassBooking {
  id: string;
  name: string;
  email: string;
  phone: string;
  course_type: string;
  level: string;
  duration: string;
  special_requests: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

const ClassesPage = () => {
  const [bookings, setBookings] = useState<ClassBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ClassBooking | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Fetch all class bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/booking');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      message.error('Failed to load class bookings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle view booking
  const handleView = (record: ClassBooking) => {
    setSelectedBooking(record);
    setIsViewModalVisible(true);
  };

  // Handle edit booking
  const handleEdit = (record: ClassBooking) => {
    setSelectedBooking(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      course_type: record.course_type,
      level: record.level,
      status: record.status,
      special_requests: record.special_requests,
    });
    setIsModalVisible(true);
  };

  // Handle update booking
  const handleUpdate = async (values: any) => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(`http://localhost:5001/api/booking/${selectedBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      message.success('Booking updated successfully');
      setIsModalVisible(false);
      form.resetFields();
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      message.error('Failed to update booking');
      console.error(error);
    }
  };

  // Handle delete booking
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/booking/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      message.success('Booking deleted successfully');
      fetchBookings();
    } catch (error) {
      message.error('Failed to delete booking');
      console.error(error);
    }
  };

  // Filter bookings based on search text
  const filteredBookings = bookings.filter(booking =>
    booking.name.toLowerCase().includes(searchText.toLowerCase()) ||
    booking.email.toLowerCase().includes(searchText.toLowerCase()) ||
    booking.phone.includes(searchText) ||
    booking.course_type.toLowerCase().includes(searchText.toLowerCase())
  );

  // Status tag color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'confirmed':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<ClassBooking> = [
    {
      title: 'Student Name',
      dataIndex: 'name',
      key: 'name',
      // always visible
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    // Email and Phone removed from table; visible in details modal only
    {
      title: 'Course',
      dataIndex: 'course_type',
      key: 'course_type',
      responsive: ['sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      responsive: ['md', 'lg', 'xl'],
      filters: [
        { text: 'Beginner', value: 'Beginner' },
        { text: 'Intermediate', value: 'Intermediate' },
        { text: 'Advanced', value: 'Advanced' },
      ],
      onFilter: (value, record) => record.level === value,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      responsive: ['lg', 'xl'],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Confirmed', value: 'confirmed' },
        { text: 'Completed', value: 'completed' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Date Booked',
      dataIndex: 'created_at',
      key: 'created_at',
      responsive: ['md', 'lg', 'xl'],
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            title="View Details"
          />
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          
          <Popconfirm
            title="Delete Booking"
            description="Are you sure you want to delete this booking?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Input
          placeholder="Search by name, email, phone, or course..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: '300px' }}
        />
        <Button type="primary" onClick={fetchBookings} loading={loading}>
          Refresh
        </Button>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} bookings`,
          }}
          scroll={{ x: '100%' }}
        />
      </Spin>

      {/* View Modal */}
      <Modal
        title="Class Booking Details"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <strong>Student Name:</strong> {selectedBooking.name}
            </div>
            <div>
              <strong>Email:</strong> {selectedBooking.email}
            </div>
            <div>
              <strong>Phone:</strong> {selectedBooking.phone}
            </div>
            <div>
              <strong>Course:</strong> {selectedBooking.course_type}
            </div>
            <div>
              <strong>Level:</strong> {selectedBooking.level}
            </div>
            <div>
              <strong>Duration:</strong> {selectedBooking.duration}
            </div>
            <div>
              <strong>Status:</strong>{' '}
              <Tag color={getStatusColor(selectedBooking.status)}>
                {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
              </Tag>
            </div>
            <div>
              <strong>Special Requests:</strong> {selectedBooking.special_requests || 'None'}
            </div>
            <div>
              <strong>Date Booked:</strong> {new Date(selectedBooking.created_at).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Class Booking"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedBooking(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsModalVisible(false);
            form.resetFields();
            setSelectedBooking(null);
          }}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            Update
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            label="Student Name"
            name="name"
            rules={[{ required: true, message: 'Please enter student name' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please enter email' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Please enter phone' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Course Type"
            name="courseType"
            rules={[{ required: true, message: 'Please select course' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Level"
            name="level"
            rules={[{ required: true, message: 'Please select level' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="confirmed">Confirmed</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Special Requests"
            name="specialRequests"
          >
            <Input.TextArea rows={3} disabled />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassesPage;
