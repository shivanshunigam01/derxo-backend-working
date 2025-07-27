import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  message,
  Modal,
  Form,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import api from "../../services/api";

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const FAQList = () => {
  const [form] = Form.useForm();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchFAQs();
  }, [category]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const params = category ? { category } : {};
      const response = await api.get("/faqs", { params });
      setFaqs(response.data);
    } catch (error) {
      message.error("Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingFaq) {
        await api.put(`/faqs/${editingFaq._id}`, values);
        message.success("FAQ updated successfully");
      } else {
        await api.post("/faqs", values);
        message.success("FAQ created successfully");
      }
      setModalVisible(false);
      form.resetFields();
      setEditingFaq(null);
      fetchFAQs();
    } catch (error) {
      message.error("Failed to save FAQ");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/faqs/${id}`);
      message.success("FAQ deleted successfully");
      fetchFAQs();
    } catch (error) {
      message.error("Failed to delete FAQ");
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(faqs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFaqs(items);

    try {
      await api.put("/faqs/order/update", {
        updates: items.map((item, index) => ({
          id: item._id,
          displayOrder: index,
        })),
      });
    } catch (error) {
      message.error("Failed to update order");
      fetchFAQs();
    }
  };

  const columns = [
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
    },
    {
      title: "Answer",
      dataIndex: "answer",
      key: "answer",
      ellipsis: true,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingFaq(record);
              form.setFieldsValue(record);
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

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Space>
          <Select
            style={{ width: 200 }}
            placeholder="Filter by category"
            allowClear
            onChange={setCategory}
          >
            <Option value="General">General</Option>
            <Option value="Products">Products</Option>
            <Option value="Shipping">Shipping</Option>
            <Option value="Returns">Returns</Option>
          </Select>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingFaq(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add FAQ
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="faqs">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {faqs.map((faq, index) => (
                <Draggable key={faq._id} draggableId={faq._id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Table
                        columns={columns}
                        dataSource={[faq]}
                        pagination={false}
                        rowKey="_id"
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Modal
        title={editingFaq ? "Edit FAQ" : "Add New FAQ"}
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingFaq(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="question"
            label="Question"
            rules={[{ required: true, message: "Please enter the question" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="answer"
            label="Answer"
            rules={[{ required: true, message: "Please enter the answer" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select>
              <Option value="General">General</Option>
              <Option value="Products">Products</Option>
              <Option value="Shipping">Shipping</Option>
              <Option value="Returns">Returns</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FAQList;
