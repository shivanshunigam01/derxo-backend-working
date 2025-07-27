import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Table, List, Typography } from "antd";
import {
  MedicineBoxOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { Title } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalContacts: 0,
    recentContacts: [],
    lowStockMedicines: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockColumns = [
    {
      title: "Medicine Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${price.toFixed(2)}`,
    },
  ];

  return (
    <div>
      <Title level={2}>Dashboard</Title>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Medicines"
              value={stats.totalMedicines}
              prefix={<MedicineBoxOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Contacts"
              value={stats.totalContacts}
              prefix={<MessageOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: "24px" }}>
        <Col span={12}>
          <Card title="Low Stock Medicines">
            <Table
              columns={lowStockColumns}
              dataSource={stats.lowStockMedicines || []}
              pagination={false}
              rowKey="_id"
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Recent Contacts">
            <List
              loading={loading}
              dataSource={stats.recentContacts || []}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={item.name} description={item.email} />
                  <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
