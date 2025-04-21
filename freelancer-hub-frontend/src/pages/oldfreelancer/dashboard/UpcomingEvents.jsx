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

  const handleDateClick = (e) => {
    setNewEvent(''); // Reset the event title input
    setSelectedEvent(null); // Reset the selectedEvent to ensure a fresh event for creation
    setSelectedDate(e.dayEl); // Set the selected date
    showCreateEventModal(); // Show the modal for creating a new event
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(); // Format the date as a string (e.g., "MM/DD/YYYY")
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-violet-900 mb-2">Upcoming Events</h2>
        {/* Rest of your component content */}
      </motion.div>
      <div className="calendar-container rounded-lg shadow-md overflow-hidden mb-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={events.Meeting.concat(events.Deadline, events.Others)}
          height="auto"
          headerToolbar={{
            start: 'prev,next', // Left buttons
            center: 'title', // Month title
            end: 'today,timeGridWeek,dayGridMonth' // Right buttons including Month
          }}
          eventClick={(info) => handleEventClick(info.event)}
          dateClick={handleDateClick}
          eventContent={(eventInfo) => ({
            html: `
              <div class="flex items-center p-1 rounded ${getEventTypeColor(eventInfo.event.extendedProps.type)} text-white">
                <span class="text-sm font-medium">${eventInfo.event.title}</span>
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
        .custom-modal .ant-modal-content {
          border-radius: 1rem;
          overflow: hidden;
        }
        
        .custom-modal .ant-modal-header {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 1rem;
        }
        
        .custom-table .ant-table-thead > tr > th {
          background-color: #f8fafc;
          color: #64748b;
          font-weight: 600;
        }
        
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f1f5f9;
        }
        
        .calendar-container .fc-theme-standard {
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .calendar-container .fc-header-toolbar {
          display: grid;
          grid-template-columns: 1fr 1fr; /* Two columns for left and right */
          grid-template-rows: auto auto auto; /* Three rows for buttons and title */
          gap: 10px; /* Space between items */
          align-items: center; /* Center items vertically */
          padding: 1rem; /* Padding around the header */
        }

        .calendar-container .fc-toolbar-title {
          grid-column: 2; /* Place title in the second column */
          text-align: right; /* Align title to the right */
          font-size: 1.5rem; /* Adjust size */
          font-weight: bold; /* Make it bold */
          text-transform: capitalize; /* Capitalize the first letter */
        }

        .calendar-container .fc-button {
          text-transform: capitalize; /* Capitalize the first letter of buttons */
        }

        .calendar-container .fc-button-today {
          grid-column: 1; /* Place Today button under left buttons */
          grid-row: 2; /* Place in the second row */
          justify-self: start; /* Align to the start of the column */
        }

        .calendar-container .fc-button-timeGridWeek {
          grid-column: 2; /* Place Week button under the title */
          grid-row: 3; /* Place in the third row */
          justify-self: end; /* Align to the end of the column */
        }

        .calendar-container .fc-button-primary {
          background-color: #0d9488;
          border-color: #0d9488;
        }

        .calendar-container .fc-button-primary:hover {
          background-color: #0f766e;
          border-color: #0f766e;
        }

        .fc-daygrid-day-number {
          font-size: 0.9rem; /* Adjust the size of the day numbers */
        }

        .fc-daygrid-event {
          font-size: 0.8rem; /* Adjust the size of the event text */
        }
      `}</style>
    </div>
  );
};

export default UpcomingEvents;