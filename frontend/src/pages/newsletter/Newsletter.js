import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  DatePicker,
  message,
  Modal,
  Statistic,
  Card,
  Row,
  Col,
} from "antd";
import {
  DownloadOutlined,
  MailOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { RangePicker } = DatePicker;

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0,
    lastMonth: 0,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, [pagination.current, dateRange]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(dateRange && {
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
        }),
      };
      const response = await api.get("/newsletter/subscribers", { params });
      setSubscribers(response.data.subscribers);
      setPagination({
        ...pagination,
        total: response.data.total,
      });
    } catch (error) {
      message.error("Failed to fetch subscribers");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/newsletter/stats");
      setStats(response.data);
    } catch (error) {
      message.error("Failed to fetch newsletter statistics");
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get("/newsletter/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "newsletter_subscribers.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error("Failed to export subscribers");
    }
  };

  const handleUnsubscribe = async (id) => {
    try {
      await api.put(`/newsletter/unsubscribe/${id}`);
      message.success("Subscriber unsubscribed successfully");
      fetchSubscribers();
      fetchStats();
    } catch (error) {
      message.error("Failed to unsubscribe");
    }
  };

  const handleResubscribe = async (id) => {
    try {
      await api.put(`/newsletter/resubscribe/${id}`);
      message.success("Subscriber resubscribed successfully");
      fetchSubscribers();
      fetchStats();
    } catch (error) {
      message.error("Failed to resubscribe");
    }
  };

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "isSubscribed",
      key: "status",
      render: (isSubscribed) => (
        <span style={{ color: isSubscribed ? "green" : "red" }}>
          {isSubscribed ? "Subscribed" : "Unsubscribed"}
        </span>
      ),
    },
    {
      title: "Subscribed Date",
      dataIndex: "subscribedAt",
      key: "subscribedAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Unsubscribed Date",
      dataIndex: "unsubscribedAt",
      key: "unsubscribedAt",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.isSubscribed ? (
            <Button
              icon={<UserDeleteOutlined />}
              danger
              onClick={() => handleUnsubscribe(record._id)}
            >
              Unsubscribe
            </Button>
          ) : (
            <Button
              icon={<UserAddOutlined />}
              type="primary"
              onClick={() => handleResubscribe(record._id)}
            >
              Resubscribe
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Subscribers"
              value={stats.total}
              prefix={<MailOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Subscribers"
              value={stats.active}
              valueStyle={{ color: "#3f8600" }}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Unsubscribed"
              value={stats.unsubscribed}
              valueStyle={{ color: "#cf1322" }}
              prefix={<UserDeleteOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="New This Month"
              value={stats.lastMonth}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <RangePicker
          onChange={(dates) => setDateRange(dates)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          Export Subscribers
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={subscribers}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={(pagination) => setPagination(pagination)}
      />
    </div>
  );
};

export default Newsletter;
