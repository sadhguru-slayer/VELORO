import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Button, Modal, Input, message, Table, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const UpcomingEvents = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isUpdateEventModalOpen, setIsUpdateEventModalOpen] = useState(false);
  const [events, setEvents] = useState({ Meeting: [], Deadline: [], Others: [] });
  const [newEvent, setNewEvent] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notificationTime, setNotificationTime] = useState(1440); // Default 1 day (in minutes)

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

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        const deleteEventData = { id: selectedEvent.id };
        await axios.delete(
          `http://127.0.0.1:8000/api/client/events/delete_event/`,
          {
            headers: getAuthHeaders(),
            data: deleteEventData,
          }
        );
        setEvents((prevEvents) => {
          const updatedEvents = { ...prevEvents };
          updatedEvents[selectedEvent.type] = updatedEvents[selectedEvent.type].filter(
            (event) => event.id !== selectedEvent.id
          );
          return updatedEvents;
        });
        message.success('Event deleted successfully!');
        handleBaseCancel();
      } catch (error) {
        message.error('Failed to delete event. Please try again later.');
        console.error(error);
      }
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
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async () => {
    if (newEvent.trim()) {
      try {
        const newEventData = {
          title: newEvent,
          start: selectedDate.dataset.date, // Ensure it's YYYY-MM-DD
          notification_time: notificationTime,
        };
        await axios.post(
          'http://127.0.0.1:8000/api/client/events/create_event/',
          newEventData,
          { headers: getAuthHeaders() }
        );
        message.success('Event created successfully!');
        fetchEvents();
        handleCreateCancel();
      } catch (error) {
        message.error('Error creating event');
      }
    } else {
      message.error('Please enter an event title!');
    }
  };

  const handleUpdateEvent = async () => {
    if (newEvent.trim()) {
      const updatedEventData = { id: selectedEvent.id, title: newEvent, notification_time: notificationTime };

      try {
        await axios.put(
          `http://127.0.0.1:8000/api/client/events/update_event/`,
          updatedEventData,
          { headers: getAuthHeaders() }
        );

        setEvents((prevEvents) => {
          const updatedEvents = { ...prevEvents };
          updatedEvents[selectedEvent.type] = updatedEvents[selectedEvent.type].map((event) =>
            event.id === selectedEvent.id ? { ...event, title: newEvent } : event
          );
          return updatedEvents;
        });
        message.success('Event updated successfully!');
        fetchEvents();
        handleUpdateCancel();
      } catch (error) {
        message.error('Failed to update event. Please try again later.');
        console.error(error);
      }
    } else {
      message.error('Please enter an event title!');
    }
  };

  const eventColumns = [
    {
      title: 'Event Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Date',
      dataIndex: 'start',
      key: 'start',
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
              showUpdateEventModal();
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              setSelectedEvent(event);
              handleDeleteEvent();
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-teal-600">Upcoming Events</h2>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={events.Meeting.concat(events.Deadline, events.Others)}
        height="auto"
        headerToolbar={{
          start: 'prev,next today',
          center: 'title',
          end: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        eventClick={(info) => {
          setSelectedEvent(info.event);
          showBaseModal();
        }}
        dateClick={(e) => {
          if (selectedDate) {
            selectedDate.style.backgroundColor = 'unset';
          }
          e.dayEl.style.backgroundColor = 'red';
          setSelectedDate(e.dayEl);
          setSelectedEvent(null);
          showBaseModal();
        }}
      />

      {/* Event List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4 text-teal-600">Event List</h3>

        {Object.entries(events).map(([type, eventList]) => (
          eventList.length > 0 && (
            <div key={type} className="mb-6">
              <h4 className="text-xl font-semibold text-teal-600">{type} Events</h4>
              <Table
                dataSource={eventList}
                columns={eventColumns}
                rowKey="id"
                pagination={false}
              />
            </div>
          )
        ))}
      </div>

      {/* Base Modal */}
      <Modal
        title="Event Actions"
        open={isBaseModalOpen}
        onCancel={handleBaseCancel}
        footer={null}
      >
        <Button
          icon={<PlusOutlined />}
          className="w-full"
          onClick={showCreateEventModal}
        >
          Create Event
        </Button>
        {selectedEvent && (
          <>
            <Button
              icon={<EditOutlined />}
              className="w-full"
              onClick={showUpdateEventModal}
            >
              Update Event
            </Button>
            <Button
              icon={<DeleteOutlined />}
              className="w-full"
              danger
              onClick={handleDeleteEvent}
            >
              Delete Event
            </Button>
          </>
        )}
      </Modal>

      {/* Create Event Modal */}
      <Modal
        title="Create Event"
        open={isCreateEventModalOpen}
        onCancel={handleCreateCancel}
        onOk={handleCreateEvent}
        width="100%"
        style={{ maxWidth: '400px' }}
      >
        <Input
          placeholder="Enter event title"
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
        />
        <Select
          value={notificationTime}
          onChange={(value) => setNotificationTime(value)}
          style={{ width: '100%', marginTop: 10 }}
        >
          <Select.Option value={60}>1 Hour</Select.Option>
          <Select.Option value={180}>3 Hours</Select.Option>
          <Select.Option value={360}>6 Hours</Select.Option>
          <Select.Option value={1440}>1 Day</Select.Option>
          <Select.Option value={4320}>3 Days</Select.Option>
          <Select.Option value={10080}>1 Week</Select.Option>
        </Select>
      </Modal>

      {/* Update Event Modal */}
      <Modal
        title="Update Event"
        open={isUpdateEventModalOpen}
        onCancel={handleUpdateCancel}
        onOk={handleUpdateEvent}
        width="100%"
        style={{ maxWidth: '400px' }}
      >
        <Input
          placeholder="Enter new event title"
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
        />
        <Select
          value={notificationTime}
          onChange={(value) => setNotificationTime(value)}
          style={{ width: '100%', marginTop: 10 }}
        >
          <Select.Option value={60}>1 Hour</Select.Option>
          <Select.Option value={180}>3 Hours</Select.Option>
          <Select.Option value={360}>6 Hours</Select.Option>
          <Select.Option value={1440}>1 Day</Select.Option>
          <Select.Option value={4320}>3 Days</Select.Option>
          <Select.Option value={10080}>1 Week</Select.Option>
        </Select>
      </Modal>
    </div>
  );
};
export default UpcomingEvents;