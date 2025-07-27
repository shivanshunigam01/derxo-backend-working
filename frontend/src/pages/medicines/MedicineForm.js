import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Switch,
  Button,
  InputNumber,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const { Option } = Select;
const { TextArea } = Input;

const MedicineForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { url } = useParams();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const queryParams = new URLSearchParams(window.location.search);
  const category = queryParams.get("category");
  const [categoryData, setCategoryData] = useState(null);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [id, setId] = useState(null);
  const [content, setContent] = useState("");
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
    setCategoryData(category);
  }, [category]);

  useEffect(() => {
    if (url) {
      fetchMedicineDetails();
    }

  }, [url]);

  const fetchMedicineDetails = async () => {
    try {
      const response = await api.get(`/medicines/url/${url}`);
      const medicine = response.data;

      setId(medicine._id);
      console.log(medicine);
      form.setFieldsValue({
        ...medicine,
        category: medicine.category.name,
        faqs: medicine.faqs || [{ question: "", answer: "" }],
      });
      setFaqs(medicine.faqs || [{ question: "", answer: "" }]);
      setImageUrl(medicine.image);
      setContent(medicine.description);
    } catch (error) {
      message.error("Failed to fetch medicine details");
      navigate("/medicines");
    }
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.data.url;
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Failed to upload file. Please try again.");
      throw error;
    }
  };

  const uploadProps = {
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const uploadedUrl = await uploadFile(file);
        setImageUrl(uploadedUrl);
        message.success("Image uploaded successfully");
        onSuccess();
      } catch (error) {
        console.error("Image upload error:", error);
        message.error("Failed to upload image");
        onError(error);
      }
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      return true;
    },
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if(isInvalidURL) {
        message.error("URL can only contain alphanumeric characters and hyphens.");
        return;
      }
      const formData = new FormData();

      // Append all form values to formData
      Object.keys(values).forEach((key) => {
        if (key === "quantity") {
          formData.append("quantity", JSON.stringify([values.quantity]));
        } else if (key !== "image") {
          // Skip the image field as it's handled separately
          formData.append(key, values[key]);
        }
      });

      console.log(form.getFieldValue("category"), "form.getFieldValue");
      if (!form.getFieldValue("category")) {
        formData.append("category", categoryData);
      } else {
        formData.append("category", form.getFieldValue("category"));
      }
      formData.append("description", content);

      // Add the image URL to the form data
      formData.append("image", imageUrl);

      // Add the FAQs to the form data
      formData.append("faqs", JSON.stringify(faqs));

      // Log the form data
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      console.log(formData, "formData");
      if (id) {
        await api.put(`/medicines/${id}`, formData);
        message.success("Medicine updated successfully");
      } else {
        await api.post("/medicines", formData);
        message.success("Medicine added successfully");
      }
      navigate("/medicines");
    } catch (error) {
      message.error("Failed to save medicine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{url ? "Edit Medicine" : "Add New Medicine"}</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          stockAvailable: true,
        }}
      >
        <Form.Item
          name="name"
          label="Medicine Name"
          rules={[
            { required: true, message: "Please enter medicine name" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (value.includes("  ")) {
                  return Promise.reject(
                    new Error("Multiple consecutive spaces are not allowed")
                  );
                }
                if (!/^[a-zA-Z0-9() ]*$/.test(value)) {
                  return Promise.reject(
                    new Error(
                      "Special characters are not allowed except for ( )"
                    )
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input />
        </Form.Item>

        {/* <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: "Please select category" }]}
        >
          <Select>
            <Option value="Cancer Treatment">Cancer Treatment</Option>
            <Option value="Diabetes Care">Diabetes Care</Option>
            <Option value="Heart Disease">Heart Disease</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item> */}

        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: "Please select type" }]}
        >
          <Select>
            <Option value="Tablet">Tablet</Option>
            <Option value="Capsule">Capsule</Option>
            <Option value="Liquid">Liquid</Option>
            <Option value="Injection">Injection</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="strength"
          label="Strength"
          rules={[{ required: true, message: "Please enter strength" }]}
        >
          <Input />
        </Form.Item>

        {/* <Form.Item label="Quantity & Price">
          <Form.Item
            name={["quantity", "count"]}
            rules={[{ required: true, message: "Please enter quantity" }]}
            style={{ display: "inline-block", marginRight: 8 }}
          >
            <InputNumber min={1} placeholder="Count" />
          </Form.Item>
          <Form.Item
            name={["quantity", "price"]}
            rules={[{ required: true, message: "Please enter price" }]}
            style={{ display: "inline-block" }}
          >
            <InputNumber min={0} placeholder="Price" />
          </Form.Item>
        </Form.Item> */}

        <Form.Item
          name="metaTitle"
          label="Meta Title"
          rules={[{ required: true, message: "Please enter meta title for blog" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Description">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
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

        <Form.Item
          name="metaDescription"
          label="Meta Description"
          rules={[{ required: true, message: "Please enter meta description for blog" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="url"
          label="Custom URL"
          rules={[{ required: true, message: "Please enter custom url for blog" }]}
          validateStatus={isInvalidURL ? 'error' : ''}
          help={isInvalidURL ? 'URL can only contain alphanumeric characters and hyphens.' : ''}
        >
          <Input 
            value={newCategoryURL}
            onChange={handleURLChange}
            placeholder="Enter URL (alphanumeric and hyphens only)"
          />
        </Form.Item>

        {/* FAQs Section */}
        <p>Faq's</p>
        {faqs.map((faq, index) => (
          <div key={index}>
            <Form.Item
              label={`Question ${index + 1}`}
              rules={[{ required: true, message: "Please enter question" }]}
            >
              <Input
                value={faq.question}
                onChange={(e) => handleFaqChange(index, "question", e.target.value)}
              />
            </Form.Item>
            <Form.Item
              label={`Answer ${index + 1}`}
              rules={[{ required: true, message: "Please enter answer" }]}
            >
              <Input
                value={faq.answer}
                onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Button 
                danger
                onClick={() => {
                  const newFaqs = faqs.filter((_, i) => i !== index);
                  setFaqs(newFaqs);
                }}
              >
                Remove FAQ
              </Button>
            </Form.Item>
          </div>
        ))}
        <Button type="dashed" onClick={addFaq} style={{ width: "100%", marginBottom: 16 }}>
          Add FAQ
        </Button>

        <Form.Item name="image" label="Medicine Image">
          <Upload {...uploadProps} maxCount={1}>
            <Button icon={<UploadOutlined />}>Upload Image</Button>
          </Upload>
        </Form.Item>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Medicine"
            style={{ maxWidth: 200, marginBottom: 16 }}
          />
        )}

        <Form.Item name="imageName" label="Image Name (For SEO Optimization)">
          <Input />
        </Form.Item>

        {/* <Form.Item
          name="stockAvailable"
          label="Stock Available"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item> */}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {url   ? "Update Medicine" : "Add Medicine"}
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => navigate("/medicines")}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default MedicineForm;
