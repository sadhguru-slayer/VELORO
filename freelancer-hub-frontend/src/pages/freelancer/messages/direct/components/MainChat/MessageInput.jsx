import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FaPaperclip, FaSmile, FaTimes, FaMicrophone, FaStopCircle } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { FileIcon, defaultStyles } from 'react-file-icon';
import { useMediaQuery } from 'react-responsive';
import { AudioVisualizer } from 'react-audio-visualize';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from 'antd';

// Add these constants at the top of the file
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'audio/mpeg',
  'video/mp4'
];

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [restrictionMessage, setRestrictionMessage] = useState('');

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle recording time
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime >= 300) { // 5 minutes (300 seconds)
            stopRecording();
          }
          return prevTime + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Send voice message
  const sendVoiceMessage = () => {
    if (audioBlob) {
      const voiceMessage = {
        id: uuidv4(),
        sender: 'You',
        content: 'Voice message',
        timestamp: new Date().toISOString(),
        avatar: 'https://ui-avatars.com/api/?name=You',
        isCurrentUser: true,
        isPinned: false,
        isEdited: false,
        reactions: [],
        attachments: [{
          id: uuidv4(),
          name: 'voice_message.wav',
          type: 'audio/wav',
          size: audioBlob.size,
          url: audioUrl
        }],
        metadata: {
          readBy: [],
          deliveredAt: new Date().toISOString(),
          readAt: null
        }
      };
      onSendMessage(voiceMessage);
      setAudioBlob(null);
      setAudioUrl(null);
    }
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      const newMessage = {
        id: uuidv4(),
        sender: 'You',
        content: message,
        timestamp: new Date().toISOString(),
        avatar: 'https://ui-avatars.com/api/?name=You',
        isCurrentUser: true,
        isPinned: false,
        isEdited: false,
        reactions: [],
        attachments: attachments.map(att => ({
          id: att.id,
          name: att.name,
          type: att.type,
          size: att.size,
          url: att.url
        })),
        metadata: {
          readBy: [],
          deliveredAt: new Date().toISOString(),
          readAt: null
        }
      };
      onSendMessage(newMessage);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    validateFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    validateFiles(files);
  };

  const validateFiles = (files) => {
    const validFiles = files.filter(file => {
      // Check for duplicate files
      const isDuplicate = attachments.some(att => 
        att.name === file.name && att.size === file.size
      );

      if (isDuplicate) {
        setRestrictionMessage({
          title: 'Duplicate File',
          message: `The file "${file.name}" is already selected.`,
          type: 'duplicate'
        });
        setShowRestrictionModal(true);
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        setRestrictionMessage({
          title: 'File Size Exceeded',
          message: `The file "${file.name}" exceeds the maximum size of 100MB.`,
          type: 'size'
        });
        setShowRestrictionModal(true);
        return false;
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setRestrictionMessage({
          title: 'File Type Not Allowed',
          message: `The file type "${file.type}" is not supported.`,
          type: 'type'
        });
        setShowRestrictionModal(true);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      addAttachments(validFiles);
    }
  };

  const addAttachments = (files) => {
    // Filter out any duplicates that might have slipped through
    const uniqueFiles = files.filter(file => 
      !attachments.some(att => 
        att.name === file.name && att.size === file.size
      )
    );

    const newAttachments = uniqueFiles.map(file => ({
      id: uuidv4(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      file // Keep the original file for upload
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };
  const visualizerRef = useRef<HTMLCanvasElement>(null)

  const renderAttachmentPreview = (attachment) => {
    const fileType = attachment.type.split('/')[0]; // e.g., 'image', 'video', 'application'
    const fileExtension = attachment.name.split('.').pop().toLowerCase();
    
    // Define icon styles for different file types
    const iconStyles = {
      pdf: { ...defaultStyles.pdf, color: '#FF0000' },
      doc: { ...defaultStyles.doc, color: '#2B579A' },
      docx: { ...defaultStyles.docx, color: '#2B579A' },
      xls: { ...defaultStyles.xls, color: '#217346' },
      xlsx: { ...defaultStyles.xlsx, color: '#217346' },
      ppt: { ...defaultStyles.ppt, color: '#D24726' },
      pptx: { ...defaultStyles.pptx, color: '#D24726' },
      zip: { ...defaultStyles.zip, color: '#808080' },
      txt: { ...defaultStyles.txt, color: '#000000' },
      mp3: { ...defaultStyles.mp3, color: '#0000FF' },
      mp4: { ...defaultStyles.mp4, color: '#FF0000' },
      default: { ...defaultStyles.default, color: '#808080' }
    };

    // Get the appropriate icon style
    const iconStyle = iconStyles[fileExtension] || iconStyles.default;

    // Slice file name if too long
    const displayName = attachment.name.length > 20 
      ? `${attachment.name.slice(0, 15)}...${fileExtension}`
      : attachment.name;

    if (fileType === 'image') {
      return (
        <div className="w-32 h-32 relative">
          <img
            src={attachment.url}
            alt={attachment.name}
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
            <p className="text-xs text-white truncate">{displayName}</p>
          </div>
        </div>
      );
    } else if (fileType === 'video') {
      return (
        <div className="w-32 h-32 relative">
          <video
            src={attachment.url}
            controls
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
            <p className="text-xs text-white truncate">{displayName}</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex-shrink-0">
            <FileIcon
              extension={fileExtension}
              {...iconStyle}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(attachment.size)}
            </p>
          </div>
        </div>
      );
    }
  };

  // Add the modal component
  const RestrictionModal = () => (
    <Modal
      title={
        <div className="text-lg font-semibold text-gray-900 pb-3 border-b">
          {restrictionMessage.title}
        </div>
      }
      open={showRestrictionModal}
      onOk={() => setShowRestrictionModal(false)}
      onCancel={() => setShowRestrictionModal(false)}
      okText="Got it"
      cancelText="Close"
      className="custom-modal"
      centered
      maskClosable={false}
      footer={null}
      closeIcon={
        <span className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      }
    >
      <div className="py-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            restrictionMessage.type === 'size' 
              ? 'bg-gradient-to-br from-red-100 to-pink-100' 
              : restrictionMessage.type === 'type'
              ? 'bg-gradient-to-br from-yellow-100 to-orange-100'
              : 'bg-gradient-to-br from-blue-100 to-purple-100'
          }`}>
            <svg className={`w-6 h-6 ${
              restrictionMessage.type === 'size' 
                ? 'text-red-500' 
                : restrictionMessage.type === 'type'
                ? 'text-yellow-500'
                : 'text-blue-500'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className={`text-gray-700 ${isMobile ? 'truncate' : 'break-words'}`}>
              {restrictionMessage.message}
            </p>
            {restrictionMessage.type === 'size' && (
              <div className="mt-3 p-3 bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg border border-violet-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-sm font-medium text-gray-800 ${isMobile ? 'truncate' : 'break-words'}`}>
                      <span className="text-violet-600">Pro</span> unlocks 1GB files
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Send bigger files, boost productivity
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Add your upgrade logic here
                      setShowRestrictionModal(false);
                    }}
                    className="flex-shrink-0 bg-gradient-to-r from-violet-500 to-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:from-violet-600 hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="relative w-full">
      {/* Fixed container for previews that appears above the input */}
      <div className="absolute bottom-full w-full mb-2 space-y-2">
        {/* Audio Blob Preview */}
        <AnimatePresence>
          {audioBlob && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-4 bg-white rounded-lg shadow-lg border border-gray-100"
            >
              <div className="mb-4 p-4 bg-gray-100/50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className="w-10 h-10 bg-violet-500 text-white rounded-full flex-shrink-0 flex justify-center items-center">
                    <FaMicrophone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Voice message</p>
                    <p className="text-xs text-gray-500">{formatFileSize(audioBlob.size)}</p>
                  </div>
                </div>
                <audio 
                  controls 
                  src={URL.createObjectURL(audioBlob)} 
                  className="w-full sm:w-auto rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={() => setAudioBlob(null)}
                  className="ml-auto p-2 text-gray-500 hover:text-red-500"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Recording Preview */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-lg shadow-lg p-4 border border-gray-100"
            >
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-500 text-white rounded-full flex items-center justify-center">
                    <FaMicrophone className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-violet-500 rounded-full opacity-25"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-violet-700 truncate">Recording...</p>
                  <p className="text-sm text-violet-600">{recordingTime}s</p>
                </div>
                {mediaRecorderRef.current && !isMobile && (
                  <div className="flex-1 hidden md:block">
                    <AudioVisualizer
                      mediaRecorder={mediaRecorderRef.current}
                      width={200}
                      height={40}
                      barWidth={2}
                      gap={1}
                      barColor="#8b5cf6"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachments Preview */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-lg shadow-lg p-4 border border-gray-100"
            >
              <div className={`grid ${
                isMobile 
                  ? 'grid-cols-1 sm:grid-cols-2' 
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              } gap-3`}>
                {attachments.map(attachment => (
                  <motion.div
                    key={attachment.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group w-full"
                  >
                    <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                      {renderAttachmentPreview(attachment)}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setAttachments(prev => prev.filter(att => att.id !== attachment.id))}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <FaTimes className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-t border-gray-100 p-3"
      >
        {/* Restriction Modal */}
        <RestrictionModal />

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full right-0 mb-2 shadow-xl rounded-lg overflow-hidden z-50"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                disableSearchBar
                disableSkinTonePicker
                width={isMobile ? '100%' : '350px'}
                height={300}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag-and-Drop Overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-violet-50/90 backdrop-blur-sm flex items-center justify-center rounded-lg z-10 border-2 border-dashed border-violet-300"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">📎</div>
                <p className="text-violet-600 font-medium">Drop files to upload</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Form - Always at the bottom */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-3 py-2 min-w-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="p-1.5 text-gray-500 hover:text-violet-500 transition-colors flex-shrink-0"
            >
              <FaPaperclip className="w-5 h-5" />
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </motion.button>

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-gray-700 placeholder-gray-400 min-w-0"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowEmojiPicker(false);
              }}
            />

            <div className="flex items-center gap-1 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 text-gray-500 hover:text-violet-500 transition-colors"
              >
                <FaSmile className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-1.5 ${
                  isRecording ? 'text-red-500' : 'text-gray-500 hover:text-violet-500'
                } transition-colors`}
              >
                {isRecording ? <FaStopCircle className="w-5 h-5" /> : <FaMicrophone className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="submit"
            className="p-2.5 bg-violet-500 text-white rounded-full hover:bg-violet-600 transition-colors shadow-lg flex-shrink-0"
            onClick={() => {
              if (isRecording) {
                stopRecording();
                sendVoiceMessage();
              } else if (audioBlob) {
                sendVoiceMessage();
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default MessageInput;
