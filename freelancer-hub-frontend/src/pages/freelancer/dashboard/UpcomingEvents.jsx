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

  // Open/Close Modal Handlers
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
      Authorization: `Bearer ${accessToken}`, // Return the header object directly
    };
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        // Prepare event data
        const deleteEventData = {
          id: selectedEvent.id, // Pass the event ID
        };
        await axios.delete(
          `http://127.0.0.1:8000/api/client/events/delete_event/`,
          { 
            headers: getAuthHeaders(),
            data: deleteEventData, // Pass the ID in the request body (using `data` for DELETE)
          }
        );
        setEvents(events.filter((event) => event.id !== selectedEvent.id));
        message.success('Event deleted successfully!');
        fetchEvents();
        handleBaseCancel(); // Assuming this cancels a modal or closes a UI element
      } catch (error) {
        message.error('Failed to delete event. Please try again later.');
        console.error(error);
      }
    }
  };
  
  

  // Handle Date Click
  const handleDateClick = (e) => {
    if (selectedDate) {
      selectedDate.style.backgroundColor = 'unset';
    }
    e.dayEl.style.backgroundColor = 'red';
    setSelectedDate(e.dayEl);
    setSelectedEvent(null); // Reset selected event
    showBaseModal();
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/client/events/', {
        headers: getAuthHeaders(),
      });
      setEvents(response.data); // Set events to state
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  // Create Event
  const handleCreateEvent = async () => {
    if (newEvent.trim()) {
      setEvents([...events, { title: newEvent, start: selectedDate.dataset.date }]);
      try {
        const newEventData = {
          title: newEvent,
          start: selectedDate.dataset.date,
        };

        await axios.post(
          'http://127.0.0.1:8000/api/client/events/create_event/',
          newEventData,
          { headers: getAuthHeaders() }
        );
        message.success('Event created successfully!');
        setNewEvent('');
        fetchEvents(); // Refresh the event list
        handleCreateCancel();
      } catch (error) {
        message.error('Error creating event');
      }
    } else {
      message.error('Please enter an event title!');
    }
  };

  // Update Event
  const handleUpdateEvent = async () => {
    if (newEvent.trim()) {
      const updatedEventData = {
        id: selectedEvent.id,  // Include the event ID for the update
        title: newEvent,       // New event title
      };
  
      try {
        await axios.put(
          `http://127.0.0.1:8000/api/client/events/update_event/`, // Use PUT with the event ID in the URL
          updatedEventData,
          { headers: getAuthHeaders() } // Fix the header typo, should be "headers"
        );
  
        // Update event in local state
        setEvents(
          events.map((event) =>
            event.id === selectedEvent.id ? { ...event, title: newEvent } : event
          )
        );
        
        message.success('Event updated successfully!');
        setNewEvent('');
        fetchEvents(); // Refresh the event list
        handleUpdateCancel(); // Assuming this cancels the update form/modal
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
  events={events} // Pass events here
  height="600px"
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
    // You can use `eventInfo.event` to get the event details
    const { event } = eventInfo;
    return (
      <div style={{ padding: '5px', backgroundColor: event.extendedProps.color }}>
        <strong>{event.title}</strong>
        {/* You can add more details here */}
      </div>
    );
  }}
  eventColor="#008080" // Customize event color
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
/>


      {/* Base Modal */}
      <Modal
        title="Event Actions"
        open={isBaseModalOpen}
        onCancel={handleBaseCancel}
        footer={null}
        width={300}
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
