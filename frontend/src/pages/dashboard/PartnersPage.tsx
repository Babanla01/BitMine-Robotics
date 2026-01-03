import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { Table, Button, Space, Tag, Modal, Card, Input, message } from 'antd';
import { SearchOutlined, CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface PartnerApplication {
  key: string;
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  partnership_type: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  created_at: string;
}

const PartnersPage = () => {
  const [data, setData] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<PartnerApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalWidth, setModalWidth] = useState(700);
  const [searchText, setSearchText] = useState('');

  // Calculate modal width responsively
  useEffect(() => {
    const handleResize = () => {
      setModalWidth(Math.min(700, window.innerWidth - 40));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { token } = useAuth();

  useEffect(() => {
    fetchPartnerApplications();
  }, []);

  const fetchPartnerApplications = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/partner`, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch partner applications');
      }
      const applications = await response.json();
      const formattedData = applications.map((app: any) => ({
        ...app,
        key: app.id.toString()
      }));
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching partner applications:', error);
      message.error('Failed to load partner applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (record: PartnerApplication, newStatus: 'approved' | 'rejected' | 'under_review') => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/partner/${record.id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      message.success(`Partnership ${newStatus}`);
      fetchPartnerApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update partnership status');
    }
  };

  const showDetails = (record: PartnerApplication) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'under_review':
        return 'blue';
      default:
        return 'orange';
    }
  };

  const columns: ColumnsType<PartnerApplication> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 50,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Contact',
      dataIndex: 'name',
      key: 'name',
      responsive: ['md'],
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['lg'],
    },
    {
      title: 'Type',
      dataIndex: 'partnership_type',
      key: 'partnership_type',
      responsive: ['md'],
      render: (type) => (
        <Tag color="blue">
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Under Review', value: 'under_review' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
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
            onClick={() => showDetails(record)}
            title="View Details"
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleStatusChange(record, 'approved')}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                title="Approve"
              />
              <Button
                type="primary"
                size="small"
                onClick={() => handleStatusChange(record, 'under_review')}
                style={{ background: '#1890ff', borderColor: '#1890ff' }}
                title="Under Review"
              >
                Review
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleStatusChange(record, 'rejected')}
                title="Reject"
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Partner Applications</h2>
      </div>

      <Card className="overflow-hidden">
        <div className="mb-4 w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search partners..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full sm:w-80"
          />
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} applications`,
              responsive: true,
            }}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        </div>
      </Card>

      {/* Details Modal */}
      <Modal
        title={`Partner Application - ${selectedRecord?.company}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={modalWidth}
      >
        {selectedRecord && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-gray-800 block mb-1">Contact Name</label>
                <p className="text-gray-600 break-words">{selectedRecord.name}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-800 block mb-1">Company</label>
                <p className="text-gray-600 break-words">{selectedRecord.company}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-800 block mb-1">Email</label>
                <p className="text-gray-600 break-all text-sm">{selectedRecord.email}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-800 block mb-1">Phone</label>
                <p className="text-gray-600">{selectedRecord.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-800 block mb-1">Partnership Type</label>
                <p className="text-gray-600">
                  <Tag color="blue">
                    {selectedRecord.partnership_type.toUpperCase()}
                  </Tag>
                </p>
              </div>
              <div>
                <label className="font-semibold text-gray-800 block mb-1">Status</label>
                <Tag color={getStatusColor(selectedRecord.status)}>
                  {selectedRecord.status.toUpperCase()}
                </Tag>
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-800 block mb-1">Collaboration Message</label>
              <p className="text-gray-600 whitespace-pre-wrap break-words">{selectedRecord.message}</p>
            </div>

            <div>
              <label className="font-semibold text-gray-800 block mb-1">Applied Date</label>
              <p className="text-gray-600">{new Date(selectedRecord.created_at).toLocaleString()}</p>
            </div>

            {selectedRecord.status === 'pending' && (
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button
                  type="primary"
                  size="large"
                  block
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => handleStatusChange(selectedRecord, 'approved')}
                >
                  Approve Partnership
                </Button>
                <Button
                  type="primary"
                  size="large"
                  block
                  style={{ background: '#1890ff', borderColor: '#1890ff' }}
                  onClick={() => handleStatusChange(selectedRecord, 'under_review')}
                >
                  Mark as Under Review
                </Button>
                <Button
                  danger
                  size="large"
                  block
                  onClick={() => handleStatusChange(selectedRecord, 'rejected')}
                >
                  Reject Partnership
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PartnersPage;
