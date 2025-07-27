import React, { useState, useEffect } from "react";
import { Form, Input, Button, Upload, Select, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import api from "../../services/api";
const { TextArea } = Input;

const BlogForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { url } = useParams();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [imageName, setImageName] = useState("");
  const [id, setId] = useState(null);
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
    if (url) {
      console.log(url)
      fetchBlogDetails();
    }
  }, [url]);



  const fetchBlogDetails = async () => {
    try {
      console.log('trying to fetch blog details for ', url)
      const response = await api.get(`/blogs/url/${url}`);
      console.log(response)
      const blog = response.data;
      setId(blog._id);
      
      if (blog) {
        form.setFieldsValue({
          title: blog.title,
          description: blog.description,
          tags: blog.tags,
          metaTitle: blog.metaTitle,
          metaDescription: blog.metaDescription,
          url: blog.url,
          imageName: blog.imageName,
        });
        setContent(blog.content || '');
        setImageUrl(blog.image || '');
        setImageName(blog.imageName || '');
      } else {
        message.error("Blog not found");
        navigate("/blogs");
      }
    } catch (error) {
      console.error("Error fetching blog details:", error);
      message.error("Failed to fetch blog details");
    }
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      return response.data.data.url;
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload file. Please try again.');
      throw error;
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      if (isInvalidURL) {
        message.error('URL can only contain alphanumeric characters and hyphens.');
        return;
      }
      const formData = {
        ...values,
        content,
        image: imageUrl,
        imageName: imageName,
      };

      if(id) {
        console.log(id)
        await api.put(`/blogs/${id}`, formData);
        message.success("Blog updated successfully");
      } else {
        await api.post("/blogs", formData);
        message.success("Blog created successfully");
      }
      navigate("/blogs");
    } catch (error) {
      message.error("Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const uploadedUrl = await uploadFile(file);
        setImageUrl(uploadedUrl);
        setImageName(file.name);
        form.setFieldsValue({ imageName: file.name });
        message.success('Image uploaded successfully');
        onSuccess();
      } catch (error) {
        console.error('Image upload error:', error);
        message.error('Failed to upload image');
        onError(error);
      }
    },
    beforeUpload: (file) => {
      const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      const isImage = allowedTypes.includes(file.type);
      if (!isImage) {
        message.error("Please upload a valid image file (JPEG/JPG, PNG, GIF, WebP, or SVG)!");
        return false;
      }
      return true;
    },
  };

  return (
    <div>
      <h2>{url ? "Edit Blog" : "Create New Blog"}</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter blog title" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="metaTitle"
          label="Meta Title"
          rules={[{ required: true, message: "Please enter meta title for blog" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter blog description" }]}
        >
          <TextArea rows={4} />
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

        <Form.Item label="Content">
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

        {/* <Form.Item label="Content">
        <CKEditor
          editor={ClassicEditor}
          data={content}
          config={{
            plugins: [
              Essentials,
              Paragraph,
              Bold,
              Italic,
              Underline,
              Strikethrough,
              Subscript,
              Superscript,
              BlockQuote,
              Link,
              Image,
              ImageInsert,
              ImageCaption,
              ImageStyle,
              ImageToolbar,
              ImageUpload,
              Indent,
              List,
              Alignment,
              Font,
              FontFamily,
              FontSize,
              // ... other plugins
            ],
            toolbar: {
              items: [
                'sourceEditing',
                '|',
                'newDocument',
                'preview',
                'print',
                'templates',
                '|',
                'cut',
                'copy',
                'paste',
                'pasteText',
                'pasteFromWord',
                '|',
                'undo',
                'redo',
                '|',
                'findAndReplace',
                'selectAll',
                'removeFormat',
                '|',
                'bold',
                'italic',
                'underline',
                'strikethrough',
                'subscript',
                'superscript',
                '|',
                'numberedList',
                'bulletedList',
                '-',
                'outdent',
                'indent',
                '|',
                'blockQuote',
                'createDivContainer',
                '|',
                'justifyLeft',
                'justifyCenter',
                'justifyRight',
                'justifyBlock',
                '|',
                'link',
                'unlink',
                'anchor',
                '|',
                'imageUpload',
                'flash',
                'table',
                'horizontalLine',
                'specialCharacters',
                'pageBreak',
                '|',
                'styles',
                'format',
                'font',
                'size',
                'textColor',
                'backgroundColor',
                '|',
                'maximize',
                'showBlocks',
                'about',
              ],
              shouldNotGroupWhenFull: true,
            },
            // ... other configuration options
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            setContent(data);
          }}
        />
        </Form.Item> */}

        <Form.Item
          name="tags"
          label="Tags"
          rules={[{ required: true, message: "Please add at least one tag" }]}
        >
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder="Add tags"
            tokenSeparators={[","]}
          />
        </Form.Item>

      

        <Form.Item
          name="image"
          label="Blog Image"
          rules={[{ required: !url, message: "Please upload an image" }]}
        >
          <Upload {...uploadProps} maxCount={1}>
            <Button icon={<UploadOutlined />}>Upload Image</Button>
          </Upload>
        </Form.Item>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Blog"
            style={{ maxWidth: 200, marginBottom: 16 }}
          />
        )}
          <Form.Item
          name="imageName"
          label="Image Name"
        >
          <Input value={imageName} onChange={(e) => setImageName(e.target.value)} />
        </Form.Item>
        

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {url ? "Update Blog" : "Create Blog"}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate("/blogs")}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BlogForm;
