import { useEffect, useRef, useState, useCallback } from 'react';
import Cookies from 'js-cookie';

const useWebSocket = (url, token, onMessage) => {
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const reconnectAttempts = useRef(0);
  const isUnmounting = useRef(false);
  
  // Constants
  const MAX_RECONNECT_ATTEMPTS = 3;
  const BASE_RECONNECT_INTERVAL = 5000;
  const MAX_RECONNECT_INTERVAL = 30000;

  // Check if browser is Brave
  const isBraveBrowser = useCallback(() => {
    return navigator.brave ? true : false;
  }, []);

  // Initialize WebSocket with browser-specific handling
  const initializeWebSocket = useCallback(() => {
    if (isUnmounting.current) return;

    try {
      // Close existing connection if any
      if (socketRef.current) {
        socketRef.current.close(1000, "New connection initializing");
      }

      // Add timestamp to URL to prevent caching
      const timestampedUrl = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
      const socket = new WebSocket(`ws://${window.location.host}/ws/notifications/?token=${token}`);
      socketRef.current = socket;

      // Set timeout for connection attempt
      const connectionTimeout = setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          socket.close();
          setError("Connection timeout");
        }
      }, 10000);

      socket.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log("WebSocket Connected ✅");
        setConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // Handle authentication with browser info
        if (token) {
          const authMessage = {
            type: "auth",
            token,
            timestamp: Date.now(),
            browser: isBraveBrowser() ? 'brave' : 'other',
            connectionId: Math.random().toString(36).substring(7)
          };
          socket.send(JSON.stringify(authMessage));
        }

        // Set up keepalive ping
        const pingInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "ping" }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000);

        // Clear ping interval on close
        socket.addEventListener('close', () => clearInterval(pingInterval));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Handle ping response separately
          if (data.type === "pong") return;
          onMessage(data);
        } catch (err) {
          console.warn("Error parsing WebSocket message:", err);
        }
      };

      socket.onclose = (event) => {
        clearTimeout(connectionTimeout);
        setConnected(false);

        if (isUnmounting.current) return;

        console.log(`WebSocket Disconnected: ${event.code} ${event.reason}`);

        // Handle reconnection with exponential backoff
        if (event.code !== 1000 && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current += 1;
          const delay = Math.min(
            BASE_RECONNECT_INTERVAL * Math.pow(2, reconnectAttempts.current - 1),
            MAX_RECONNECT_INTERVAL
          );

          console.log(`Reconnecting in ${delay/1000}s... (Attempt ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            initializeWebSocket();
          }, delay);
        } else if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          setError("Connection failed. Please refresh the page.");
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Implement reconnection logic here
      };

    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setError("Connection failed. Please check your internet connection.");
    }
  }, [url, token, onMessage, isBraveBrowser]);

  // Setup WebSocket connection
  useEffect(() => {
    isUnmounting.current = false;
    initializeWebSocket();

    // Add connection monitoring
    setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.CLOSED) {
        console.log('WebSocket disconnected. Reconnecting...');
        // Reconnect logic
        initializeWebSocket();
      }
    }, 5000);

    return () => {
      isUnmounting.current = true;
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounting");
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [initializeWebSocket]);

  // Helper function to send messages
  const sendMessage = useCallback((message) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageToSend = typeof message === 'string' ? message : JSON.stringify(message);
        socketRef.current.send(messageToSend);
        return true;
      } catch (err) {
        console.warn("Error sending message:", err);
        return false;
      }
    }
    return false;
  }, []);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    setError(null);
    initializeWebSocket();
  }, [initializeWebSocket]);

  return {
    connected,
    error,
    socketRef,
    sendMessage,
    reconnect
  };
};

export default useWebSocket;