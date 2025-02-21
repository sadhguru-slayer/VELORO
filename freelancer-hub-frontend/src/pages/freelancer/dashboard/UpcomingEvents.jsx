import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import timeGridPlugin from '@fullcalendar/timegrid';
import { Button, Modal, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const UpcomingEvents = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isUpdateEventModalOpen, setIsUpdateEventModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

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
        setEvents(events.filter((event) => event.id !== selectedEvent.id));
        message.success('Event deleted successfully!');
        fetchEvents();
        handleBaseCancel();
      } catch (error) {
        message.error('Failed to delete event. Please try again later.');
        console.error(error);
      }
    }
  };

  const handleDateClick = (e) => {
    if (selectedDate) {
      selectedDate.style.backgroundColor = 'unset';
    }
    e.dayEl.style.backgroundColor = 'red';
    setSelectedDate(e.dayEl);
    setSelectedEvent(null);
    showBaseModal();
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/client/events/', {
        headers: getAuthHeaders(),
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async () => {
    if (newEvent.trim()) {
      setEvents([...events, { title: newEvent, start: selectedDate.dataset.date }]);
      try {
        const newEventData = { title: newEvent, start: selectedDate.dataset.date };
        await axios.post(
          'http://127.0.0.1:8000/api/client/events/create_event/',
          newEventData,
          { headers: getAuthHeaders() }
        );
        message.success('Event created successfully!');
        setNewEvent('');
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
      const updatedEventData = { id: selectedEvent.id, title: newEvent };

      try {
        await axios.put(
          `http://127.0.0.1:8000/api/client/events/update_event/`,
          updatedEventData,
          { headers: getAuthHeaders() }
        );

        setEvents(
          events.map((event) =>
            event.id === selectedEvent.id ? { ...event, title: newEvent } : event
          )
        );
        message.success('Event updated successfully!');
        setNewEvent('');
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

  return (
    <div className="mt-6 bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto" // Allow calendar height to adjust based on viewport
        headerToolbar={{
          start: 'prev,next today',
          center: 'title',
          end: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        eventClick={(info) => {
          setSelectedEvent(info.event);
          showBaseModal();
        }}
        dateClick={handleDateClick}
        eventContent={(eventInfo) => {
          const { event } = eventInfo;
          return (
            <div style={{ padding: '5px', backgroundColor: event.extendedProps.color }}>
              <strong>{event.title}</strong>
            </div>
          );
        }}
        eventColor="#008080"
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
        }}
        customButtons={{
          myCustomButton: {
            text: 'Custom',
            click: () => alert('Custom Button Clicked!'),
          },
        }}
        // Responsiveness
        windowResize={true} // Automatically adjust when the window is resized
      />

      {/* Base Modal */}
      <Modal
        title="Event Actions"
        open={isBaseModalOpen}
        onCancel={handleBaseCancel}
        footer={null}
        width="100%" // Make it full width on small screens
        style={{ maxWidth: '300px' }} // Set maxWidth for larger screens
      >
        <div className="content w-full h-full p-2 flex flex-col gap-2">
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
        </div>
      </Modal>

      {/* Create Event Modal */}
      <Modal
        title="Create Event"
        open={isCreateEventModalOpen}
        onCancel={handleCreateCancel}
        onOk={handleCreateEvent}
        width="100%" // Make it responsive
        style={{ maxWidth: '400px' }}
      >
        <Input
          placeholder="Enter event title"
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
        />
      </Modal>

      {/* Update Event Modal */}
      <Modal
        title="Update Event"
        open={isUpdateEventModalOpen}
        onCancel={handleUpdateCancel}
        onOk={handleUpdateEvent}
        width="100%" // Make it responsive
        style={{ maxWidth: '400px' }}
      >
        <Input
          placeholder="Enter new event title"
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default UpcomingEvents;
