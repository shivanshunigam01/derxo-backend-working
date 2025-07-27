import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Alert, Modal, Form, Input, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [newCategoryURL, setNewCategoryURL] = useState("");
    const [isInvalidURL, setIsInvalidURL] = useState(false);
  
    const handleURLChange = (e) => {
      const value = e.target.value;
      setNewCategoryURL(value);
  
      // Check for invalid characters
      const invalidChars = /[^a-zA-Z0-9-]+/.test(value);
      setIsInvalidURL(invalidChars);
    };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/medicines/categories");
      console.log(response);
      const categoryData = response.data.map((med) => ({
        id: med._id,
        name: med.name,
        url: med.url,
      }));
      console.log(categoryData);

      setCategories(categoryData);
      setFilteredCategories(categoryData);
    } catch (error) {
      message.error("Failed to fetch categories");
    }
  };

  const handleAddCategory = async (values) => {
    try {
      setCategories([...categories, values.category]);
      setFilteredCategories([...filteredCategories, values.category]);
      console.log(newCategoryURL)
      await api.post("/medicines/medicineCategory", {
        category: values.category,
        metaTitle: values.metaTitle,
        url: newCategoryURL
      });
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Failed to add category");
    }
  };

  const handleEditCategory = async (values) => {
    try {
      setCategories([...categories, values.category]);
      setFilteredCategories([...filteredCategories, values.category]);
    } catch (error) {
      message.error("Failed to edit category");
    }
  };
  const handleCategoryClick = (category) => {
    navigate(`/medicines/category/${categories.find((cat) => cat.name === category.name).id}`);
  };

  const handleSearch = (value) => {
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  return (
    <div style={{ padding: "24px", backgroundColor: "#f0f2f5" }}>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
          Medicine Categories
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Add Category
        </Button>
      </div>

      <Input.Search
        placeholder="Search categories"
        onSearch={handleSearch}
        style={{ marginBottom: "20px" }}
      />

      <Row gutter={[16, 16]}>
        {filteredCategories.map((category) => (
          <Col xs={24} sm={12} md={8} lg={6} key={category}>
            <Card
              hoverable
              onClick={() => handleCategoryClick(category)}
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
              bodyStyle={{ textAlign: "center" }}
            >
              <h3 style={{ margin: 0 }}>{category.name}</h3>
              {/* <Button
                type="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/medicines/add?category=${category}`);
                }}
              >
                Add Medicine
              </Button> */}
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="Add New Category"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Form form={form} onFinish={handleAddCategory} layout="vertical">
          <Form.Item
            name="category"
            label="Category Name"
            rules={[
              { required: true, message: "Please input category name!" },
              {
                pattern: /^(?!.* {2})[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/,
                message:
                  "Category name can only contain letters, numbers, and a single space between words",
              },
            ]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>
          <Form.Item
            name="metaTitle"
            label="Meta Title"
            rules={[{ required: true, message: "Please input meta Title!" }]}
          >
            <Input placeholder="Enter your meta title" />
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
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Category
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
