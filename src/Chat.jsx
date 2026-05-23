import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const Chat = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const seller = location.state;

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const receiver = seller?.sellerEmail || seller?.email;

  // 🔥 LOAD OLD MESSAGES
  useEffect(() => {
    fetch(`http://localhost:5000/messages/${user.email}/${receiver}`)
      .then(res => res.json())
      .then(data => setChat(data));
  }, []);

  // 🔥 SOCKET
  useEffect(() => {
    socket.emit("join", user.email);

    socket.on("receiveMessage", (msg) => {
      setChat(prev => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  // SEND
  const sendMessage = () => {
    if (!message) return;

    socket.emit("sendMessage", {
      to: receiver,
      message,
      from: user.email,
    });

    setMessage("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>💬 Chat</h2>

      <div style={{
        height: "400px",
        overflowY: "auto",
        border: "1px solid #ccc",
        padding: 10,
        marginBottom: 10
      }}>
        {chat.map((c, i) => (
          <div
            key={i}
            style={{
              textAlign: c.from === user.email ? "right" : "left",
              margin: "8px 0"
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 10,
                background: c.from === user.email ? "#4caf50" : "#eee",
                color: c.from === user.email ? "#fff" : "#000"
              }}
            >
              {c.message}
            </span>
          </div>
        ))}
      </div>

      <input
        style={{ width: "70%", padding: 10 }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
      />

      <button onClick={sendMessage} style={{ padding: 10 }}>
        Send
      </button>
    </div>
  );
};

export default Chat;