import React, { useState, useEffect } from "react";
import { Table, Button, Space, Input, Select, message, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const { Search } = Input;
const { Option } = Select;

const MedicineList = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    category: "",
    stockAvailable: "",
  });

  useEffect(() => {
    fetchMedicines();
  }, [pagination.current, filters]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        type: filters.type,
        category: filters.category,
        stockAvailable: filters.stockAvailable,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);

      console.log("Fetching with params:", params); // Debug log

      const response = await api.get("/medicines", { params });
      console.log("Response:", response.data); // Debug log

      setMedicines(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.length,
      }));
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/medicines/${id}`);
      message.success("Medicine deleted successfully");
      fetchMedicines();
    } catch (error) {
      message.error("Failed to delete medicine");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: [
        { text: "Cancer Treatment", value: "Cancer Treatment" },
        { text: "Antibiotics", value: "Antibiotics" },
        { text: "Pain Relief", value: "Pain Relief" },
      ],
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Tablet", value: "Tablet" },
        { text: "Capsule", value: "Capsule" },
        { text: "Syrup", value: "Syrup" },
        { text: "Injection", value: "Injection" },
      ],
    },
    {
      title: "Strength",
      dataIndex: "strength",
      key: "strength",
    },
    {
      title: "Price",
      key: "price",
      render: (record) =>
        record.quantity?.[0]?.price
          ? `₹${record.quantity[0].price.toFixed(2)}`
          : "N/A",
      sorter: true,
    },
    {
      title: "Stock",
      key: "stock",
      render: (record) => {
        const stock = record.quantity?.[0]?.count;
        return stock ? (
          <Tag color={stock < 10 ? "red" : "green"}>{stock}</Tag>
        ) : (
          "Out of Stock"
        );
      },
      sorter: true,
    },
    {
      title: "Status",
      key: "stockAvailable",
      render: (record) => (
        <Tag color={record.stockAvailable ? "green" : "red"}>
          {record.stockAvailable ? "Available" : "Out of Stock"}
        </Tag>
      ),
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) =>
        image ? (
          <img
            src={`http://localhost:5000${image}`}
            alt="Medicine"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        ) : (
          "No image"
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/medicines/edit/${record._id}`)}
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

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilters((prev) => ({
      ...prev,
      type: filters.type?.[0] || "",
      category: filters.category?.[0] || "",
    }));
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Space size="middle">
          <Search
            placeholder="Search medicines"
            allowClear
            onSearch={(value) =>
              setFilters((prev) => ({ ...prev, search: value }))
            }
            style={{ width: 200 }}
          />
          <Select
            placeholder="Select type"
            style={{ width: 150 }}
            allowClear
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, type: value }))
            }
          >
            <Option value="Tablet">Tablet</Option>
            <Option value="Capsule">Capsule</Option>
            <Option value="Liquid">Liquid</Option>
            <Option value="Injection">Injection</Option>
          </Select>
          <Select
            placeholder="Stock status"
            style={{ width: 150 }}
            allowClear
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, stockAvailable: value }))
            }
          >
            <Option value="true">In Stock</Option>
            <Option value="false">Out of Stock</Option>
          </Select>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/medicines/add")}
        >
          Add Medicine
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={medicines}
        rowKey="_id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default MedicineList;
