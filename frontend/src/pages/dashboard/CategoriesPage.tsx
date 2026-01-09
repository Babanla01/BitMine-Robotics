import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Tabs,
  Card,
  Collapse,
  Empty,
  Spin,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { API_BASE_URL, apiCall } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface Category {
  id: number;
  name: string;
  description?: string;
  subcategories?: Subcategory[];
  created_at: string;
  updated_at: string;
}

interface Subcategory {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  created_at: string;
  updated_at: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubcategoryModalVisible, setIsSubcategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [subForm] = Form.useForm();
  const { token } = useAuth();

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiCall(`${API_BASE_URL}/categories`, {}, token);
      setCategories(Array.isArray(response) ? response : []);
    } catch (error) {
      message.error('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== CATEGORY HANDLERS =====

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    setIsModalVisible(true);
  };

  const handleCategorySubmit = async (values: { name: string; description?: string }) => {
    try {
      if (editingCategory) {
        await apiCall(`${API_BASE_URL}/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
          headers: { 'Content-Type': 'application/json' },
        }, token);
        message.success('Category updated successfully');
      } else {
        await apiCall(`${API_BASE_URL}/categories`, {
          method: 'POST',
          body: JSON.stringify(values),
          headers: { 'Content-Type': 'application/json' },
        }, token);
        message.success('Category created successfully');
      }
      setIsModalVisible(false);
      fetchCategories();
    } catch (error: any) {
      message.error(error.error || error.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await apiCall(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' }, token);
      message.success('Category deleted successfully');
      fetchCategories();
    } catch (error: any) {
      message.error(error.error || 'Failed to delete category');
    }
  };

  // ===== SUBCATEGORY HANDLERS =====

  const handleAddSubcategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setEditingSubcategory(null);
    subForm.resetFields();
    setIsSubcategoryModalVisible(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSelectedCategoryId(subcategory.category_id);
    subForm.setFieldsValue({
      name: subcategory.name,
      description: subcategory.description,
    });
    setIsSubcategoryModalVisible(true);
  };

  const handleSubcategorySubmit = async (values: { name: string; description?: string }) => {
    try {
      if (editingSubcategory) {
        await apiCall(`${API_BASE_URL}/categories/subcategories/${editingSubcategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
          headers: { 'Content-Type': 'application/json' },
        }, token);
        message.success('Subcategory updated successfully');
      } else {
        await apiCall(`${API_BASE_URL}/categories/${selectedCategoryId}/subcategories`, {
          method: 'POST',
          body: JSON.stringify(values),
          headers: { 'Content-Type': 'application/json' },
        }, token);
        message.success('Subcategory created successfully');
      }
      setIsSubcategoryModalVisible(false);
      fetchCategories();
    } catch (error: any) {
      message.error(error.error || error.message || 'Failed to save subcategory');
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    try {
      await apiCall(`${API_BASE_URL}/categories/subcategories/${id}`, { method: 'DELETE' }, token);
      message.success('Subcategory deleted successfully');
      fetchCategories();
    } catch (error: any) {
      message.error(error.error || error.message || 'Failed to delete subcategory');
    }
  };

  // ===== TABLE SETUP =====

  const subcategoryColumns: ColumnsType<Subcategory> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
      render: (text) => text || '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditSubcategory(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Subcategory"
            description="Are you sure you want to delete this subcategory?"
            onConfirm={() => handleDeleteSubcategory(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const categoryColumns: ColumnsType<Category> = [
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '35%',
      render: (text) => text || '—',
    },
    {
      title: 'Subcategories',
      key: 'subcategoryCount',
      width: '15%',
      render: (_, record) => (
        <span>
          {record.subcategories && record.subcategories.length > 0
            ? `${record.subcategories.length} items`
            : 'None'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Category"
            description="Are you sure you want to delete this category? All subcategories will also be deleted."
            onConfirm={() => handleDeleteCategory(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ===== RENDER =====

  const collapsedItems = (categories || []).map((category) => ({
    key: category.id.toString(),
    label: (
      <Space>
        <FolderOutlined />
        <strong>{category.name}</strong>
        {category.description && <span style={{ color: '#999' }}>({category.description})</span>}
        <span style={{ marginLeft: '20px', color: '#999' }}>
          {category.subcategories?.length || 0} subcategories
        </span>
      </Space>
    ),
    extra: (
      <Space size="small" onClick={(e) => e.stopPropagation()}>
        <Button
          type="text"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleAddSubcategory(category.id)}
        >
          Add Sub
        </Button>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEditCategory(category)}
        >
          Edit
        </Button>
        <Popconfirm
          title="Delete Category"
          description="Are you sure you want to delete this category? All subcategories will also be deleted."
          onConfirm={() => handleDeleteCategory(category.id)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" size="small" icon={<DeleteOutlined />} danger>
            Delete
          </Button>
        </Popconfirm>
      </Space>
    ),
    children:
      category.subcategories && category.subcategories.length > 0 ? (
        <Table
          columns={subcategoryColumns}
          dataSource={category.subcategories.map((sub) => ({
            ...sub,
            key: sub.id,
          }))}
          pagination={false}
          size="small"
          bordered
        />
      ) : (
        <Empty description="No subcategories yet" />
      ),
  }));

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title={
          <Space>
            <FolderOutlined />
            <span>Categories Management</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
            Add Category
          </Button>
        }
      >
        <Spin spinning={loading}>
          {categories.length > 0 ? (
            <Collapse items={collapsedItems} />
          ) : (
            <Empty description="No categories yet" />
          )}
        </Spin>
      </Card>

      {/* Category Modal */}
      <Modal
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} onFinish={handleCategorySubmit} layout="vertical">
          <Form.Item
            label="Category Name"
            name="name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="e.g., Robotics Kits" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea
              placeholder="Optional description"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        title={editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
        open={isSubcategoryModalVisible}
        onOk={() => subForm.submit()}
        onCancel={() => setIsSubcategoryModalVisible(false)}
      >
        <Form form={subForm} onFinish={handleSubcategorySubmit} layout="vertical">
          <Form.Item
            label="Subcategory Name"
            name="name"
            rules={[{ required: true, message: 'Please enter subcategory name' }]}
          >
            <Input placeholder="e.g., Beginner Kit" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea
              placeholder="Optional description"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;

