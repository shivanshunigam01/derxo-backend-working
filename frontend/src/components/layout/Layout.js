import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Layout, Menu, Button, Typography } from "antd";
import {
  DashboardOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  PictureOutlined,
  CommentOutlined,
  MailOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const menuItems = [
    // {
    //   key: "/",
    //   icon: <DashboardOutlined />,
    //   label: "Dashboard",
    // },
    {
      key: "/",
      icon: <MedicineBoxOutlined />,
      label: "Medicines",
    },
    {
      key: "/blogs",
      icon: <FileTextOutlined />,
      label: "Blogs",
    },
    {
      key: "/faqs",
      icon: <QuestionCircleOutlined />,
      label: "FAQs",
    },
    {
      key: "/hero-section",
      icon: <PictureOutlined />,
      label: "Hero Section",
    },
    {
      key: "/testimonials",
      icon: <CommentOutlined />,
      label: "Testimonials",
    },
    {
      key: "/contacts",
      icon: <MailOutlined />,
      label: "Contacts",
    },
    {
      key: "/newsletter",
      icon: <MailOutlined />,
      label: "Newsletter",
    },
  ];

  const handleMenuClick = (key) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={250} theme="dark">
        <div style={{ padding: "16px", textAlign: "center" }}>
          <Title level={4} style={{ color: "white", margin: 0 }}>
            Admin Panel
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["/"]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: "0 24px", background: "#fff" }}>
          <div style={{ float: "right" }}>
            <span style={{ marginRight: 16 }}>
              <UserOutlined /> {user?.name}
            </span>
            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              type="link"
            >
              Logout
            </Button>
          </div>
        </Header>
        <Content
          style={{ margin: "24px 16px", padding: 24, background: "#fff" }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
