import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Rate,
  Image,
  Modal,
  Form,
  Input,
  Upload,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { TextArea } = Input;

const TestimonialList = () => {
  const [form] = Form.useForm();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await api.get("/testimonials");
      setTestimonials(response.data);
    } catch (error) {
      message.error("Failed to fetch testimonials");
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
      const values = await form.validateFields();
      
      // Prepare data for testimonial using the already uploaded imageUrl
      const testimonialData = {
        ...values,
        image: imageUrl || editingTestimonial?.image || null
      };

      if (editingTestimonial) {
        await api.put(`/testimonials/${editingTestimonial._id}`, testimonialData);
        message.success("Testimonial updated successfully");
      } else {
        await api.post("/testimonials", testimonialData);
        message.success("Testimonial added successfully");
      }
      setModalVisible(false);
      form.resetFields();
      setEditingTestimonial(null);
      setImageUrl("");
      fetchTestimonials();
    } catch (error) {
      console.error('Form submission error:', error);
      message.error("Failed to save testimonial");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/testimonials/${id}`);
      message.success("Testimonial deleted successfully");
      fetchTestimonials();
    } catch (error) {
      message.error("Failed to delete testimonial");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) =>
        image ? <Image src={image} width={50} /> : "No image",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingTestimonial(record);
              form.setFieldsValue(record);
              setImageUrl(record.image);
              setModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

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

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingTestimonial(null);
            form.resetFields();
            setImageUrl("");
            setModalVisible(true);
          }}
        >
          Add Testimonial
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={testimonials}
        rowKey="_id"
        loading={loading}
      />

      <Modal
        title={editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingTestimonial(null);
          setImageUrl("");
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="designation"
            label="Designation"
            rules={[{ required: true, message: "Please enter designation" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: "Please enter content" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: "Please select rating" }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item name="image" label="Image">
            <Upload {...uploadProps} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              style={{ maxWidth: 200, marginBottom: 16 }}
            />
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default TestimonialList;
