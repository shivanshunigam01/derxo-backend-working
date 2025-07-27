import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Table, Button, Space, message, Card, Input, Modal, Form, Alert } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../../services/api";

const CategoryMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const { category } = useParams();
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState(category);
  const [newMetaTitle, setnewMetaTitle] = useState("");
  const [newCategoryMetaDescription, setNewCategoryMetaDescription] = useState("");
  const [newCategoryURL, setNewCategoryURL] = useState("");
  const [newContent, setNewContent] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [isInvalidURL, setIsInvalidURL] = useState(false);

  const handleURLChange = (e) => {
    const value = e.target.value;
    setNewCategoryURL(value);

    // Check for invalid characters
    const invalidChars = /[^a-zA-Z0-9-]+/.test(value);
    setIsInvalidURL(invalidChars);
  };
  console.log(category);
  useEffect(() => {
    fetchMedicines();
  }, [category]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/medicines/${category}`);
      setMedicines(response.data);
      // console.log(response.data);
      const response2= await api.get(`/medicines/medicineCategory/id/${category}`);
      // console.log(response2, "response 2");
      setCurrentCategory(response2.data);
      setFilteredMedicines(response.data);
      setNewCategoryName(response2.data.name);
      setnewMetaTitle(response2.data.metaTitle);
      setNewCategoryMetaDescription(response2.data.metaDescription);
      setNewCategoryURL(response2.data.url);
      setNewContent(response2.data.content);
    } catch (error) {
      message.error("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Strength",
      dataIndex: "strength",
      key: "strength",
    },
    // {
    //   title: "Price",
    //   key: "price",
    //   render: (record) =>
    //     record.quantity?.[0]?.price
    //       ? `₹${record.quantity[0].price.toFixed(2)}`
    //       : "N/A",
    // },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() =>
              navigate(
                `/medicines/edit/${record?.url}`
              )
            }
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleDelete = async (id) => {
    try {
      await api.delete(`/medicines/${id}`);
      message.success("Medicine deleted successfully");
      fetchMedicines();
    } catch (error) {
      message.error("Failed to delete medicine");
    }
  };

  const handleSearch = (value) => {
    const filtered = medicines.filter((medicine) =>
      medicine.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredMedicines(filtered);
  };

  const handleEditCategory = async () => {
    try {
      await api.put(`/medicines/medicineCategory/${currentCategory._id}`, {
        name: newCategoryName,
        metaDescription: newCategoryMetaDescription,
        metaTitle: newMetaTitle,
        content: newContent,
        url: newCategoryURL,
      });
      message.success("Category updated successfully");
      setIsModalVisible(false);
      fetchMedicines();
    } catch (error) {
      message.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await api.delete(`/medicines/medicineCategory/${category}`);
      message.success("Category deleted successfully");
      navigate("/medicines"); // Navigate back to medicines page
    } catch (error) {
      message.error("Failed to delete category");
    }
  };

  return (
    <div style={{ padding: "24px", backgroundColor: "#f0f2f5" }}>
      <Card style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>{currentCategory.name}</h1>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/medicines/add?category=${category}`)}
            >
              Add Medicine
            </Button>
            <Button type="default" onClick={() => setIsModalVisible(true)}>
              Edit Category
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: "Are you sure you want to delete this category?",
                  content: "This action cannot be undone.",
                  okText: "Yes",
                  okType: "danger",
                  cancelText: "No",
                  onOk: handleDeleteCategory,
                });
              }}
            >
              Delete Category
            </Button>
          </Space>
        </div>
        <Input.Search
          placeholder="Search medicines"
          onSearch={handleSearch}
          style={{ marginTop: "10px" }}
        />
      </Card>

      <Table
        columns={columns}
        dataSource={filteredMedicines}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        style={{ backgroundColor: "#fff", borderRadius: "8px" }}
      />

      <Modal
        title="Edit Category"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleEditCategory}
        width={1000}
      >
        <Form>
          <Form.Item label="Category Name">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Meta title">
            <Input
              value={newMetaTitle}
              onChange={(e) => setnewMetaTitle(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="MetaDescription">
            <Input
              value={newCategoryMetaDescription}
              onChange={(e) => setNewCategoryMetaDescription(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Custom URL"
            validateStatus={isInvalidURL ? 'error' : ''}
            help={isInvalidURL ? 'URL can only contain alphanumeric characters and hyphens.' : ''}
          >
            <Input
              value={newCategoryURL}
              onChange={handleURLChange}
              placeholder="Enter URL (alphanumeric and hyphens only)"
            />
          </Form.Item>
          {isInvalidURL && (
            <Alert
              message="Invalid URL"
              description="Please remove special characters from the URL. Allowed characters are alphanumeric and hyphens."
              type="error"
              showIcon
            />
          )}
          <Form.Item label="Content">
          <ReactQuill
            theme="snow"
            value={newContent}
            onChange={setNewContent}
            style={{ height: "300px", marginBottom: "50px" }}
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'video'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['image'],
                ['code-block'],
                ['formula'],
                ['clean'],
              ],
            }}
          />

          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryMedicines;
