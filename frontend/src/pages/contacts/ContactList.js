import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Select,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import { MailOutlined } from "@ant-design/icons";
import api from "../../services/api";

const { Option } = Select;
const { TextArea } = Input;

const ContactList = () => {
  const [form] = Form.useForm();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchContacts();
  }, [pagination.current, status]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        status,
      };
      const response = await api.get("/contact", { params });
      setContacts(response.data.contacts);
      setPagination({
        ...pagination,
        total: response.data.total,
      });
    } catch (error) {
      message.error("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    try {
      const values = await form.validateFields();
      await api.put(`/contact/${selectedContact._id}`, {
        status: "replied",
        replyMessage: values.replyMessage,
      });
      message.success("Reply sent successfully");
      setReplyModalVisible(false);
      form.resetFields();
      setSelectedContact(null);
      fetchContacts();
    } catch (error) {
      message.error("Failed to send reply");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/contact/${id}`, { status: newStatus });
      message.success("Status updated successfully");
      fetchContacts();
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get("/contact/exportCSV", {
        responseType: "blob", // Ensures correct handling of CSV data
      });
  
      const blob = new Blob([response.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "contacts.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error("Failed to export CSV");
    }
  };
  
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          unread: "red",
          read: "blue",
          replied: "green",
          archived: "gray",
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Budget",
      dataIndex: "budget",
      key: "budget",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Select
            value={record.status}
            style={{ width: 120 }}
            onChange={(value) => handleStatusChange(record._id, value)}
          >
            <Option value="unread">Unread</Option>
            <Option value="read">Read</Option>
            <Option value="replied">Replied</Option>
            <Option value="archived">Archived</Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <Select
          style={{ width: 200 }}
          placeholder="Filter by status"
          allowClear
          onChange={setStatus}
        >
          <Option value="unread">Unread</Option>
          <Option value="read">Read</Option>
          <Option value="replied">Replied</Option>
          <Option value="archived">Archived</Option>
        </Select>
      <Button onClick={handleExportCSV}>
        Export CSV
      </Button>
      </div>

      <Table
        columns={columns}
        dataSource={contacts}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={(pagination) => setPagination(pagination)}
      />

      <Modal
        title="Reply to Contact"
        visible={replyModalVisible}
        onOk={handleReply}
        onCancel={() => {
          setReplyModalVisible(false);
          form.resetFields();
          setSelectedContact(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="To">
            <Input value={selectedContact?.email} disabled />
          </Form.Item>
          <Form.Item
            name="replyMessage"
            label="Reply Message"
            rules={[{ required: true, message: "Please enter your reply" }]}
          >
            <TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContactList;
