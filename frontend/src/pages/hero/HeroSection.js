import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Upload,
  Input,
  message,
  Modal,
  Form,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { TextArea } = Input;

const HeroSection = () => {
  const [form] = Form.useForm();
  const [heroItems, setHeroItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetchHeroItems();
  }, []);

  const fetchHeroItems = async () => {
    try {
      setLoading(true);
      const response = await api.get("/hero");
      setHeroItems(response.data || []);
    } catch (error) {
      message.error("Failed to fetch hero items");
      setHeroItems([]);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      return response.data.data.url;
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload file. Please try again.');
      throw error;
    }
  };

  const handleModalOk = async () => {
    try {
      console.log('Form values:', form.getFieldsValue());
      const values = await form.validateFields();
      
      // Prepare data using the already uploaded imageUrl
      const heroData = {
        ...values,
      };
      console.log(heroData);

      if (editingItem) {
        await api.put(`/hero/${editingItem._id}`, heroData);
        message.success("Hero item updated successfully");
      } else {
        await api.post("/hero", heroData);
        message.success("Hero item added successfully");
      }
      setModalOpen(false);
      form.resetFields();
      setEditingItem(null);
      setImageUrl("");
      fetchHeroItems();
    } catch (error) {
      console.error('Form submission error:', error);
      message.error("Failed to save hero item");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/hero/${id}`);
      message.success("Hero item deleted successfully");
      fetchHeroItems();
    } catch (error) {
      message.error("Failed to delete hero item");
    }
  };

  const uploadProps = {
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const uploadedUrl = await uploadFile(file);
        setImageUrl(uploadedUrl);
        message.success('Image uploaded successfully');
        onSuccess();
      } catch (error) {
        console.error('Image upload error:', error);
        message.error('Failed to upload image');
        onError(error);
      }
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      return true;
    },
  };

  const columns = [
    {
      title: "Hero Title",
      dataIndex: "heroTitle",
      key: "heroTitle",
    },
    {
      title: "Hero Description",
      dataIndex: "heroDescription",
      key: "heroDescription",
      ellipsis: true,
    },
    // {
    //   title: "Custom Image",
    //   dataIndex: "customImage",
    //   key: "customImage",
    //   render: (image) =>
    //     image ? (
    //       <img src={image} alt="Hero" style={{ height: 50 }} />
    //     ) : (
    //       "No image"
    //     ),
    // },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record);
              form.setFieldsValue(record);
              setImageUrl(record.customImage);
              setModalOpen(true);
            }}
          >
            Edit
          </Button>
          {/* <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button> */}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {/* <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setImageUrl("");
            setModalOpen(true);
          }}
        >
          Add Hero Item
        </Button> */}
      </div>

      <Table
        columns={columns}
        dataSource={heroItems}
        loading={loading}
        rowKey="_id"
      />

      <Modal
        title={editingItem ? "Edit Hero Item" : "Add New Hero Item"}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingItem(null);
          setImageUrl("");
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="heroTitle"
            label="Hero Title"
            rules={[{ required: true, message: "Please enter hero title" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="heroDescription"
            label="Hero Description"
            rules={[{ required: true, message: "Please enter hero description" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="bigbuttontext"
            label="Big Button Text"
            rules={[{ required: true, message: "Please enter button text" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="videourl"
            label="Video URL"
            rules={[{ required: true, message: "Please enter url to hero video" }]}
          >
            <Input />
          </Form.Item>


          <Form.Item 
            name="checkbox1large" 
            label="checkbox1's large text"
            rules={[{ required: true, message: "Please enter checkbox1's large text" }]}
          > 
            <Input />
          </Form.Item>
          <Form.Item
            name="checkbox1small"
            label="checkbox1's small text"
            rules={[{ required: true, message: "Please enter checkbox1's small text" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item

            name="checkbox2large"
            label="checkbox2's large text"
            rules={[{ required: true, message: "Please enter checkbox2's large text" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="checkbox2small"
            label="checkbox2's small text"
            rules={[{ required: true, message: "Please enter checkbox2's small text" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="checkbox3large"
            label="checkbox3's large text"
            rules={[{ required: true, message: "Please enter checkbox3's large text" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="checkbox3small"
            label="checkbox3's small text"
            rules={[{ required: true, message: "Please enter checkbox3's small text" }]}
          >
            <Input />
          </Form.Item>

          Right bottom section for explore medicines
          <Form.List name="exploremedicines">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'title']}
                      fieldKey={[fieldKey, 'title']}
                      rules={[{ required: true, message: 'Missing title' }]}
                    >
                      <Input placeholder="Title" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      fieldKey={[fieldKey, 'description']}
                      rules={[{ required: true, message: 'Missing description' }]}
                    >
                      <Input placeholder="Description" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'url']}
                      fieldKey={[fieldKey, 'url']}
                      rules={[{ required: true, message: 'Missing url' }]}
                    >
                      <Input placeholder="URL" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'buttonname']}
                      fieldKey={[fieldKey, 'buttonname']}
                      rules={[{ required: true, message: 'Missing button name' }]}
                    >
                      <Input placeholder="Button Name" />
                    </Form.Item>
                    <Button onClick={() => remove(name)}>-</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                  >
                    Add Medicine
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default HeroSection;
