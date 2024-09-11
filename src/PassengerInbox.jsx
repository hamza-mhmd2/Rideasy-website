import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io("http://localhost:8000");

const PassengerInbox = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const passengerId = localStorage.getItem('id');

    // Fetch initial messages
    fetch(`/api/v1/chats/passenger/${passengerId}`)
      .then(res => res.json())
      .then(data => setMessages(data));

    // Listen for new messages
    socket.on("newMessage", (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });
  }, []);

  return (
    <div>
      <h2>Passenger's Inbox</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.sender.username}</strong>: {msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PassengerInbox;
