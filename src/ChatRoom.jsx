import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';

const socket = io(process.env.REACT_APP_BACKEND_HOST);

const ChatRoom = () => {
  const { rideId } = useParams();
  const location = useLocation();
  const userId = localStorage.getItem('id');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Retrieve driver and passenger IDs from location state
  const { driverId, passengerId, role } = location.state || {};
  const receiverId = role === 'driver' ? passengerId : driverId; // Determine receiver based on role

  useEffect(() => {
    // Join the ride's chat room
    socket.emit('joinRoom', { roomId: rideId, userId });

    // Listen for incoming messages
    socket.on('newMessage', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Load previous chat messages
    const loadChatMessages = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_HOST}/api/v1/chat/messages/${rideId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to load chat messages:', error);
      }
    };

    loadChatMessages();

    return () => {
      socket.off('newMessage');
    };
  }, [rideId, userId]);

  const sendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        roomId: rideId,
        senderId: userId,
        receiverId, // Use the determined receiver ID
        message,
      };
    console.log(newMessage);
      try {
        await axios.post(`${process.env.REACT_APP_BACKEND_HOST}/api/v1/chat/message`, newMessage);
        setMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  return (
    <div className="chat-room">
      <h2>Chat Room for Ride: {rideId}</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.senderId === userId ? 'own' : 'other'}`}>
            <strong>{msg.senderId === userId ? 'You' : msg.senderId}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;
