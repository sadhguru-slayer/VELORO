import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';

const { Dragger } = Upload;

const FileUpload = ({ onUpload }) => {
  const [fileList, setFileList] = useState([]);
  const role = Cookies.get('role');
  const isClient = role === 'client';
  const themeColor = isClient ? 'teal' : 'violet';

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const props = {
    name: 'file',
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      if (file.size > MAX_FILE_SIZE) {
        message.error(`${file.name} is too large. File size limit is 10MB`);
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    onChange: (info) => {
      const { status } = info.file;
      
      if (status === 'done') {
        message.success(`${info.file.name} uploaded successfully.`);
        if (onUpload) onUpload(info.file);
      } else if (status === 'error') {
        message.error(`${info.file.name} upload failed.`);
      }
      
      setFileList(info.fileList);
    },
    onDrop: (e) => {
      console.log('Dropped files', e.dataTransfer.files);
    },
    // Placeholder for backend integration
    customRequest: ({ file, onSuccess }) => {
      // <!-- BACKEND_TODO: Implement file upload to server -->
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    }
  };

  return (
    <div className="w-full p-4">
      <Dragger {...props} className={`bg-${themeColor}-50 hover:bg-${themeColor}-100 
        border-2 border-dashed border-${themeColor}-200 rounded-lg transition-colors`}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined className={`text-${themeColor}-500`} />
        </p>
        <p className={`ant-upload-text text-${themeColor}-700`}>
          Click or drag files here to upload
        </p>
        <p className="ant-upload-hint text-gray-500">
          Maximum file size: 10MB
        </p>
      </Dragger>
    </div>
  );
};

export default FileUpload;
