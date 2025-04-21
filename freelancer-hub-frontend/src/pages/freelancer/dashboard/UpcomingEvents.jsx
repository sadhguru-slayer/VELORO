import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Button, Modal, Input, message, Table, Select, Badge, Tag } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CalendarOutlined,
  ClockCircleOutlined,
  BellOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  EyeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';

const UpcomingEvents = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isUpdateEventModalOpen, setIsUpdateEventModalOpen] = useState(false);
  const [events, setEvents] = useState({ Meeting: [], Deadline: [], Others: [] }); // Initialize with empty arrays
  const [newEvent, setNewEvent] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notificationTime, setNotificationTime] = useState(1440); // Default 1 day (in minutes)
  const [eventType, setEventType] = useState('Meeting');
  const [openDropdown, setOpenDropdown] = useState(null); // For mobile dropdown

  const showBaseModal = () => setIsBaseModalOpen(true);
  const handleBaseCancel = () => setIsBaseModalOpen(false);

  const showCreateEventModal = () => {
    setIsCreateEventModalOpen(true);
    handleBaseCancel();
  };
  const handleCreateCancel = () => setIsCreateEventModalOpen(false);

  const showUpdateEventModal = () => {
    setIsUpdateEventModalOpen(true);
    handleBaseCancel();
  };
  const handleUpdateCancel = () => setIsUpdateEventModalOpen(false);

  const getAuthHeaders = () => {
    const accessToken = Cookies.get('accessToken');
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  };

  const handleDeleteEvent = async (eventdataId) => {
    console.log(eventdataId, eventType);
    if (!eventdataId || !eventType) {
      message.error('No event selected or event type is undefined.');
      return;
    }

    // Optimistically update the state
    const updatedEvents = { ...events };
    updatedEvents[eventType] = updatedEvents[eventType].filter(
      (event) => event.id !== eventdataId
    );
    setEvents(updatedEvents);

    try {
      const deleteEventData = { id: eventdataId, type: eventType };
      await axios.delete(
        `http://127.0.0.1:8000/api/client/events/delete_event/`,
        {
          headers: getAuthHeaders(),
          data: deleteEventData,
        }
      );
      message.success('Event deleted successfully!');
      handleBaseCancel();
    } catch (error) {
      message.error('Failed to delete event. Please try again later.');
      // Revert the optimistic update if the API call fails
      setEvents(events);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/client/events/', {
        headers: getAuthHeaders(),
      });
      const groupedEvents = { Meeting: [], Deadline: [], Others: [] };
      response.data.forEach((event) => {
        if (event.type === 'Meeting') {
          groupedEvents.Meeting.push(event);
        } else if (event.type === 'Deadline') {
          groupedEvents.Deadline.push(event);
        } else {
          groupedEvents.Others.push(event);
        }
      });
      setEvents(groupedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Set events to default empty state if API call fails
      setEvents({ Meeting: [], Deadline: [], Others: [] });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async () => {
    if (newEvent.trim()) {
      const newEventData = {
        title: newEvent,
        start: selectedDate.dataset.date, // Ensure it's YYYY-MM-DD
        notification_time: notificationTime,
        type: eventType,
      };

      // Optimistically update the state
      const updatedEvents = { ...events };
      updatedEvents[eventType] = [...updatedEvents[eventType], { ...newEventData, id: Date.now() }]; // Temporary ID
      setEvents(updatedEvents);

      try {
        await axios.post(
          'http://127.0.0.1:8000/api/client/events/create_event/',
          newEventData,
          { headers: getAuthHeaders() }
        );
        message.success('Event created successfully!');
        fetchEvents(); // Fetch events to get the latest data
        handleCreateCancel();
      } catch (error) {
        message.error('Error creating event');
        // Revert the optimistic update if the API call fails
        setEvents(events);
      }
    } else {
      message.error('Please enter an event title!');
    }
  };

  const handleUpdateEvent = async (selectedEvent,eventType) => {
    if (newEvent.trim() && selectedEvent) {
        const updatedEventData = { 
            id: selectedEvent.id, 
            title: newEvent, 
            notification_time: notificationTime,
            type: eventType || selectedEvent.type // Ensure eventType is included
        };

        // Optimistically update the state
        const updatedEvents = { ...events };

        // Check if the selectedEvent.type exists in updatedEvents
        if (updatedEvents[eventType]) {
            updatedEvents[eventType] = updatedEvents[eventType].map((event) =>
                event.id === selectedEvent.id ? { ...event, title: newEvent, type: eventType } : event
            );
            setEvents(updatedEvents);
        } else {
            message.error('Event type not found in the events list.');
            return; // Exit the function if the type is not found
        }

        console.log('Updating event with data:', updatedEventData);

        try {
            await axios.put(
                `http://127.0.0.1:8000/api/client/events/update_event/`,
                updatedEventData,
                { headers: getAuthHeaders() }
            );
            message.success('Event updated successfully!');
            fetchEvents(); // Fetch events to get the latest data
            handleUpdateCancel();
        } catch (error) {
            message.error('Failed to update event. Please try again later.');
            // Revert the optimistic update if the API call fails
            setEvents(events);
        }
    } else {
        message.error('Please enter an event title!');
    }
};

  const eventTypes = [
    { value: 'Meeting', icon: <TeamOutlined />, color: 'bg-blue-500' },
    { value: 'Deadline', icon: <ClockCircleOutlined />, color: 'bg-red-500' },
    { value: 'Others', icon: <FileTextOutlined />, color: 'bg-purple-500' }
  ];

  const getEventTypeColor = (type) => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType?.color || 'bg-gray-500';
  };

  const eventColumns = [
    {
      title: 'Event Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <div className="flex items-center space-x-2">
          {eventTypes.find(t => t.value === type)?.icon}
          <span className={`px-2 py-1 rounded-full text-xs text-white ${getEventTypeColor(type)}`}>
            {type}
          </span>
        </div>
      ),
    },
    {
      title: 'Event Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Date',
      dataIndex: 'start',
      key: 'start',
      render: (text, event) => (
        <span>{event.start ? formatDate(event.start) : 'N/A'}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text, event) => (
        <div>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedEvent(event);
              setNewEvent(event.title);
              setNotificationTime(event.notification_time || 1440); // Set notification time when editing
              setEventType(event.type); // Set the event type for editing
              showUpdateEventModal();
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              setSelectedEvent(event);
              handleDeleteEvent(event.id);
            }}
          />
        </div>
      ),
    },
  ];

  const handleEventClick = (event) => {
    // Pass the entire event object to the modal
    setSelectedEvent(event); // Set the selected event data
    setEventType(event.extendedProps.type); // Set the event type for editing
    showBaseModal(); // Show the modal for update/delete options
  };

  // Add this function to check if a date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  // Modify the handleDateClick function
  const handleDateClick = (e) => {
    const clickedDate = new Date(e.dateStr);
    if (isPastDate(clickedDate)) {
      message.warning("Cannot create events for past dates");
      return;
    }
    
    setNewEvent('');
    setSelectedEvent(null);
    setSelectedDate(e.dayEl);
    showCreateEventModal();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(); // Format the date as a string (e.g., "MM/DD/YYYY")
  };

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      {/* Refined Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold text-violet-800/90 mb-2">Upcoming Events</h2>
        <p className="text-gray-500">Manage your schedule and important deadlines</p>
      </motion.div>

      {/* Enhanced Calendar Container */}
      <div className="calendar-container bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-violet-100/30 overflow-hidden mb-8">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={events.Meeting.concat(events.Deadline, events.Others)}
          height="auto"
          headerToolbar={{
            start: 'prev,next today',
            center: 'title',
            end: 'timeGridWeek,dayGridMonth'
          }}
          eventClick={(info) => handleEventClick(info.event)}
          dateClick={handleDateClick}
          dayCellClassNames={(arg) => {
            return isPastDate(arg.date) ? 'past-date' : '';
          }}
          validRange={{
            start: new Date() // This will hide all past dates
          }}
          eventContent={(eventInfo) => ({
            html: `
              <div class="event-content ${getEventTypeColor(eventInfo.event.extendedProps.type)}">
                <span class="event-title">${eventInfo.event.title}</span>
              </div>
            `
          })}
        />
      </div>

      <div className="mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-teal-600 flex items-center gap-2 mb-4 sm:mb-0">
            <FileTextOutlined /> Event List
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          {eventTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setEventType(type.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${eventType === type.value 
                  ? `${type.color} text-white shadow-md` 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {type.icon}
              <span>{type.value}</span>
              <Badge 
                count={events[type.value]?.length || 0}
                showZero
                className="flex items-center justify-center"
                style={{ 
                  backgroundColor: type.color.replace('bg-', ''),
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '10px',
                  padding: '0 6px',
                  fontSize: '12px',
                  lineHeight: '20px'
                }}
              />
            </button>
          ))}
        </div>

        {/* Mobile View */}
        <div className="block md:hidden space-y-4">
          <AnimatePresence>
            {(events[eventType] || []).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <Tag color={getEventTypeColor(event.type)}>
                      {event.type}
                    </Tag>
                  </div>
                </div>

                <AnimatePresence>
                  {openDropdown === index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="border-t border-gray-200 overflow-hidden"
                    >
                      <div className="p-4 space-y-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarOutlined />
                          <span>{event.start ? formatDate(event.start) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                              setSelectedEvent(event);
                              setNewEvent(event.title);
                              setNotificationTime(event.notification_time || 1440); // Set notification time when editing
                              setEventType(event.type); // Set the event type for editing
                              showUpdateEventModal();
                            }}
                          />
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => {
                              setSelectedEvent(event);
                              handleDeleteEvent(event.id);
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
          <Table
            dataSource={events[eventType] || []} // Fallback to empty array if undefined
            columns={eventColumns}
            rowKey="id"
            pagination={false}
            className="custom-table"
            scroll={{ x: true }}
          />
        </div>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-teal-600">
            {selectedEvent ? <EditOutlined /> : <PlusOutlined />}
            <span>{selectedEvent ? 'Update Event' : 'Create Event'}</span>
          </div>
        }
        open={isCreateEventModalOpen || isUpdateEventModalOpen}
        onCancel={() => {
          handleCreateCancel();
          handleUpdateCancel();
        }}
        footer={null}
        className="custom-modal"
        width={window.innerWidth < 768 ? '90%' : '50%'}
      >
        <div className="space-y-4 p-4">
          {/* Event Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            {eventTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setEventType(type.value)}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all
                  ${eventType === type.value 
                    ? `border-${type.color} ${type.color} text-white` 
                    : 'border-gray-200 hover:border-gray-300'}`}
              >
                {type.icon}
                <span className="text-sm mt-1">{type.value}</span>
              </button>
            ))}
          </div>

          {/* Event Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Event Title</label>
            <Input
              prefix={<FileTextOutlined className="text-gray-400" />}
              placeholder="Enter event title"
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              className="rounded-lg"
            />
          </div>

          {/* Notification Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Notification Time</label>
            <Select
              value={notificationTime}
              onChange={(value) => setNotificationTime(value)}
              className="w-full"
              suffixIcon={<BellOutlined className="text-gray-400" />}
            >
              <Select.Option value={60}>1 Hour Before</Select.Option>
              <Select.Option value={180}>3 Hours Before</Select.Option>
              <Select.Option value={360}>6 Hours Before</Select.Option>
              <Select.Option value={1440}>1 Day Before</Select.Option>
              <Select.Option value={4320}>3 Days Before</Select.Option>
              <Select.Option value={10080}>1 Week Before</Select.Option>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => {
              handleCreateCancel();
              handleUpdateCancel();
            }}>
              Cancel
            </Button>
            <Button
              type="primary"
              icon={selectedEvent ? <CheckCircleOutlined /> : <PlusOutlined />}
              onClick={()=>selectedEvent ? handleUpdateEvent(selectedEvent,eventType) : handleCreateEvent()}
              className="bg-teal-500 hover:bg-teal-600"
            >
              {selectedEvent ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal for Update/Delete Options */}
      <Modal
        title="Event Options"
        open={isBaseModalOpen}
        onCancel={handleBaseCancel}
        footer={null}
        className="custom-modal"
        width={window.innerWidth < 768 ? '90%' : '50%'}
      >
        <div className="p-4">
          {/* Display selected event details */}
          <h3 className="text-lg font-semibold">Selected Event: {selectedEvent?.title}</h3>
          <div className="mt-4">
            <p><strong>Event Type:</strong> {eventType}</p>
            <p><strong>Date:</strong> {selectedEvent?.start ? formatDate(selectedEvent.start) : 'N/A'}</p>
            <p><strong>Notification Time:</strong> {selectedEvent?.notification_time}</p>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setNewEvent(selectedEvent?.title);
                setNotificationTime(selectedEvent?.notification_time || 1440);
                setEventType(selectedEvent?.type);
                showUpdateEventModal(); // Show the update modal
                handleBaseCancel(); // Close the options modal
              }}
            >
              Update
            </Button>
            <Button
              type="danger"
              icon={<DeleteOutlined />}
              onClick={() => {
                if (selectedEvent?.id && eventType) {
                  handleDeleteEvent(selectedEvent.id); // Pass event ID
                  handleBaseCancel(); // Close the options modal
                } else {
                  message.error('Event type or ID is missing!');
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Custom Header Layout */}
      <style jsx>{`
        /* Enhanced Calendar Styles */
        .calendar-container {
          transition: all 0.3s ease;
        }

        .calendar-container:hover {
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.05);
        }

        /* Header Toolbar */
        .calendar-container .fc-toolbar {
          padding: 1.5rem;
          background: linear-gradient(to right, rgba(139, 92, 246, 0.03), rgba(139, 92, 246, 0.08));
        }

        .calendar-container .fc-toolbar-title {
          color: rgb(79, 70, 229, 0.9);
          font-size: 1.25rem;
          font-weight: 600;
        }

        /* Button Styles */
        .calendar-container .fc-button-primary {
          background: rgb(139, 92, 246, 0.1) !important;
          border: 1px solid rgba(139, 92, 246, 0.2) !important;
          color: rgb(139, 92, 246, 0.8) !important;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .calendar-container .fc-button-primary:hover {
          background: rgb(139, 92, 246, 0.15) !important;
          border-color: rgba(139, 92, 246, 0.3) !important;
          color: rgb(139, 92, 246, 0.9) !important;
        }

        .calendar-container .fc-button-primary:not(:disabled):active,
        .calendar-container .fc-button-primary:not(:disabled).fc-button-active {
          background: rgb(139, 92, 246, 0.2) !important;
          border-color: rgba(139, 92, 246, 0.4) !important;
          color: rgb(139, 92, 246) !important;
        }

        /* Calendar Grid */
        .calendar-container .fc-theme-standard td,
        .calendar-container .fc-theme-standard th {
          border-color: rgba(139, 92, 246, 0.08);
        }

        .calendar-container .fc-day-today {
          background: rgba(139, 92, 246, 0.05) !important;
        }

        .calendar-container .fc-day-today .fc-daygrid-day-number {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgb(139, 92, 246);
        }

        /* Event Styles */
        .event-content {
          margin: 1px;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 0.75rem;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: all 0.2s ease;
        }

        .event-content:hover {
          transform: translateY(-1px);
        }

        .event-title {
          color: white;
          font-weight: 500;
        }

        /* Header Cells */
        .calendar-container .fc-col-header-cell {
          padding: 0.75rem 0;
          background: rgba(139, 92, 246, 0.03);
        }

        .calendar-container .fc-col-header-cell-cushion {
          color: rgb(79, 70, 229, 0.8);
          font-weight: 600;
          font-size: 0.875rem;
        }

        /* Day Numbers */
        .calendar-container .fc-daygrid-day-number {
          color: rgb(107, 114, 128);
          font-size: 0.875rem;
          padding: 0.5rem;
        }

        /* Week Numbers */
        .calendar-container .fc-daygrid-week-number {
          background: rgba(139, 92, 246, 0.05);
          color: rgb(139, 92, 246);
          border-radius: 0.25rem;
          padding: 0.25rem;
          font-size: 0.75rem;
        }

        /* More Events Popover */
        .calendar-container .fc-more-popover {
          border: 1px solid rgba(139, 92, 246, 0.1);
          border-radius: 0.5rem;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.05);
          background: white;
        }

        .calendar-container .fc-more-popover .fc-popover-header {
          background: rgba(139, 92, 246, 0.05);
          color: rgb(139, 92, 246);
          padding: 0.5rem;
          font-weight: 500;
        }

        /* Responsive Adjustments */
        @media (max-width: 640px) {
          .calendar-container .fc-toolbar {
            padding: 1rem;
          }

          .calendar-container .fc-toolbar-title {
            font-size: 1rem;
          }

          .calendar-container .fc-button {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
          }
        }

        /* Past Date Styling */
        .calendar-container .past-date {
          background-color: rgba(243, 244, 246, 0.5) !important;
          cursor: not-allowed !important;
        }

        .calendar-container .past-date .fc-daygrid-day-number {
          color: rgb(156, 163, 175) !important;
          opacity: 0.7;
        }

        /* Prevent hover effects on past dates */
        .calendar-container .past-date:hover {
          background-color: rgba(243, 244, 246, 0.5) !important;
        }

        /* Style for future dates */
        .calendar-container .fc-day-future {
          cursor: pointer;
        }

        .calendar-container .fc-day-future:hover {
          background-color: rgba(139, 92, 246, 0.05) !important;
        }

        /* Additional styles for better visual feedback */
        .calendar-container .fc-day-future.fc-day-today {
          background-color: rgba(139, 92, 246, 0.1) !important;
        }

        .calendar-container .fc-day-future.fc-day-today:hover {
          background-color: rgba(139, 92, 246, 0.15) !important;
        }

        /* Style for events in past dates */
        .calendar-container .past-date .event-content {
          opacity: 0.7;
          cursor: default;
        }
      `}</style>
    </div>
  );
};

export default UpcomingEvents;