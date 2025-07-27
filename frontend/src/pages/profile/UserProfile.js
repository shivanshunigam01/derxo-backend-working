import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Tabs, Space } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const { TabPane } = Tabs;

const UserProfile = () => {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleProfileUpdate = async (values) => {
    try {
      setLoading(true);
      const response = await api.put("/users/profile/update", values);
      setUser(response.data);
      message.success("Profile updated successfully");
    } catch (error) {
      message.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setLoading(true);
      await api.post("/auth/change-password", values);
      message.success("Password changed successfully");
      passwordForm.resetFields();
    } catch (error) {
      message.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="User Profile" style={{ maxWidth: 600, margin: "0 auto" }}>
      <Tabs defaultActiveKey="profile">
        <TabPane
          tab={
            <Space>
              <UserOutlined />
              Profile Information
            </Space>
          }
          key="profile"
        >
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileUpdate}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane
          tab={
            <Space>
              <LockOutlined />
              Change Password
            </Space>
          }
          key="password"
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
          >
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[
                { required: true, message: "Please enter current password" },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: "Please enter new password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject("Passwords do not match");
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default UserProfile;
