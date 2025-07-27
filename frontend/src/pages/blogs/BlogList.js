import React, { useState, useEffect } from "react";
import { Table, Button, Space, Input, Tag, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const { Search } = Input;

const BlogList = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: search,
      };

      // Remove empty params
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);

      console.log("Fetching with params:", params); // Debug log

      const response = await api.get("/blogs", { params });

      if (response.data.blogs) {
        setBlogs(response.data.blogs);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      message.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [pagination.current, search]);

  const handleSearch = (value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page on new search
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/blogs/${id}`);
      message.success("Blog deleted successfully");
      fetchBlogs();
    } catch (error) {
      message.error("Failed to delete blog");
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <a onClick={() => navigate(`/blogs/edit/${record.url}`)}>{text}</a>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags) => (
        <>
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/blogs/edit/${record.url}`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this blog?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
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
          justifyContent: "space-between",
        }}
      >
        <Search
          placeholder="Search blogs"
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/blogs/add")}
        >
          Add Blog
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={blogs}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={(newPagination) => setPagination(newPagination)}
      />
    </div>
  );
};

export default BlogList;
