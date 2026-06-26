import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

const Chat = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const navigate = useNavigate();
  const seller = location.state;

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const chatEndRef = useRef(null);

  const receiver = seller?.sellerEmail || seller?.email;

  // 🔥 REDIRECT IF NOT LOGGED IN
  useEffect(() => {
    if (!user) {
      alert("Please login first to chat.");
      navigate("/");
    }
  }, [user, navigate]);

  // 🔥 LOAD OLD MESSAGES
  useEffect(() => {
    if (!user || !receiver) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(from.eq.${user.email},to.eq.${receiver}),and(from.eq.${receiver},to.eq.${user.email})`
        )
        .order("created_at", { ascending: true });

      if (!error) setChat(data || []);
    };

    loadMessages();
  }, [receiver]);

  // 🔥 SUPABASE REALTIME for messages
  useEffect(() => {
    if (!user || !receiver) return;

    const channel = supabase
      .channel(`chat-${user.email}-${receiver}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          // Only add if it's a message between these two users
          if (
            (msg.from === user.email && msg.to === receiver) ||
            (msg.from === receiver && msg.to === user.email)
          ) {
            setChat((prev) => {
              // Avoid duplicates (INSERT event fires for the sender too)
              const exists = prev.some((m) => m.id === msg.id);
              if (exists) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, receiver]);

  // 🔥 SCROLL TO BOTTOM
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // SEND
  const sendMessage = async () => {
    if (!message || !user || !receiver) return;

    const { error } = await supabase
      .from("messages")
      .insert({
        from: user.email,
        to: receiver,
        message,
      });

    if (error) {
      console.log(error);
    }

    setMessage("");
  };

  if (!user) {
    return <div style={{ padding: 20 }}>Redirecting to Login...</div>;
  }

  if (!receiver) {
    return (
      <div style={{ padding: 20 }}>
        <h2>💬 Chat</h2>
        <p>No chat recipient selected. Please select a user from the dashboard.</p>
        <button onClick={() => navigate(-1)} style={{ padding: 10, cursor: "pointer" }}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>💬 Chatting with {seller?.sellerName || seller?.name || receiver}</h2>

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
        <div ref={chatEndRef} />
      </div>

      <input
        style={{ width: "70%", padding: 10 }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
      />

      <button onClick={sendMessage} style={{ padding: 10, marginLeft: 10, cursor: "pointer" }}>
        Send
      </button>

      <button onClick={() => navigate(-1)} style={{ padding: 10, marginLeft: 10, cursor: "pointer" }}>
        Back
      </button>
    </div>
  );
};

export default Chat;