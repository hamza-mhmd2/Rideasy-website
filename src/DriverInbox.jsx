import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io("http://localhost:8000");

const DriverInbox = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const driverId = localStorage.getItem('id');

    // Fetch initial messages from the server
    fetch(`/api/v1/chats/driver/${driverId}`)
      .then(res => res.json())
      .then(data => setMessages(data));

    // Listen for new chat messages
    socket.on("newMessage", (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
      console.log(message);

    });
  }, []);

  return (
    <div>
      <h2>Driver's Inbox</h2>
      <ul>
      {messages.map((msg, index) => (
  <li key={index}>
    <strong>{msg.sender?.username || 'Unknown Sender'}</strong>: {msg.message}
    
  </li>
))}
      </ul>
    </div>
  );
};

export default DriverInbox;
