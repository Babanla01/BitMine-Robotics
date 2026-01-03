import { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Card, Modal, Form, InputNumber, Upload, message, Select, Tag } from 'antd';
import { SearchOutlined, PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { API, apiCall, API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

interface ProductType {
  key: string;
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  description?: string;
  age_group?: string;
  skill_level?: string;
}

const ProductsPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalWidth, setModalWidth] = useState(700);
  const { token } = useAuth();

  // Calculate modal width responsively
  useEffect(() => {
    const handleResize = () => {
      setModalWidth(Math.min(700, window.innerWidth - 40));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiCall(API.products);
      const productsData = response.data.map((product: any) => {
        let imageUrl = product.image_url;
        
        // Convert relative URLs to absolute URLs
        if (imageUrl) {
          if (imageUrl.startsWith('/uploads/')) {
            // Make uploads path absolute using API_BASE_URL root
            const apiRoot = API_BASE_URL.replace(/\/api\/?$/i, '')
            imageUrl = `${apiRoot}${imageUrl}`;
          } else if (imageUrl.startsWith('/assets/') || !imageUrl.startsWith('http')) {
            // For old asset paths or any relative path, keep as is
            // The onError handler will display a placeholder
            imageUrl = imageUrl;
          }
        }
        
        return {
          ...product,
          key: String(product.id),
          price: parseFloat(String(product.price)),
          stock: parseInt(String(product.stock), 10),
          image_url: imageUrl,
        };
      });
      setProducts(productsData);
    } catch (error) {
      message.error('Failed to load products');
    }
  };

  const columns: ColumnsType<ProductType> = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <Space size="small" direction="vertical" style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ width: 40, height: 40, flexShrink: 0, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
            {record.image_url ? (
              <img 
                src={record.image_url} 
                alt={record.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0', borderRadius: 4 }} />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 11 }}>{record.name}</div>
            <div style={{ fontSize: 10, color: '#666' }}>{record.category}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span style={{ fontWeight: 600 }}>₦{parseFloat(String(price)).toLocaleString()}</span>,
      sorter: (a, b) => parseFloat(String(a.price)) - parseFloat(String(b.price)),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock > 5 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock} units
        </Tag>
      ),
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: 'Skill Level',
      dataIndex: 'skill_level',
      key: 'skill_level',
      render: (level) => level || '-',
    },
    {
      title: 'Age Group',
      dataIndex: 'age_group',
      key: 'age_group',
      render: (group) => group || '-',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>Delete</Button>
        </Space>
      ),
    },
  ];

  const handleAddProduct = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(true);
  };

  const handleEdit = (product: ProductType) => {
    setEditingId(product.id);
    form.setFieldsValue({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description,
      image_url: product.image_url,
      age_group: product.age_group,
      skill_level: product.skill_level,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (product: ProductType) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this product?',
      content: 'This action cannot be undone.',
      onOk: async () => {
        try {
          await apiCall(`${API.products}/${product.id}`, {
            method: 'DELETE',
          }, token || undefined);
          setProducts(products.filter(p => p.id !== product.id));
          message.success('Product deleted successfully');
        } catch (error) {
          message.error('Failed to delete product');
        }
      },
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const data = await response.json();
      form.setFieldsValue({ image_url: data.url });
      message.success('Image uploaded successfully');
      return false; // Prevent default upload behavior
    } catch (error) {
      message.error('Failed to upload image');
      return false;
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        // Update existing product
        await apiCall(`${API.products}/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        }, token || undefined);
        const updatedProduct = { ...values, key: String(values.id), price: parseFloat(String(values.price)), stock: parseInt(String(values.stock), 10) };
        setProducts(products.map(p => p.id === editingId ? updatedProduct : p));
        message.success('Product updated successfully');
      } else {
        // Add new product
        const newProduct = await apiCall(API.products, {
          method: 'POST',
          body: JSON.stringify(values),
        }, token || undefined);
        const formattedProduct = { ...newProduct, key: String(newProduct.id), price: parseFloat(String(newProduct.price)), stock: parseInt(String(newProduct.stock), 10) };
        setProducts([...products, formattedProduct]);
        message.success('Product added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to save product');
    }
  };

  return (
    <div className="p-2 sm:p-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: 16, fontWeight: 'bold', margin: 0 }}>Product Management</h2>
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddProduct}>
          Add Product
        </Button>
      </div>
      
      <Card style={{ padding: '12px 14px' }}>
        <div style={{ marginBottom: 12 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search products..."
            size="small"
            style={{ width: '100%', maxWidth: 250, fontSize: 12 }}
          />
        </div>
        
        <Table 
          columns={columns} 
          dataSource={products} 
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
          size="small"
        />
      </Card>

      <Modal
        title={editingId ? 'Edit Product' : 'Add New Product'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={modalWidth}
        centered
        bodyStyle={{ padding: '12px 14px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ stock: 0, price: 0, image_url: '', age_group: '', skill_level: '' }}
        >
          <Form.Item
            name="name"
            label={<span style={{ fontSize: 12 }}>Product Name</span>}
            rules={[{ required: true, message: 'Please enter product name' }]}
            style={{ marginBottom: 10 }}
          >
            <Input placeholder="Enter product name" size="small" />
          </Form.Item>

          <Form.Item
            name="category"
            label={<span style={{ fontSize: 12 }}>Category</span>}
            rules={[{ required: true, message: 'Please select a category' }]}
            style={{ marginBottom: 10 }}
          >
            <Select placeholder="Select category" size="small">
              <Select.Option value="Robotics Kits">Robotics Kits</Select.Option>
              <Select.Option value="Coding Books">Coding Books</Select.Option>
              <Select.Option value="Accessories">Accessories</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Form.Item
              name="price"
              label={<span style={{ fontSize: 12 }}>Price (₦)</span>}
              rules={[{ required: true, message: 'Please enter price' }]}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                min={0}
                size="small"
                style={{ width: '100%' }}
                placeholder="0"
              />
            </Form.Item>
            <Form.Item
              name="stock"
              label={<span style={{ fontSize: 12 }}>Stock</span>}
              rules={[{ required: true, message: 'Please enter stock quantity' }]}
              style={{ marginBottom: 0 }}
            >
              <InputNumber min={0} size="small" style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </div>

          <Form.Item
            name="age_group"
            label={<span style={{ fontSize: 12 }}>Age Group</span>}
            style={{ marginBottom: 10, marginTop: 10 }}
          >
            <Select placeholder="Select age group" size="small">
              <Select.Option value="Kids">Kids</Select.Option>
              <Select.Option value="Teens">Teens</Select.Option>
              <Select.Option value="Adults">Adults</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="skill_level"
            label={<span style={{ fontSize: 12 }}>Skill Level</span>}
            style={{ marginBottom: 10 }}
          >
            <Select placeholder="Select skill level" size="small">
              <Select.Option value="Beginner">Beginner</Select.Option>
              <Select.Option value="Intermediate">Intermediate</Select.Option>
              <Select.Option value="Advanced">Advanced</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label={<span style={{ fontSize: 12 }}>Description</span>}
            style={{ marginBottom: 10 }}
          >
            <Input.TextArea rows={2} size="small" placeholder="Enter product description" />
          </Form.Item>

          <Form.Item
            name="image_url"
            label={<span style={{ fontSize: 12 }}>Product Image</span>}
            style={{ marginBottom: 10 }}
          >
            <Input placeholder="Image URL will appear here after upload" disabled size="small" />
          </Form.Item>

          <Form.Item
            name="image_file"
            label={<span style={{ fontSize: 12 }}>Upload Image</span>}
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
            style={{ marginBottom: 10 }}
          >
            <Upload
              name="image"
              listType="picture"
              beforeUpload={handleImageUpload}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} size="small">Click to upload</Button>
            </Upload>
          </Form.Item>

          <div style={{ textAlign: 'right', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <Button size="small" onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" size="small" htmlType="submit">
              {editingId ? 'Update' : 'Add'} Product
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default ProductsPage;
