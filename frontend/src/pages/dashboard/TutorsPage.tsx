import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { Table, Button, Space, Tag, Modal, Card, Input, message } from 'antd';
import { SearchOutlined, DownloadOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface TutorApplication {
  key: string;
  id: number;
  name: string;
  email: string;
  phone: string;
  education: string;
  experience: string;
  skills: string;
  message: string;
  cv_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const TutorsPage = () => {
  const [data, setData] = useState<TutorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<TutorApplication | null>(null);
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
    fetchTutorApplications();
  }, []);

  const fetchTutorApplications = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/tutor`, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch tutor applications');
      }
      const applications = await response.json();
      const formattedData = applications.map((app: any) => ({
        ...app,
        key: app.id.toString()
      }));
      setData(formattedData);
    } catch (error) {
      console.error('Error fetching tutor applications:', error);
      message.error('Failed to load tutor applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = async (record: TutorApplication) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/tutor/${record.id}/download-cv`, { headers });
      if (!response.ok) {
        throw new Error('Failed to download CV');
      }
      
      const blob = await response.blob();
      const filename = record.cv_url.split('/').pop() || `${record.name}_CV`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success('CV downloaded successfully');
    } catch (error) {
      console.error('Error downloading CV:', error);
      message.error('Failed to download CV');
    }
  };

  const handleStatusChange = async (record: TutorApplication, newStatus: 'approved' | 'rejected') => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/tutor/${record.id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      message.success(`Application ${newStatus}`);
      fetchTutorApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update application status');
    }
  };

  const showDetails = (record: TutorApplication) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'orange';
    }
  };

  const columns: ColumnsType<TutorApplication> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 50,
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
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      responsive: ['lg'],
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
            type="primary"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadCV(record)}
            disabled={!record.cv_url}
            title="Download CV"
          />
          <Button
            type="link"
            size="small"
            onClick={() => showDetails(record)}
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
        <h2 className="text-xl sm:text-2xl font-bold">Tutor Applications</h2>
      </div>

      <Card className="overflow-hidden">
        <div className="mb-4 w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search tutors..."
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
        title={`Tutor Application - ${selectedRecord?.name}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={modalWidth}
        className="responsive-modal"
      >
        {selectedRecord && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-gray-800 block mb-1">Full Name</label>
                <p className="text-gray-600 break-words">{selectedRecord.name}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-800 block mb-1">Email</label>
                <p className="text-gray-600 break-all text-sm">{selectedRecord.email}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-800 block mb-1">Phone</label>
                <p className="text-gray-600">{selectedRecord.phone}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-800 block mb-1">Status</label>
                <Tag color={getStatusColor(selectedRecord.status)}>
                  {selectedRecord.status.toUpperCase()}
                </Tag>
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-800 block mb-1">Education</label>
              <p className="text-gray-600 break-words">{selectedRecord.education}</p>
            </div>

            <div>
              <label className="font-semibold text-gray-800 block mb-1">Technical Skills</label>
              <p className="text-gray-600 break-words">{selectedRecord.skills}</p>
            </div>

            <div>
              <label className="font-semibold text-gray-800 block mb-1">Teaching/Tutoring Experience</label>
              <p className="text-gray-600 whitespace-pre-wrap break-words">{selectedRecord.experience}</p>
            </div>

            <div>
              <label className="font-semibold text-gray-800 block mb-1">Message</label>
              <p className="text-gray-600 whitespace-pre-wrap break-words">{selectedRecord.message}</p>
            </div>

            <div>
              <label className="font-semibold text-gray-800 block mb-1">Applied Date</label>
              <p className="text-gray-600">{new Date(selectedRecord.created_at).toLocaleString()}</p>
            </div>

            {selectedRecord.cv_url && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadCV(selectedRecord)}
                size="large"
                block
              >
                Download CV
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TutorsPage;
